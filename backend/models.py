from sqlalchemy import Column, Integer, String, DateTime, Enum, Float
from sqlalchemy.sql import func
from .database import Base
import enum

class ResourceType(str, enum.Enum):
    pdf = "pdf"
    video = "video"

class Resource(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    type = Column(String)  # 'pdf' or 'video'
    description = Column(String, nullable=True)
    size = Column(String)
    duration = Column(String, nullable=True)
    path = Column(String)  # Path to the file on disk
    created_at = Column(Float) # Timestamp

class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, default=func.now())
    total_visits = Column(Integer, default=0)
    
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
