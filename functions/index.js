const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
admin.initializeApp();

// Access Firestore via the admin SDK
const db = admin.firestore();

// curl -X POST https://us-central1-soullife-b994e.cloudfunctions.net/getReminders \-H "Content-Type: application/json" \-d '{"queryResult": {"action": "get_reminders","parameters": {"date": "2024-08-13"}}}'

exports.webhook = functions.https.onRequest(async (req, res) => {
    console.log('Received request 1:', JSON.stringify(req.body, null, 2));
    // Check if queryResult and parameters exist
    const queryResult = req.body.queryResult;
    const parameters = queryResult && queryResult.parameters;
    console.log('Action received:', req.body.action);

    //console.log('queryResult:', JSON.stringify(queryResult, null, 2));
    //console.log('parameters:', JSON.stringify(parameters, null, 2));

    if ((parameters && parameters.action === "get reminder") || req.body.action === "get reminder") {
        const date = parameters?.date || req.body.date || parameters || null;
        const remindersRef = admin.firestore().collection('reminders');
        const querySnapshot = await remindersRef.where('date', '==', date).get();

        if (querySnapshot.empty) {
            return res.json(
                {
                    reminders: "None",
                    date: date
                }
            ); 
        }

        const reminders = querySnapshot.docs.map(doc => doc.data().content);
        const remindersList = reminders.join("\n");

        return res.json(
            {
                reminders: remindersList,
                date: date
            }
        );     
    }

    else if ((parameters && parameters.action === "quote") || req.body.action === "quote") {
        try {
            const response = await axios.get('https://api.quotable.io/random?tags=motivational');
            const quoteText = response.data.content;
            return res.json({
                quote: quoteText
            });
        } catch (error) {
            console.error("Error fetching quote:", error);
            return res.json(
                {
                    quote: "None"
                }
            );
        }
    }
    else if ((parameters && parameters.action === "save reminder") || req.body.action === "save reminder") {
        const reminderContent = parameters?.toSave || req.body.toSave || parameters || null;
        const reminderDate = parameters?.date || req.body.date || parameters || null;
        console.log('Received request to save reminder:', {
            reminderContent,
            reminderDate
        });
        if (!reminderContent || !reminderDate) {
            console.log('Failed to save reminder due to missing content or date.');
            return res.json(
                {
                    message: "Missing parameters. Try again."
                }
            );
        }
        try {
            // Save the reminder to Firestore
            await db.collection('reminders').add({
                date: reminderDate,
                content: reminderContent
            });

            console.log('Successfully saved reminder:', {
                reminderContent,
                reminderDate
            });

            return res.json(
                {
                    message: "Successfully saved."
                }
            );
        } catch (error) {
            console.error("Error saving reminder: ", error);
            return res.json(
                {
                    message: "Failed to save reminder. Try again."
                }
            );
        }
    }
    else {
        console.error("Missing parameter");
        return res.status(400).json({
            fulfillmentText: "Missing parameter."
        });
    }
});