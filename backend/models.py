from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class CrudeProfile(BaseModel):
    id: str
    name: str
    region: str
    wax_wt_pct: float = Field(..., ge=1.0, le=45.0, description="Paraffin wax content (wt%)")
    wat_c: float = Field(..., ge=10.0, le=65.0, description="Wax Appearance Temperature (°C)")
    pour_point_c: float = Field(..., ge=-10.0, le=50.0, description="Untreated pour point (°C)")
    api_gravity: float = Field(..., ge=15.0, le=50.0, description="API gravity (°API)")
    asphaltene_wt_pct: float = Field(..., ge=0.0, le=15.0)
    resin_wt_pct: float = Field(..., ge=0.5, le=25.0)
    water_cut_pct: float = Field(..., ge=0.0, le=85.0, description="Emulsion water cut (%)")
    salt_ptb: float = Field(..., ge=0.0, le=200.0, description="Salt content (PTB)")


class AdditiveChemistry(BaseModel):
    id: str
    name: str
    category: Literal["PPD", "Demulsifier"]
    architecture: str
    indigenous_feedstock: str
    unit_cost_inr_per_kg: float
    recommended_dosage_min_ppm: float
    recommended_dosage_max_ppm: float
    target_crude_note: str


class SimulationRequest(BaseModel):
    crude: CrudeProfile
    ambient_temp_c: float = Field(3.0, ge=-5.0, le=35.0)
    inlet_temp_c: float = Field(42.0, ge=20.0, le=80.0)
    pipeline_length_km: float = Field(28.0, ge=1.0, le=250.0)
    flow_rate_m3_hr: float = Field(140.0, ge=10.0, le=1500.0)
    pipe_diameter_in: float = Field(12.0, ge=4.0, le=36.0)
    treating_temp_c: float = Field(42.0, ge=25.0, le=80.0)
    ppd_id: str = "PF-PPD-101"
    ppd_dosage_ppm: float = Field(220.0, ge=0.0, le=1000.0)
    demulsifier_id: str = "PF-DEM-110"
    demulsifier_dosage_ppm: float = Field(35.0, ge=0.0, le=300.0)


class PipelineProfilePoint(BaseModel):
    distance_km: float
    crude_temp_c: float
    untreated_viscosity_cp: float
    treated_viscosity_cp: float
    untreated_wax_dep_mm_day: float
    treated_wax_dep_mm_day: float


class EmulsionCurvePoint(BaseModel):
    treating_temp_c: float
    untreated_bsw_pct: float
    incumbent_bsw_pct: float
    indigenous_bsw_pct: float


class SimulationResponse(BaseModel):
    pour_point_untreated_c: float
    pour_point_treated_c: float
    pour_point_depression_c: float
    sub_4c_compliant: bool
    apparent_viscosity_cp: float
    yield_stress_untreated_pa: float
    yield_stress_treated_pa: float
    restart_pressure_untreated_bar: float
    restart_pressure_treated_bar: float
    wax_deposition_reduction_pct: float
    bsw_pct: float
    refinery_spec_compliant: bool
    conventional_treating_temp_c: float
    temp_reduction_c: float
    fuel_gas_saved_pct: float
    energy_saved_mwh_yr: float
    co2_reduced_tonnes_yr: float
    landed_cost_inr_per_tonne: float
    incumbent_cost_inr_per_tonne: float
    cost_advantage_pct: float
    profile_points: List[PipelineProfilePoint]
    emulsion_curve: List[EmulsionCurvePoint]


class RecommendationRequest(BaseModel):
    crude: CrudeProfile
    target_pour_point_c: float = Field(2.0, ge=-5.0, le=15.0)
    target_treating_temp_c: float = Field(40.0, ge=25.0, le=70.0)
    target_bsw_pct: float = Field(0.5, ge=0.05, le=2.0)


class RecommendationResponse(BaseModel):
    recommended_ppd: AdditiveChemistry
    optimal_ppd_dosage_ppm: float
    predicted_pour_point_c: float
    recommended_demulsifier: AdditiveChemistry
    optimal_demulsifier_dosage_ppm: float
    predicted_bsw_pct: float
    estimated_landed_cost_inr_per_tonne: float
    incumbent_landed_cost_inr_per_tonne: float
    rationale: str


class LabScreeningRecord(BaseModel):
    batch_id: str
    crude_id: str
    test_method: str
    temp_c: float
    additive_id: str
    dosage_ppm: float
    measured_value: float
    unit: str
    spec_limit: float
    passed: bool
    operator: str
    notes: Optional[str] = ""
