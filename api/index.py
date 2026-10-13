from datetime import datetime, time, timedelta
from typing import List, Dict, Optional
from zoneinfo import ZoneInfo, available_timezones
import os
import re

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, field_validator
from sqlalchemy import create_engine, Column, String, DateTime, Integer
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "sqlite:///./scheduling.db"
)
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class ProposalRecord(Base):
    __tablename__ = "proposals"
    id = Column(Integer, primary_key=True, autoincrement=True)
    proposed_at_utc = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)

app = FastAPI()


calendars_data = [
    {
        "id": "1",
        "name": "Alice",
        "timezone": "America/New_York",
        "workingHours": [{"start": "09:00", "end": "17:00"}],
    },
    {
        "id": "2",
        "name": "Bob",
        "timezone": "Europe/London",
        "workingHours": [{"start": "10:00", "end": "18:00"}],
    },
]


class WorkingHours(BaseModel):
    start: str
    end: str

    @field_validator("start", "end")
    @classmethod
    def validate_time(cls, value: str) -> str:
        if not re.fullmatch(r"\d{2}:\d{2}", value):
            raise ValueError("Time must be in HH:MM format")
        return value


class Calendar(BaseModel):
    id: str
    name: str
    timezone: str
    workingHours: List[WorkingHours]

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: str) -> str:
        if value not in available_timezones():
            raise ValueError(f"Unknown timezone: {value}")
        return value


class MeetingProposal(BaseModel):
    time: str

    @field_validator("time")
    @classmethod
    def validate_time(cls, value: str) -> str:
        try:
            datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            raise ValueError("time must be a valid ISO 8601 datetime")
        return value


class PersonOverlap(BaseModel):
    id: str
    name: str
    timezone: str
    localTime: str
    overlapsWorkingHours: bool


class ProposalResponse(BaseModel):
    success: bool
    proposedAtUtc: str
    attendees: List[PersonOverlap]


def parse_time(value: str) -> time:
    hour, minute = value.split(":")
    return time(int(hour), int(minute))


def overlaps_working_hours(local_dt: datetime, working_hours: List[Dict[str, str]]) -> bool:
    weekday = local_dt.weekday()
    if weekday >= 5:
        return False
    current_time = local_dt.time()
    for wh in working_hours:
        start = parse_time(wh["start"])
        end = parse_time(wh["end"])
        if start <= current_time <= end:
            return True
    return False


@app.get("/api/calendars", response_model=List[Calendar])
async def get_calendars():
    return calendars_data


@app.post("/api/propose-meeting", response_model=ProposalResponse)
async def propose_meeting(proposal: MeetingProposal):
    try:
        dt_utc = datetime.fromisoformat(proposal.time.replace("Z", "+00:00"))
        if dt_utc.tzinfo is None:
            dt_utc = dt_utc.replace(tzinfo=ZoneInfo("UTC"))
        else:
            dt_utc = dt_utc.astimezone(ZoneInfo("UTC"))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid meeting time: {exc}")

    attendees = []
    all_overlap = True
    for calendar in calendars_data:
        tz = ZoneInfo(calendar["timezone"])
        local_dt = dt_utc.astimezone(tz)
        overlaps = overlaps_working_hours(local_dt, calendar["workingHours"])
        if not overlaps:
            all_overlap = False
        attendees.append(
            PersonOverlap(
                id=calendar["id"],
                name=calendar["name"],
                timezone=calendar["timezone"],
                localTime=local_dt.isoformat(),
                overlapsWorkingHours=overlaps,
            )
        )

    db = SessionLocal()
    try:
        record = ProposalRecord(proposed_at_utc=dt_utc.replace(tzinfo=None))
        db.add(record)
        db.commit()
    finally:
        db.close()

    return ProposalResponse(
        success=all_overlap,
        proposedAtUtc=dt_utc.isoformat(),
        attendees=attendees,
    )


@app.get("/api/proposals")
async def list_proposals():
    db = SessionLocal()
    try:
        rows = db.query(ProposalRecord).order_by(ProposalRecord.created_at.desc()).all()
        return [
            {
                "id": row.id,
                "proposedAtUtc": row.proposed_at_utc.isoformat() if row.proposed_at_utc else None,
                "createdAt": row.created_at.isoformat() if row.created_at else None,
            }
            for row in rows
        ]
    finally:
        db.close()