import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import jwt, JWTError
import bcrypt
from app.config import settings
from app.db.session import get_db
from app.db.models import User, ActivityLog
from app.db.schemas import UserCreate, UserResponse, Token, PasswordResetRequest, PasswordResetConfirm

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: datetime.timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# Dependency to fetch the current active user from JWT token
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# Helper to verify specific role-based access
def check_role(required_roles: list):
    def dependency(current_user: User = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action forbidden for role '{current_user.role}'. Required: {required_roles}"
            )
        return current_user
    return dependency

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.username == user_in.username) | (User.email == user_in.email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Simple role assignment: first user is admin, or username containing admin is admin, else user
    role = "user"
    if "admin" in user_in.username.lower():
        role = "admin"
    elif db.query(User).count() == 0:
        role = "admin"  # Make the first registered user admin

    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_pw,
        role=role,
        is_verified=True, # Auto-verify for standard deployment simplicity
        verification_token=None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log activity
    log = ActivityLog(user_id=new_user.id, action="Register", details=f"Registered user: {new_user.username}")
    db.add(log)
    db.commit()

    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}
    )

    # Log activity
    log = ActivityLog(user_id=user.id, action="Login", details=f"Successful login")
    db.add(log)
    db.commit()

    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role,
        "username": user.username
    }

@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
         # Standard safety practice: don't reveal if email doesn't exist
         return {"message": "If email exists in our records, a reset token has been generated."}
    
    # Generate mock token
    reset_token = jwt.encode({"sub": user.email, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)}, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    user.verification_token = reset_token
    db.commit()

    # Log activity
    log = ActivityLog(user_id=user.id, action="ForgotPasswordRequest", details="Requested password reset token")
    db.add(log)
    db.commit()

    return {
        "message": "Password reset token generated.",
        "reset_token": reset_token  # Returned directly for ease of use in demo/dev mode
    }

@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(req.token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.email == email).first()
    if not user or user.verification_token != req.token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid reset token")

    user.hashed_password = get_password_hash(req.new_password)
    user.verification_token = None
    db.commit()

    # Log activity
    log = ActivityLog(user_id=user.id, action="ResetPassword", details="Reset password successfully")
    db.add(log)
    db.commit()

    return {"message": "Password has been reset successfully"}
