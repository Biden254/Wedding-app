from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GuestViewSet,
    GiftViewSet,
    WishViewSet,
    GalleryViewSet,
    GoogleAuthInitView,
    GoogleAuthCallbackView,
    GoogleDriveUploadView,
)

router = DefaultRouter()
router.register(r'guests', GuestViewSet, basename='guest')
router.register(r'gifts', GiftViewSet, basename='gift')
router.register(r'wishes', WishViewSet, basename='wish')
router.register(r'gallery', GalleryViewSet, basename='gallery')

guest_rsvp = GuestViewSet.as_view({'POST': 'rsvp'})

urlpatterns = [
    path('', include(router.urls)),
    path('auth/init/', GoogleAuthInitView.as_view(), name='google-auth-init'),
    path('auth/callback/', GoogleAuthCallbackView.as_view(), name='google-auth-callback'),
    path('drive/upload/', GoogleDriveUploadView.as_view(), name='google-drive-upload'),
    path('rsvp/', guest_rsvp, name='guest-rsvp'),
]
