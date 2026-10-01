from pydantic import BaseModel, Field
from typing import List, Optional

# --- Topic Schemas ---
class TopicBase(BaseModel):
    name: str
    est_hours: Optional[float] = None
    difficulty: int = Field(default=3, ge=1, le=5)
    confidence: int = Field(default=3, ge=1, le=5)

class TopicCreate(TopicBase):
    subject_id: Optional[int] = None

class TopicResponse(TopicBase):
    id: int
    subject_id: int
    calculated_hours: Optional[float] = None

    class Config:
        from_attributes = True

# --- Subject Schemas ---
class SubjectBase(BaseModel):
    name: str
    exam_date: str # YYYY-MM-DD
    weightage: float = Field(default=5.0, ge=1.0, le=10.0)

class SubjectCreate(SubjectBase):
    topics: List[TopicBase] = []

class SubjectResponse(SubjectBase):
    id: int
    topics: List[TopicResponse] = []

    class Config:
        from_attributes = True

# --- Goal Parse Schemas ---
class GoalParseRequest(BaseModel):
    free_text: str

class ExtractedTopic(BaseModel):
    topic_name: str
    difficulty: int = 3
    confidence: int = 3
    estimated_hours: Optional[float] = None

class ExtractedSubject(BaseModel):
    subject_name: str
    exam_date: str # YYYY-MM-DD
    weightage: float = 5.0
    topics: List[ExtractedTopic] = []

class GoalParseResponse(BaseModel):
    subjects: List[ExtractedSubject]
    clarification_needed: Optional[str] = None

# --- Availability Schemas ---
class AvailabilityBase(BaseModel):
    weekday: int # 0=Mon, 6=Sun
    start: str # HH:MM
    end: str # HH:MM

class AvailabilityCreate(AvailabilityBase):
    pass

class AvailabilityResponse(AvailabilityBase):
    id: int

    class Config:
        from_attributes = True

# --- Plan Session Schemas ---
class PlanSessionResponse(BaseModel):
    id: int
    topic_id: int
    topic_name: str
    subject_name: str
    date: str
    start: str
    end: str
    kind: str # study / revision
    status: str # pending / completed / missed

    class Config:
        from_attributes = True

# --- Feasibility Schemas ---
class FeasibilityResult(BaseModel):
    is_feasible: bool
    total_required_hours: float
    total_available_hours: float
    shortfall_hours: float
    suggestions: List[str] = []

# --- Plan Generation Schemas ---
class PlanGenerateRequest(BaseModel):
    start_date: Optional[str] = None # YYYY-MM-DD defaults to today

class PlanGenerateResponse(BaseModel):
    sessions: List[PlanSessionResponse]
    feasibility: FeasibilityResult
    rationale: str
    tips: List[str]

# --- Session Update Schemas ---
class SessionUpdateStatusRequest(BaseModel):
    status: str # completed / missed / pending
    minutes_spent: Optional[int] = 0
    note: Optional[str] = None

# --- Replan Schemas ---
class ReplanResponse(BaseModel):
    sessions: List[PlanSessionResponse]
    explanation: str
    feasibility: FeasibilityResult
