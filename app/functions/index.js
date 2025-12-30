const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/* ===========================
   MOVIES
=========================== */

// GET all movies
exports.getMovies = functions.https.onRequest(async (req, res) => {
  const snapshot = await db.collection("movies").get();
  const data = snapshot.docs.map(doc => doc.data());
  res.json(data);
});

// GET movie by id
exports.getMovieById = functions.https.onRequest(async (req, res) => {
  const { id } = req.query;
  const doc = await db.collection("movies").doc(id).get();
  res.json(doc.exists ? doc.data() : null);
});

/* ===========================
   CINEMAS
=========================== */

exports.getCinemas = functions.https.onRequest(async (req, res) => {
  const snapshot = await db.collection("cinemas").get();
  const data = snapshot.docs.map(doc => doc.data());
  res.json(data);
});

/* ===========================
   SHOWTIMES
=========================== */

exports.getShowtimesByMovie = functions.https.onRequest(async (req, res) => {
  const { movieId } = req.query;

  const snapshot = await db
    .collection("showtimes")
    .where("movieId", "==", movieId)
    .get();

  const data = snapshot.docs.map(doc => doc.data());
  res.json(data);
});

/* ===========================
   BOOKINGS
=========================== */

exports.createBooking = functions.https.onRequest(async (req, res) => {
  const booking = req.body;

  booking.createdAt = admin.firestore.FieldValue.serverTimestamp();

  await db.collection("bookings").add(booking);
  res.json({ success: true });
});

exports.getBookingsByUser = functions.https.onRequest(async (req, res) => {
  const { userId } = req.query;

  const snapshot = await db
    .collection("bookings")
    .where("userId", "==", userId)
    .get();

  const data = snapshot.docs.map(doc => doc.data());
  res.json(data);
});

/* ===========================
   PAYMENTS
=========================== */

exports.createPayment = functions.https.onRequest(async (req, res) => {
  const payment = req.body;

  payment.status = "paid";
  payment.createdAt = admin.firestore.FieldValue.serverTimestamp();

  await db.collection("payments").add(payment);
  res.json({ success: true });
});

/* ===========================
   USERS
=========================== */

exports.getUserById = functions.https.onRequest(async (req, res) => {
  const { userId } = req.query;

  const doc = await db.collection("users").doc(userId).get();
  res.json(doc.exists ? doc.data() : null);
});
