import os
import json
import base64
from dotenv import load_dotenv
from google.cloud import storage
from google.oauth2 import service_account

# Load .env file
load_dotenv()

# Get base64 string from .env and decode to JSON
gcp_creds_b64 = os.getenv("GCP_SERVICE_ACCOUNT_JSON")
if not gcp_creds_b64:
    raise ValueError("No GCP_SERVICE_ACCOUNT_JSON_BASE64 found in .env")

gcp_creds_json = base64.b64decode(gcp_creds_b64).decode("utf-8")
credentials_info = json.loads(gcp_creds_json)

# Create GCS client
credentials = service_account.Credentials.from_service_account_info(credentials_info)
client = storage.Client(credentials=credentials)

# Your bucket
BUCKET_NAME = "yonces-availability"
bucket = client.bucket(BUCKET_NAME)

# Save availability.json
def save_availability(data):
    blob = bucket.blob("availability.json")
    blob.upload_from_string(json.dumps(data, indent=2), content_type="application/json")
    print("✅ Saved availability.json to GCS")

# Load availability.json
def load_availability():
    blob = bucket.blob("availability.json")
    if blob.exists():
        return json.loads(blob.download_as_text())
    return []

# Test
availability_data = [{"start": "2025-08-07T09:00:00"}]
save_availability(availability_data)
print("📄 Loaded from GCS:", load_availability())
