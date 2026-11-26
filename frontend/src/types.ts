export interface CrudeProfile {
  id: string;
  name: string;
  region: string;
  wax_wt_pct: number;
  wat_c: number;
  pour_point_c: number;
  api_gravity: number;
  asphaltene_wt_pct: number;
  resin_wt_pct: number;
  water_cut_pct: number;
  salt_ptb: number;
}

export interface AdditiveChemistry {
  id: string;
  name: string;
  category: 'PPD' | 'Demulsifier';
  architecture: string;
  indigenous_feedstock: string;
  unit_cost_inr_per_kg: number;
  recommended_dosage_min_ppm: number;
  recommended_dosage_max_ppm: number;
  target_crude_note: string;
}

export interface PipelineProfilePoint {
  distance_km: number;
  crude_temp_c: number;
  untreated_viscosity_cp: number;
  treated_viscosity_cp: number;
  untreated_wax_dep_mm_day: number;
  treated_wax_dep_mm_day: number;
}

export interface EmulsionCurvePoint {
  treating_temp_c: number;
  untreated_bsw_pct: number;
  incumbent_bsw_pct: number;
  indigenous_bsw_pct: number;
}

export interface SimulationResponse {
  pour_point_untreated_c: number;
  pour_point_treated_c: number;
  pour_point_depression_c: number;
  sub_4c_compliant: boolean;
  apparent_viscosity_cp: number;
  yield_stress_untreated_pa: number;
  yield_stress_treated_pa: number;
  restart_pressure_untreated_bar: number;
  restart_pressure_treated_bar: number;
  wax_deposition_reduction_pct: number;
  bsw_pct: number;
  refinery_spec_compliant: boolean;
  conventional_treating_temp_c: number;
  temp_reduction_c: number;
  fuel_gas_saved_pct: float;
  energy_saved_mwh_yr: number;
  co2_reduced_tonnes_yr: number;
  landed_cost_inr_per_tonne: number;
  incumbent_cost_inr_per_tonne: number;
  cost_advantage_pct: number;
  profile_points: PipelineProfilePoint[];
  emulsion_curve: EmulsionCurvePoint[];
}

type float = number;

export interface RecommendationResponse {
  recommended_ppd: AdditiveChemistry;
  optimal_ppd_dosage_ppm: number;
  predicted_pour_point_c: number;
  recommended_demulsifier: AdditiveChemistry;
  optimal_demulsifier_dosage_ppm: number;
  predicted_bsw_pct: number;
  estimated_landed_cost_inr_per_tonne: number;
  incumbent_landed_cost_inr_per_tonne: number;
  rationale: string;
}

export interface LabScreeningRecord {
  batch_id: string;
  crude_id: string;
  test_method: string;
  temp_c: number;
  additive_id: string;
  dosage_ppm: number;
  measured_value: number;
  unit: string;
  spec_limit: number;
  passed: boolean;
  operator: string;
  notes?: string;
}
