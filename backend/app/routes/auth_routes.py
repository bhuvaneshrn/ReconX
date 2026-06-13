from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.database import create_user, get_user_by_email
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str


@router.post("/auth/register", response_model=AuthResponse, status_code=201)
async def register(body: RegisterRequest):
    if len(body.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters",
        )

    existing = await get_user_by_email(body.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    hashed = hash_password(body.password)
    user = await create_user(body.email, hashed)
    token = create_access_token(user["id"], user["email"])

    return AuthResponse(
        access_token=token,
        user_id=user["id"],
        email=user["email"],
    )


@router.post("/auth/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    user = await get_user_by_email(body.email)
    if not user or not verify_password(body.password, user["hashed_pw"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user["id"], user["email"])

    return AuthResponse(
        access_token=token,
        user_id=user["id"],
        email=user["email"],
    )


@router.get("/auth/me")
async def me(user: dict = __import__('fastapi').Depends(__import__('app.deps', fromlist=['get_current_user']).get_current_user)):
    return {"id": user["id"], "email": user["email"]}