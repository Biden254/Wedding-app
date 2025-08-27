from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404

from .models import Guest, Gift, Wish, GalleryItem
from .serializers import GuestSerializer, GiftSerializer, GiftReserveSerializer, WishSerializer, GallerySerializer

class GuestViewSet(viewsets.ModelViewSet):
    queryset = Guest.objects.all().order_by('-created_at')
    serializer_class = GuestSerializer

    def get_permissions(self):
        # Allow anyone to create RSVP (POST), restrict other actions to admin
        if self.action in ['create', 'rsvp']:
            return [AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['post'], url_path='rsvp', permission_classes=[AllowAny])
    def rsvp(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        guest = serializer.save()
        return Response(self.get_serializer(guest).data, status=status.HTTP_201_CREATED)

class GiftViewSet(viewsets.ModelViewSet):
    queryset = Gift.objects.all().order_by('title')
    serializer_class = GiftSerializer

    def get_permissions(self):
        # Public can list/retrieve; create/update/delete only admin
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

    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]