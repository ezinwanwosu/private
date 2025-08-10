import json
import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from google.cloud import storage
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Setup Google Cloud Storage client
gcp_key = json.loads(os.getenv("GCP_SERVICE_ACCOUNT_JSON"))
bucket_name = os.getenv("GCP_BUCKET_NAME")

storage_client = storage.Client.from_service_account_info(gcp_key)
bucket = storage_client.bucket(bucket_name)
blob_name = "availability.json"

def load_availability():
    blob = bucket.blob(blob_name)
    if not blob.exists():
        return []
    data = blob.download_as_text()
    try:
        return json.loads(data)
    except json.JSONDecodeError:
        return []

def save_availability(data):
    blob = bucket.blob(blob_name)
    blob.upload_from_string(
        json.dumps(data, indent=2),
        content_type="application/json"
    )

availability_slots = load_availability()

@app.route("/save-availability", methods=["POST"])
def save_availability_route():
    data = request.get_json()
    if not isinstance(data, list):
        return jsonify({"error": "Expected a JSON list"}), 400

    global availability_slots
    availability_slots = data
    save_availability(availability_slots)
    return jsonify({"message": "Availability saved"})

@app.route("/get-availability")
def get_availability():
    return jsonify(load_availability())

@app.route("/remove-availability", methods=["POST"])
def remove_availability():
    data = request.get_json()
    booked_start = data.get("start")
    if not booked_start:
        return jsonify({"error": "Missing slot start time"}), 400

    global availability_slots
    availability_slots = [
        slot for slot in availability_slots if slot.get("start") != booked_start
    ]
    save_availability(availability_slots)
    return jsonify({"message": "Slot removed", "remaining": availability_slots})

@app.route("/")
def dashboard():
    return render_template('dashboard.html')

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
