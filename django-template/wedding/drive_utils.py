import requests

GOOGLE_DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"
GOOGLE_DRIVE_PERMISSIONS_URL = "https://www.googleapis.com/drive/v3/files/{file_id}/permissions"

def upload_to_drive(access_token, file, filename, mime_type="image/jpeg"):
    """
    Uploads a file to Google Drive and returns the file's metadata.
    """

    # Prepare metadata and file content
    metadata = {"name": filename}
    files = {
        "data": ("metadata", str(metadata), "application/json"),
        "file": (filename, file, mime_type),
    }

    headers = {"Authorization": f"Bearer {access_token}"}

    # Upload file
    response = requests.post(GOOGLE_DRIVE_UPLOAD_URL, headers=headers, files=files)
    response_json = response.json()

    if response.status_code != 200:
        raise Exception(f"Drive upload failed: {response_json}")

    file_id = response_json["id"]

    # Set file permissions (anyone with the link can view)
    perm_data = {"role": "reader", "type": "anyone"}
    requests.post(
        GOOGLE_DRIVE_PERMISSIONS_URL.format(file_id=file_id),
        headers=headers,
        json=perm_data
    )

    # Return file link
    response_json["webViewLink"] = f"https://drive.google.com/file/d/{file_id}/view"
    return response_json
