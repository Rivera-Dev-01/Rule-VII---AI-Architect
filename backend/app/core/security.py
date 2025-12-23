from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.core.config import settings

# Define the security scheme (Bearer Token)
security = HTTPBearer()


def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    1. Grabs the token from the request header.
    2. Decodes it using your SUPABASE_JWT_SECRET.
    3. If valid, returns the user data.
    4. If fake or expired, throws an error.
    """
    print(f"🚀 verify_token CALLED")  # DEBUG - check if function is called
    token = credentials.credentials
    print(f"🎫 TOKEN RECEIVED: {token[:20]}...")  # DEBUG - show first 20 chars

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        print(f"✅ TOKEN VALID: {payload.get('sub')}")  # DEBUG
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        print(f"Auth Error: {e}")  # Helpful for debugging
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
        )
