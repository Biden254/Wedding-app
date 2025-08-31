import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'web_django.settings')

application = get_wsgi_application()

# --- Auto-create superuser only once ---
try:
    import django
    django.setup()

    from django.contrib.auth import get_user_model

    User = get_user_model()

    # Path to a flag file to prevent repeated creation
    FLAG_FILE = "/tmp/superuser_created.flag"

    if not os.path.exists(FLAG_FILE):
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "AdminPassword123")

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            print(f"Superuser '{username}' created successfully!")
        else:
            print(f"Superuser '{username}' already exists.")

        # Create the flag file to avoid running this again
        with open(FLAG_FILE, "w") as f:
            f.write("Superuser created")
    else:
        print("Superuser creation skipped (already done).")
except Exception as e:
    print(f"Error creating superuser: {e}")