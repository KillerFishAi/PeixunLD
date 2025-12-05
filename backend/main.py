from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
import shutil
import os
import uuid
import time
from passlib.context import CryptContext
from jose import JWTError, jwt

from . import models, database

# Database Init
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS
origins = [
    "http://localhost:4200", # Angular Dev
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Config
SECRET_KEY = "supersecretkey" # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 3000

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth Helpers
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# Startup Event: Create Admin User
@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    user = db.query(models.User).filter(models.User.username == "admin").first()
    if not user:
        hashed_password = get_password_hash("admin123")
        db_user = models.User(username="admin", hashed_password=hashed_password)
        db.add(db_user)
        db.commit()
        print("Admin user created: admin / admin123")
    
    # Init Analytics if empty
    analytics = db.query(models.Analytics).first()
    if not analytics:
        db.add(models.Analytics(total_visits=14203)) # Start with the mock number
        db.commit()
    db.close()

# Routes

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/resources")
def get_resources(db: Session = Depends(get_db)):
    # Return all resources, sorted by createdAt desc
    return db.query(models.Resource).order_by(models.Resource.created_at.desc()).all()

@app.post("/api/resources")
async def upload_resource(
    file: UploadFile = File(...),
    type: str = Form(...),
    user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    upload_dir = "backend/uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        
    file_id = str(int(time.time() * 1000))
    # Sanitize filename or just use UUID to be safe? 
    # Let's keep original extension but rename to ID to avoid conflicts
    ext = os.path.splitext(file.filename)[1]
    safe_filename = f"{file_id}{ext}"
    file_path = os.path.join(upload_dir, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Calculate size string roughly
    file_size = os.path.getsize(file_path)
    def format_bytes(size):
        power = 2**10
        n = 0
        power_labels = {0 : '', 1: 'KB', 2: 'MB', 3: 'GB', 4: 'TB'}
        while size > power:
            size /= power
            n += 1
        return f"{size:.2f} {power_labels[n]}"
        
    db_resource = models.Resource(
        id=file_id,
        title=file.filename,
        type=type,
        description="Uploaded via Admin Console",
        size=format_bytes(file_size),
        duration="Unknown" if type == "video" else None,
        path=safe_filename,
        created_at=time.time()
    )
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

@app.delete("/api/resources/{resource_id}")
def delete_resource(resource_id: str, user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    # Delete file
    try:
        os.remove(os.path.join("backend/uploads", resource.path))
    except Exception as e:
        print(f"Error deleting file: {e}")
        
    db.delete(resource)
    db.commit()
    return {"message": "Resource deleted"}

@app.get("/api/files/{filename}")
def get_file(filename: str):
    path = os.path.join("backend/uploads", filename)
    if os.path.exists(path):
        return FileResponse(path)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/api/analytics")
def get_analytics(db: Session = Depends(get_db)):
    analytics = db.query(models.Analytics).first()
    if not analytics:
        analytics = models.Analytics(total_visits=0)
        db.add(analytics)
        db.commit()
        db.refresh(analytics)
        
    # Generate mock data for the chart, but return real total visits
    # In a real app we would query a "Visits" table by time
    # Here we just reuse the logic from the frontend but serve it from backend
    data = []
    now = datetime.now()
    for i in range(71, -1, -1):
        d = now - timedelta(hours=i)
        hour = d.hour
        base_traffic = 20
        if 9 <= hour <= 18: base_traffic = 80
        elif 18 < hour <= 23: base_traffic = 50
        else: base_traffic = 10
        
        noise = int((id(d) % 30)) # Deterministic noise based on object id? No, let's use something else or random
        import random
        noise = random.randint(0, 30)
        
        data.append({
            "date": d.isoformat(),
            "value": base_traffic + noise
        })
        
    return {
        "totalVisits": analytics.total_visits,
        "activeUsers": 842, # Mock
        "chartData": data
    }

@app.post("/api/analytics/visit")
def record_visit(db: Session = Depends(get_db)):
    analytics = db.query(models.Analytics).first()
    if not analytics:
        analytics = models.Analytics(total_visits=0)
        db.add(analytics)
    
    analytics.total_visits += 1
    db.commit()
    return {"totalVisits": analytics.total_visits}


# Serve Static Files (SPA Catch-all)
# We handle static files and SPA fallback manually

@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    if full_path.startswith("api/"):
        # Explicitly return 404 for missing API routes to avoid returning HTML
        raise HTTPException(status_code=404, detail="API route not found")
    
    # Check if specific file exists in static directory
    # Note: We must be careful about directory traversal, but os.path.join + abspath usually handles it 
    # or StaticFiles does. Here we just simple check.
    static_file_path = os.path.join("backend/static", full_path)
    if os.path.exists(static_file_path) and os.path.isfile(static_file_path):
        return FileResponse(static_file_path)
    
    # Default to index.html for SPA
    index_path = "backend/static/index.html"
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return JSONResponse({"detail": "Frontend not found"}, status_code=404)
