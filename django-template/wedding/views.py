import os
import requests
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAdminUser
from django.shortcuts import get_object_or_404

from .models import Guest, Gift, Wish, GalleryItem
from .serializers import GuestSerializer, GiftSerializer, GiftReserveSerializer, WishSerializer, GallerySerializer


# ---------------------- Existing Views ----------------------

class GuestViewSet(viewsets.ModelViewSet):
    queryset = Guest.objects.all().order_by('-created_at')
    serializer_class = GuestSerializer

    def get_permissions(self):
        if self.action == 'rsvp':
            return [AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['POST'], url_path='rsvp', permission_classes=[AllowAny])
    def rsvp(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        guest = serializer.save()
        return Response(self.get_serializer(guest).data, status=status.HTTP_201_CREATED)


class GiftViewSet(viewsets.ModelViewSet):
    queryset = Gift.objects.all().order_by('title')
    serializer_class = GiftSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'reserve']:
            return [AllowAny()]
        return [IsAdminUser()]

    @action(detail=True, methods=['patch'], url_path='reserve', permission_classes=[AllowAny])
    def reserve(self, request, pk=None):
        gift = get_object_or_404(Gift, pk=pk)
        if gift.reserved:
            return Response({"detail": "Already reserved"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = GiftReserveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        guest_id = serializer.validated_data['guest_id']

        try:
            guest = Guest.objects.get(id=guest_id)
        except Guest.DoesNotExist:
            return Response({"detail": "Guest not found"}, status=status.HTTP_404_NOT_FOUND)

        gift.reserved = True
        gift.reserved_by = guest
        gift.save()
        return Response(GiftSerializer(gift).data, status=status.HTTP_200_OK)


class WishViewSet(viewsets.ModelViewSet):
    queryset = Wish.objects.all().order_by('-created_at')
    serializer_class = WishSerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [AllowAny()]
        return [IsAdminUser()]


class GalleryViewSet(viewsets.ModelViewSet):
    queryset = GalleryItem.objects.all().order_by('-uploaded_at')
    serializer_class = GallerySerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve', 'upload_to_drive']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    @action(detail=False, methods=['POST'], url_path='upload', permission_classes=[AllowAny])
    def upload_to_drive(self, request):
        """
        Handle image uploads and save them to Google Drive.
        """
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Save the uploaded file temporarily
        temp_path = f"/tmp/{uploaded_file.name}"
        with open(temp_path, "wb+") as temp_file:
            for chunk in uploaded_file.chunks():
                temp_file.write(chunk)

        # Load stored OAuth credentials
        creds_path = os.path.join(settings.BASE_DIR, "credentials.json")
        creds = Credentials.from_authorized_user_file(creds_path, ["https://www.googleapis.com/auth/drive.file"])

        # Connect to Google Drive
        service = build("drive", "v3", credentials=creds)

        # Upload to Google Drive
        file_metadata = {
            "name": uploaded_file.name,
            "parents": [settings.GOOGLE_DRIVE_FOLDER_ID]
        }
        media = MediaFileUpload(temp_path, resumable=True)
        file = service.files().create(body=file_metadata, media_body=media, fields="id, webViewLink").execute()

        # Save the uploaded file info in DB
        gallery_item = GalleryItem.objects.create(
            title=uploaded_file.name,
            image=file["webViewLink"]  # Save the Drive link instead of a local image
        )

        # Delete the temporary file
        os.remove(temp_path)

        return Response(GallerySerializer(gallery_item).data, status=status.HTTP_201_CREATED)


# ---------------------- Google OAuth & Drive ----------------------

class GoogleAuthInitView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        auth_url = (
            "https://accounts.google.com/o/oauth2/auth?"
            f"client_id={settings.GOOGLE_CLIENT_ID}&"
            f"redirect_uri={settings.GOOGLE_REDIRECT_URI}&"
            "response_type=code&"
            f"scope={' '.join(settings.GOOGLE_OAUTH_SCOPES)}&"
            "access_type=offline&prompt=consent"
        )
        return redirect(auth_url)


class GoogleAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get("code")

        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        }

        response = requests.post(token_url, data=token_data)
        tokens = response.json()

        if "access_token" not in tokens:
            return Response({"error": "Failed to authenticate with Google"}, status=400)

        # Store access token in session for later uploads
        request.session["google_access_token"] = tokens["access_token"]

        return Response({"message": "Google authentication successful"})


class GoogleDriveUploadView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.session.get("google_access_token")
        if not access_token:
            return Response({"error": "Not authenticated with Google"}, status=401)

        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"error": "No file uploaded"}, status=400)

        headers = {"Authorization": f"Bearer {access_token}"}
        files = {"file": uploaded_file}
        metadata = {"name": uploaded_file.name}

        drive_upload_url = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart"

        response = requests.post(
            drive_upload_url,
            headers=headers,
            files={
                "metadata": ("metadata", f'{{"name":"{uploaded_file.name}"}}', "application/json"),
                "file": uploaded_file,
            },
        )

        if response.status_code not in [200, 201]:
            return Response({"error": "Upload failed", "details": response.json()}, status=400)

        return Response({"message": "File uploaded successfully", "drive_response": response.json()})
