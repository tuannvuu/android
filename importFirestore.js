const admin = require("firebase-admin");
const fs = require("fs");

console.log("🚀 Script started");

// Load service account
console.log("📦 Loading service account...");
const serviceAccount = require("./serviceAccountKey.json");

// Init Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("🔥 Firebase initialized");

const db = admin.firestore();

function importCollection(name, file) {
  console.log(`📥 Importing ${name}...`);

  if (!fs.existsSync(file)) {
    console.log(`⚠️ File ${file} không tồn tại – bỏ qua`);
    return Promise.resolve();
  }

  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const batch = db.batch();

  Object.keys(data).forEach((id) => {
    const ref = db.collection(name).doc(id);
    batch.set(ref, data[id]);
  });

  return batch.commit().then(() => {
    console.log(`✅ ${name} imported`);
  });
}

async function run() {
  try {
    console.log("📄 Reading JSON files...");

    await importCollection("cinemas", "./cinemas.json");
    await importCollection("movies", "./movies.json");
    await importCollection("showtimes", "./showtimes.json");
    await importCollection("bookings", "./bookings.json");
    await importCollection("payments", "./payments.json");

    console.log("🎉 IMPORT FIRESTORE HOÀN TẤT!");
    process.exit(0);
  } catch (err) {
    console.error("❌ IMPORT ERROR:", err);
    process.exit(1);
  }
}

run();
