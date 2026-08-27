from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import os

app = FastAPI()

# Sample data to simulate database records
calendars_data = [
    {"id": "1", "name": "Alice", "timezone": "America/New_York", "workingHours": [{"start": "09:00", "end": "17:00"}]},
    {"id": "2", "name": "Bob", "timezone": "Europe/London", "workingHours": [{"start": "10:00", "end": "18:00"}]}
]

class Calendar(BaseModel):
    id: str
    name: str
    timezone: str
    workingHours: List[Dict[str, str]]

class MeetingProposal(BaseModel):
    time: str

class ProposalResponse(BaseModel):
    success: bool

@app.get("/api/calendars", response_model=List[Calendar])
async def get_calendars():
    return calendars_data

@app.post("/api/propose-meeting", response_model=ProposalResponse)
async def propose_meeting(proposal: MeetingProposal):
    return ProposalResponse(success=True)
