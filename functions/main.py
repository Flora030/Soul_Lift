from flask import Flask, request, jsonify
from google.cloud import firestore
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# https://us-central1-soullife-b994e.cloudfunctions.net/webhook

# Initialize Firestore DB
db = firestore.Client()

@app.route('/webhook', methods=[ 'GET', 'POST' ])
def webhook():
    print("Endpoint triggered")
    req = request.get_json(silent=True, force=True)
    print(f"Received request: {req}")

    # Extract the action from the request
    action = req.get('queryResult').get('action')
    
    if action == "get_reminders":
        return get_reminders(req)
    
    return jsonify({"fulfillmentText": "No action matched"})

def get_reminders(req):
    parameters = req['queryResult']['parameters']
    selected_date = parameters.get('date')

    if not selected_date:
        return jsonify({
            "fulfillmentText": "Please provide a date to retrieve reminders."
        })

    try:
        # Query Firestore for reminders on the selected date
        reminders_ref = db.collection('reminders')
        query = reminders_ref.where('date', '==', selected_date).where('type', '==', 'reminder')
        results = query.stream()

        reminders = [doc.to_dict()['content'] for doc in results]

        if reminders:
            reminders_list = "\n".join(reminders)
            return jsonify({
                "fulfillmentText": f"Reminders for {selected_date}:\n{reminders_list}"
            })
        else:
            return jsonify({
                "fulfillmentText": f"No reminders found for {selected_date}."
            })
        
    except Exception as e:
        print(f"Error retrieving reminders: {e}")
        return jsonify({
            "fulfillmentText": "Error retrieving reminders."
        })

if __name__ == '__main__':
    app.run(debug=True)
