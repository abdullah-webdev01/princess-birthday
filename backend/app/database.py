import os
from supabase import create_client, Client
from dotenv import load_dotenv
import pathlib

env_path = pathlib.Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_ANON_KEY")

if not url:
    url = "https://iyoyjmeehyexcwqgtmsn.supabase.co"
if not key:
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3lqbWVlaHlleGN3cWd0bXNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjAyNDc3OSwiZXhwIjoyMDk3NjAwNzc5fQ.I5uz444UaCJACgVVbVpVKQDq3DPDmn_EgMAbTrLaeao"

supabase: Client = create_client(url, key)