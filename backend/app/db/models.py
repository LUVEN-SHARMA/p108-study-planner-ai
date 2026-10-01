from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.db.session import Base

class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    exam_date = Column(String, nullable=False) # ISO format: YYYY-MM-DD
    weightage = Column(Float, default=5.0) # 1.0 to 10.0 scale

    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    name = Column(String, nullable=False)
    est_hours = Column(Float, default=2.0)
    difficulty = Column(Integer, default=3) # 1 (easy) to 5 (hard)
    confidence = Column(Integer, default=3) # 1 (weak) to 5 (strong)

    subject = relationship("Subject", back_populates="topics")
    sessions = relationship("PlanSession", back_populates="topic", cascade="all, delete-orphan")

class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    weekday = Column(Integer, nullable=False) # 0=Monday, 6=Sunday
    start = Column(String, nullable=False) # HH:MM format
    end = Column(String, nullable=False) # HH:MM format

class PlanSession(Base):
    __tablename__ = "plan_sessions"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    date = Column(String, nullable=False) # YYYY-MM-DD
    start = Column(String, nullable=False) # HH:MM
    end = Column(String, nullable=False) # HH:MM
    kind = Column(String, default="study") # 'study' or 'revision'
    status = Column(String, default="pending") # 'pending', 'completed', 'missed'

    topic = relationship("Topic", back_populates="sessions")
    logs = relationship("ProgressLog", back_populates="session", cascade="all, delete-orphan")

class ProgressLog(Base):
    __tablename__ = "progress_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("plan_sessions.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
    minutes_spent = Column(Integer, default=0)
    note = Column(String, nullable=True)

    session = relationship("PlanSession", back_populates="logs")
