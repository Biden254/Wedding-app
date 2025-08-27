from django.contrib import admin
from .models import Guest, Gift, Wish, GalleryItem

@admin.register(Guest)
class GuestAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'rsvp_status', 'meal_preference', 'created_at')
    search_fields = ('name', 'email')

@admin.register(Gift)
class GiftAdmin(admin.ModelAdmin):
    list_display = ('title', 'price', 'reserved', 'reserved_by')
    list_filter = ('reserved',)

@admin.register(Wish)
class WishAdmin(admin.ModelAdmin):
    list_display = ('guest', 'message', 'created_at')

@admin.register(GalleryItem)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ('id', 'guest', 'uploaded_at')