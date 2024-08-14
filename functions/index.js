const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.getReminders = functions.https.onRequest(async (req, res) => {
    const userId = req.query.userId;
    const date = req.query.date;

    if (!userId || !date) {
        return res.status(400).send("Missing userId or date parameter.");
    }

    try {
        const remindersRef = db.collection('reminders').doc(userId).collection(date);
        const snapshot = await remindersRef.get();

        if (snapshot.empty) {
            return res.status(404).send("No reminders found.");
        }

        let reminders = [];
        snapshot.forEach(doc => {
            reminders.push(doc.data());
        });

        return res.status(200).json(reminders);
    } catch (error) {
        console.error("Error fetching reminders:", error);
        return res.status(500).send("Internal Server Error");
    }
});
