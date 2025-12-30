const admin = require("firebase-admin");
const fs = require("fs");

// Load service account key
const serviceAccount = require("./serviceAccountKey.json");

// Init Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Read users.json
const usersData = JSON.parse(fs.readFileSync("./users.json", "utf8"));

async function importUsers() {
  const batch = db.batch();

  Object.keys(usersData).forEach((userId) => {
    const userRef = db.collection("users").doc(userId);

    batch.set(userRef, {
      ...usersData[userId],
      createdAt: new Date(usersData[userId].createdAt),
    });
  });

  await batch.commit();
  console.log("✅ Import USERS vào Firestore thành công!");
}

importUsers().catch(console.error);
