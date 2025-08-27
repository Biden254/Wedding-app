from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import GuestViewSet, GiftViewSet, WishViewSet, GalleryViewSet

router = DefaultRouter()
router.register(r'guests', GuestViewSet, basename='guest')
router.register(r'gifts', GiftViewSet, basename='gift')
router.register(r'wishes', WishViewSet, basename='wish')
router.register(r'gallery', GalleryViewSet, basename='gallery')

urlpatterns = [
    path('', include(router.urls)),
]