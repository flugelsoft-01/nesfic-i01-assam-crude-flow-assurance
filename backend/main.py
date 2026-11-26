from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from engine import CHEMISTRIES, CRUDE_PRESETS, LAB_RECORDS, recommend_formulation, run_simulation
from models import (
    AdditiveChemistry,
    CrudeProfile,
    LabScreeningRecord,
    RecommendationRequest,
    RecommendationResponse,
    SimulationRequest,
    SimulationResponse,
)

app = FastAPI(
    title="ParaFlow-NE API",
    description="Low-Temperature Flow Assurance & Energy-Efficient Demulsifier Platform for High-Wax North-East Crude (NESFIC-I-01)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "ParaFlow-NE", "challenge": "NESFIC-I-01"}


@app.get("/api/presets", response_model=List[CrudeProfile])
def get_crude_presets():
    return CRUDE_PRESETS


@app.get("/api/chemistries", response_model=List[AdditiveChemistry])
def get_chemistries():
    return CHEMISTRIES


@app.post("/api/simulate", response_model=SimulationResponse)
def simulate_flow_assurance(request: SimulationRequest):
    return run_simulation(request)


@app.post("/api/recommend", response_model=RecommendationResponse)
def recommend_additive_package(request: RecommendationRequest):
    return recommend_formulation(request)


@app.get("/api/lab-records", response_model=List[LabScreeningRecord])
def get_lab_records():
    return LAB_RECORDS


@app.post("/api/lab-records", response_model=LabScreeningRecord)
def add_lab_record(record: LabScreeningRecord):
    LAB_RECORDS.insert(0, record)
    return record
