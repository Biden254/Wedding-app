from django.db import models
import uuid

class Guest(models.Model):
    

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    rsvp_status = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} <{self.email}>"

class Gift(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    image = models.URLField(blank=True, null=True)
    link = models.URLField(blank=True, null=True)
    reserved = models.BooleanField(default=False)
    reserved_by = models.ForeignKey(Guest, on_delete=models.SET_NULL, null=True, blank=True, related_name="reserved_gifts")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Wish(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guest = models.ForeignKey(Guest, on_delete=models.CASCADE, related_name="wishes")
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wish from {self.guest.name}"

class GalleryItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guest = models.ForeignKey(Guest, on_delete=models.SET_NULL, null=True, blank=True, related_name="photos")
    image = models.URLField(blank=True, null=True)
    caption = models.CharField(max_length=255, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo {self.id}"

class UploadedFile(models.Model):
    filename = models.CharField(max_length=255)
    drive_link = models.URLField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename

