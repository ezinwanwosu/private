import json
import os
from flask import Flask, request, jsonify,render_template
from flask_cors import CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

AVAILABILITY_FILE = 'availability.json'

def load_availability():
    if os.path.exists(AVAILABILITY_FILE):
        with open(AVAILABILITY_FILE, "r") as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

def save_availability(data):
    with open(AVAILABILITY_FILE, "w") as f:
        json.dump(data, f, indent=2)

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
    return jsonify(availability_slots)

@app.route("/remove-availability", methods=["POST"])
def remove_availability():
    print("remove-availability called")
    data = request.get_json()
    print("Data received:", data)
    booked_start = data.get("start")
    if not booked_start:
        return jsonify({"error": "Missing slot start time"}), 400

    global availability_slots
    availability_slots = [slot for slot in availability_slots if slot.get("start") != booked_start]
    save_availability(availability_slots)

    return jsonify({"message": "Slot removed", "remaining": availability_slots})

@app.route("/")
def dashboard():
    print('rendering....')
    return render_template('dashboard.html')
if __name__ == "__main__":
    app.run(debug=True)
