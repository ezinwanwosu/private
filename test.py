import requests
import json

# URL of your client app where availability is managed
BASE_URL = "http://localhost:5000"  # Change if hosted remotely

def print_availability():
    res = requests.get(f"{BASE_URL}/get-availability")
    if res.ok:
        print("Current availability:")
        print(json.dumps(res.json(), indent=2))
    else:
        print("Failed to fetch availability:", res.status_code, res.text)

def remove_slot(start_time):
    res = requests.post(f"{BASE_URL}/remove-availability", 
                    json={"start": start_time},
                    headers={"Content-Type": "application/json"})

    if res.ok:
        print("Removal response:")
        print(json.dumps(res.json(), indent=2))
    else:
        print("Failed to remove slot:", res.status_code, res.text)

if __name__ == "__main__":
    print_availability()
    slot_to_remove = "2023-08-15T10:00:00"  # example slot to remove — replace with real slot start time
    print(f"\nRemoving slot with start = {slot_to_remove}\n")
    remove_slot(slot_to_remove)
    print("\nAvailability after removal:")
    print_availability()
