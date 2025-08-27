from rest_framework import serializers
from .models import Guest, Gift, Wish, GalleryItem

class GuestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = ['id', 'name', 'email', 'phone', 'rsvp_status', 'meal_preference', 'created_at']
        read_only_fields = ['id', 'created_at']

class GiftSerializer(serializers.ModelSerializer):
    reserved_by = GuestSerializer(read_only=True)

    class Meta:
        model = Gift
        fields = ['id', 'title', 'image', 'price', 'reserved', 'reserved_by', 'created_at']
        read_only_fields = ['id', 'created_at']

class GiftReserveSerializer(serializers.Serializer):
    guest_id = serializers.UUIDField()

class WishSerializer(serializers.ModelSerializer):
    guest = GuestSerializer(read_only=True)
    guest_id = serializers.UUIDField(write_only=True, required=True)

    class Meta:
        model = Wish
        fields = ['id', 'guest', 'guest_id', 'message', 'created_at']
        read_only_fields = ['id', 'guest', 'created_at']

    def create(self, validated_data):
        guest_id = validated_data.pop('guest_id')
        guest = Guest.objects.get(id=guest_id)
        return Wish.objects.create(guest=guest, **validated_data)

class GallerySerializer(serializers.ModelSerializer):
    guest = GuestSerializer(read_only=True)
    guest_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = GalleryItem
        fields = ['id', 'guest', 'guest_id', 'image', 'caption', 'uploaded_at']
        read_only_fields = ['id', 'guest', 'uploaded_at']

    def create(self, validated_data):
        guest_id = validated_data.pop('guest_id', None)
        guest = None
        if guest_id:
            guest = Guest.objects.get(id=guest_id)
        return GalleryItem.objects.create(guest=guest, **validated_data)