from supabase import create_client, Client
from app.core.config import settings

# This initializes the connection to Supabase
# We use the SERVICE_ROLE_KEY so the backend has full admin rights
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY
)
