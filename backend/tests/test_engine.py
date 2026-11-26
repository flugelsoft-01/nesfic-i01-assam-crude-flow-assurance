import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from main import app
from engine import CRUDE_PRESETS, recommend_formulation, run_simulation
from models import RecommendationRequest, SimulationRequest

client = TestClient(app)


def test_health_endpoint():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["challenge"] == "NESFIC-I-01"


def test_presets_and_chemistries():
    presets = client.get("/api/presets").json()
    chems = client.get("/api/chemistries").json()
    assert len(presets) >= 5
    assert len(chems) >= 6
    assert any(c["category"] == "PPD" for c in chems)
    assert any(c["category"] == "Demulsifier" for c in chems)


def test_sub_4c_pour_point_and_low_temp_bsw():
    crude = CRUDE_PRESETS[0]  # Naharkatiya High-Wax
    sim = run_simulation(
        SimulationRequest(
            crude=crude,
            ambient_temp_c=3.0,
            treating_temp_c=42.0,
            ppd_id="PF-PPD-101",
            ppd_dosage_ppm=240.0,
            demulsifier_id="PF-DEM-110",
            demulsifier_dosage_ppm=35.0,
        )
    )
    assert sim.pour_point_treated_c <= 4.0
    assert sim.sub_4c_compliant is True
    assert sim.bsw_pct <= 0.50
    assert sim.refinery_spec_compliant is True
    assert sim.fuel_gas_saved_pct > 40.0
    assert sim.restart_pressure_treated_bar < sim.restart_pressure_untreated_bar
    assert sim.landed_cost_inr_per_tonne < sim.incumbent_cost_inr_per_tonne


def test_recommendation_endpoint():
    crude = CRUDE_PRESETS[1]  # Moran Ageing High-Water-Cut
    resp = client.post(
        "/api/recommend",
        json=RecommendationRequest(
            crude=crude,
            target_pour_point_c=2.5,
            target_treating_temp_c=40.0,
            target_bsw_pct=0.5,
        ).model_dump(),
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["predicted_pour_point_c"] <= 2.5
    assert data["predicted_bsw_pct"] <= 0.5
    assert data["estimated_landed_cost_inr_per_tonne"] < data["incumbent_landed_cost_inr_per_tonne"]


def test_lab_record_creation():
    new_rec = {
        "batch_id": "LAB-TEST-999",
        "crude_id": "assam-naharkatiya",
        "test_method": "ASTM D5853 Pour Point",
        "temp_c": 2.0,
        "additive_id": "PF-PPD-101",
        "dosage_ppm": 230.0,
        "measured_value": 1.2,
        "unit": "°C",
        "spec_limit": 4.0,
        "passed": True,
        "operator": "QA Test",
        "notes": "Automated test verification",
    }
    resp = client.post("/api/lab-records", json=new_rec)
    assert resp.status_code == 200
    records = client.get("/api/lab-records").json()
    assert any(r["batch_id"] == "LAB-TEST-999" for r in records)
