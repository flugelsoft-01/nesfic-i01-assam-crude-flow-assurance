import math
from typing import Dict, List
from models import (
    AdditiveChemistry,
    CrudeProfile,
    EmulsionCurvePoint,
    LabScreeningRecord,
    PipelineProfilePoint,
    RecommendationRequest,
    RecommendationResponse,
    SimulationRequest,
    SimulationResponse,
)

CRUDE_PRESETS: List[CrudeProfile] = [
    CrudeProfile(
        id="assam-naharkatiya",
        name="Upper Assam — Naharkatiya High-Wax",
        region="Dibrugarh / Tinsukia",
        wax_wt_pct=18.5,
        wat_c=41.0,
        pour_point_c=30.0,
        api_gravity=32.4,
        asphaltene_wt_pct=1.8,
        resin_wt_pct=8.4,
        water_cut_pct=28.0,
        salt_ptb=42.0,
    ),
    CrudeProfile(
        id="assam-moran",
        name="Upper Assam — Moran Ageing High-Water-Cut",
        region="Charaideo / Sivasagar",
        wax_wt_pct=16.2,
        wat_c=38.5,
        pour_point_c=27.0,
        api_gravity=30.8,
        asphaltene_wt_pct=2.4,
        resin_wt_pct=9.6,
        water_cut_pct=48.0,
        salt_ptb=76.0,
    ),
    CrudeProfile(
        id="assam-jorhat",
        name="Upper Assam — Jorhat Winter Trunk Blend",
        region="Jorhat",
        wax_wt_pct=19.8,
        wat_c=43.0,
        pour_point_c=32.0,
        api_gravity=33.1,
        asphaltene_wt_pct=1.4,
        resin_wt_pct=7.2,
        water_cut_pct=22.0,
        salt_ptb=35.0,
    ),
    CrudeProfile(
        id="arunachal-kumchai",
        name="Arunachal — Kumchai Heavy-Paraffin",
        region="Changlang / Arunachal Pradesh",
        wax_wt_pct=21.0,
        wat_c=44.5,
        pour_point_c=33.0,
        api_gravity=29.5,
        asphaltene_wt_pct=2.9,
        resin_wt_pct=10.5,
        water_cut_pct=34.0,
        salt_ptb=58.0,
    ),
    CrudeProfile(
        id="tripura-marginal",
        name="Tripura — Marginal Tight Emulsion",
        region="Tripura",
        wax_wt_pct=13.5,
        wat_c=34.0,
        pour_point_c=24.0,
        api_gravity=35.2,
        asphaltene_wt_pct=1.1,
        resin_wt_pct=11.2,
        water_cut_pct=41.0,
        salt_ptb=64.0,
    ),
]

CHEMISTRIES: List[AdditiveChemistry] = [
    AdditiveChemistry(
        id="PF-PPD-101",
        name="ParaFlow PPD-101 (Comb Polyacrylate-Maleic)",
        category="PPD",
        architecture="C18–C22 Alkyl Acrylate–Maleic Anhydride Comb Copolymer",
        indigenous_feedstock="Indigenous fatty-alcohol acrylate + local aromatic solvent",
        unit_cost_inr_per_kg=310.0,
        recommended_dosage_min_ppm=150.0,
        recommended_dosage_max_ppm=300.0,
        target_crude_note="Optimal for 15–22 wt% high-paraffin Upper Assam crudes under <4°C winter flow.",
    ),
    AdditiveChemistry(
        id="PF-PPD-204",
        name="ParaFlow PPD-204 (EVA-g-Octadecyl Terpolymer)",
        category="PPD",
        architecture="Ethylene-Vinyl Acetate grafted with Octadecyl Methacrylate",
        indigenous_feedstock="Domestic EVA base + bio-esterified C18 side chains",
        unit_cost_inr_per_kg=340.0,
        recommended_dosage_min_ppm=180.0,
        recommended_dosage_max_ppm=350.0,
        target_crude_note="High-asphaltene tolerance for Moran & Kumchai ageing fields.",
    ),
    AdditiveChemistry(
        id="PF-PPD-302",
        name="ParaFlow PPD-302 (CNSL-Modified Green Acrylate)",
        category="PPD",
        architecture="Cashew Nut Shell Liquid (Cardanol) Phenolic-Acrylate Hybrid",
        indigenous_feedstock="100% Indian bio-derived CNSL + acrylic monomer",
        unit_cost_inr_per_kg=285.0,
        recommended_dosage_min_ppm=160.0,
        recommended_dosage_max_ppm=320.0,
        target_crude_note="Eco-friendly, low-toxicity PPD for sensitive Brahmaputra basin corridors.",
    ),
    AdditiveChemistry(
        id="PF-DEM-110",
        name="ParaBreak DEM-110 (Multi-Branched EO/PO Polyether)",
        category="Demulsifier",
        architecture="Hyperbranched Phenolic-Resin-Initiated EO/PO Block Polyether",
        indigenous_feedstock="Indigenous novolac resin + domestic ethylene/propylene oxide",
        unit_cost_inr_per_kg=360.0,
        recommended_dosage_min_ppm=20.0,
        recommended_dosage_max_ppm=55.0,
        target_crude_note="Rapid interfacial film displacement at 36–45°C for high-wax emulsions.",
    ),
    AdditiveChemistry(
        id="PF-DEM-208",
        name="ParaBreak DEM-208 (PAMAM-EO/PO Dendrimer)",
        category="Demulsifier",
        architecture="Polyamidoamine-Core Star-Branched Block Copolymer",
        indigenous_feedstock="Domestic amine-acrylate dendrimer + EO/PO alkoxylate",
        unit_cost_inr_per_kg=410.0,
        recommended_dosage_min_ppm=18.0,
        recommended_dosage_max_ppm=45.0,
        target_crude_note="Ultra-fast droplet coalescence for >40% water-cut ageing fields (Moran).",
    ),
    AdditiveChemistry(
        id="PF-DEM-305",
        name="ParaBreak DEM-305 (Silicone-Polyether Co-Surfactant)",
        category="Demulsifier",
        architecture="Trisiloxane-Grafted EO/PO Low-IFT Surfactant Blend",
        indigenous_feedstock="Domestic organosiloxane + polyether blend",
        unit_cost_inr_per_kg=395.0,
        recommended_dosage_min_ppm=15.0,
        recommended_dosage_max_ppm=40.0,
        target_crude_note="Targets tight resin-stabilized emulsions in Tripura & Jorhat crudes.",
    ),
]

CHEMISTRY_MAP: Dict[str, AdditiveChemistry] = {c.id: c for c in CHEMISTRIES}

LAB_RECORDS: List[LabScreeningRecord] = [
    LabScreeningRecord(
        batch_id="LAB-ASSAM-001",
        crude_id="assam-naharkatiya",
        test_method="ASTM D5853 Pour Point",
        temp_c=2.0,
        additive_id="PF-PPD-101",
        dosage_ppm=220.0,
        measured_value=1.5,
        unit="°C",
        spec_limit=4.0,
        passed=True,
        operator="Dr. R. Borah (GGS Lab)",
        notes="Clear flow at 2°C; 28.5°C depression vs. untreated 30°C baseline.",
    ),
    LabScreeningRecord(
        batch_id="LAB-ASSAM-002",
        crude_id="assam-moran",
        test_method="Bottle Test BS&W (40°C)",
        temp_c=40.0,
        additive_id="PF-DEM-208",
        dosage_ppm=32.0,
        measured_value=0.32,
        unit="% v/v",
        spec_limit=0.50,
        passed=True,
        operator="S. Gogoi (Process Chem)",
        notes="Sharp oil-water interface within 18 min at 40°C (25°C below heater-treater baseline).",
    ),
    LabScreeningRecord(
        batch_id="LAB-ASSAM-003",
        crude_id="assam-jorhat",
        test_method="Cold Finger Wax Deposition",
        temp_c=3.0,
        additive_id="PF-PPD-101",
        dosage_ppm=250.0,
        measured_value=68.4,
        unit="% inhibition",
        spec_limit=55.0,
        passed=True,
        operator="Dr. R. Borah (GGS Lab)",
        notes="Significant crystal morphology modification observed via cross-polarized microscopy.",
    ),
    LabScreeningRecord(
        batch_id="LAB-ASSAM-004",
        crude_id="arunachal-kumchai",
        test_method="Rheometer Yield Stress (3°C)",
        temp_c=3.0,
        additive_id="PF-PPD-204",
        dosage_ppm=280.0,
        measured_value=4.8,
        unit="Pa",
        spec_limit=12.0,
        passed=True,
        operator="A. Kalita (Flow Assurance)",
        notes="87% reduction in gel yield stress compared to untreated 37.5 Pa.",
    ),
]


def _ppd_effectiveness_factor(ppd_id: str, crude: CrudeProfile) -> float:
    base = {"PF-PPD-101": 1.04, "PF-PPD-204": 1.00, "PF-PPD-302": 0.96}.get(ppd_id, 0.95)
    if ppd_id == "PF-PPD-204" and crude.asphaltene_wt_pct >= 2.2:
        base += 0.06
    if ppd_id == "PF-PPD-101" and crude.wax_wt_pct >= 17.0:
        base += 0.05
    return base


def _demulsifier_effectiveness_factor(dem_id: str, crude: CrudeProfile) -> float:
    base = {"PF-DEM-110": 1.00, "PF-DEM-208": 1.06, "PF-DEM-305": 1.02}.get(dem_id, 0.95)
    if dem_id == "PF-DEM-208" and crude.water_cut_pct >= 38.0:
        base += 0.07
    if dem_id == "PF-DEM-305" and crude.resin_wt_pct >= 10.0:
        base += 0.06
    return base


def compute_pour_point_treated(crude: CrudeProfile, ppd_id: str, dosage_ppm: float) -> float:
    if dosage_ppm <= 0:
        return crude.pour_point_c
    eff = _ppd_effectiveness_factor(ppd_id, crude)
    max_dep = (26.5 + 0.35 * crude.wax_wt_pct) * eff
    dep = max_dep * (dosage_ppm ** 1.35) / ((70.0 ** 1.35) + (dosage_ppm ** 1.35))
    treated = crude.pour_point_c - dep
    return round(max(-6.0, treated), 2)


def compute_bsw_pct(
    crude: CrudeProfile, dem_id: str, dosage_ppm: float, treating_temp_c: float, is_incumbent: bool = False
) -> float:
    stability = 0.65 + 0.025 * crude.resin_wt_pct + 0.05 * crude.asphaltene_wt_pct + 0.004 * crude.water_cut_pct
    if dosage_ppm <= 0:
        raw = min(crude.water_cut_pct * 0.45, 2.5 * stability * math.exp(-0.028 * (treating_temp_c - 25.0)))
        return round(max(0.45, raw), 3)

    if is_incumbent:
        temp_factor = math.exp(-0.062 * (treating_temp_c - 30.0))
        dose_factor = 1.0 / (1.0 + (dosage_ppm / 35.0) ** 1.1)
        bsw = 0.14 + 3.2 * stability * temp_factor * dose_factor
    else:
        eff = _demulsifier_effectiveness_factor(dem_id, crude)
        temp_factor = math.exp(-0.088 * (treating_temp_c - 24.0))
        dose_factor = 1.0 / (1.0 + (dosage_ppm / (11.5 / eff)) ** 1.35)
        bsw = 0.08 + 2.1 * stability * temp_factor * dose_factor

    return round(min(crude.water_cut_pct, max(0.08, bsw)), 3)


def run_simulation(req: SimulationRequest) -> SimulationResponse:
    crude = req.crude
    ppd = CHEMISTRY_MAP.get(req.ppd_id, CHEMISTRIES[0])
    dem = CHEMISTRY_MAP.get(req.demulsifier_id, CHEMISTRIES[3])

    pp_treated = compute_pour_point_treated(crude, req.ppd_id, req.ppd_dosage_ppm)
    pp_dep = round(crude.pour_point_c - pp_treated, 2)
    sub_4c = pp_treated <= 4.0

    n_points = 11
    profile_points: List[PipelineProfilePoint] = []
    cooling_k = 0.078 * (12.0 / max(4.0, req.pipe_diameter_in)) * (140.0 / max(20.0, req.flow_rate_m3_hr)) ** 0.55

    sg = 141.5 / (131.5 + crude.api_gravity)
    base_visc = 6.5 * math.exp(0.045 * crude.wax_wt_pct)

    for i in range(n_points):
        dist = round(req.pipeline_length_km * i / (n_points - 1), 2)
        temp_c = req.ambient_temp_c + (req.inlet_temp_c - req.ambient_temp_c) * math.exp(-cooling_k * dist)

        delta_untreated = max(0.0, crude.wat_c - temp_c)
        visc_untreated = base_visc * math.exp(0.095 * delta_untreated)
        if temp_c <= crude.pour_point_c:
            visc_untreated *= math.exp(0.14 * (crude.pour_point_c - temp_c))
        visc_untreated = min(visc_untreated, 18500.0)

        delta_treated = max(0.0, (crude.wat_c - 8.0) - temp_c)
        visc_treated = base_visc * math.exp(0.042 * delta_treated)
        if temp_c <= pp_treated:
            visc_treated *= math.exp(0.09 * (pp_treated - temp_c))
        visc_treated = min(visc_treated, 3500.0)

        dep_untreated = max(0.0, 0.045 * crude.wax_wt_pct * max(0.0, crude.wat_c - temp_c) / 25.0)
        inhibition = min(0.78, 0.78 * (req.ppd_dosage_ppm / (req.ppd_dosage_ppm + 85.0))) if req.ppd_dosage_ppm > 0 else 0.0
        dep_treated = dep_untreated * (1.0 - inhibition)

        profile_points.append(
            PipelineProfilePoint(
                distance_km=dist,
                crude_temp_c=round(temp_c, 2),
                untreated_viscosity_cp=round(visc_untreated, 1),
                treated_viscosity_cp=round(visc_treated, 1),
                untreated_wax_dep_mm_day=round(dep_untreated, 3),
                treated_wax_dep_mm_day=round(dep_treated, 3),
            )
        )

    outlet_visc_treated = profile_points[-1].treated_viscosity_cp

    ys_untreated = round(max(1.5, 2.2 * max(1.0, crude.pour_point_c - req.ambient_temp_c) * (crude.wax_wt_pct / 16.0)), 2)
    ys_treated = round(max(0.4, 0.35 * max(0.5, pp_treated - req.ambient_temp_c + 2.5)), 2)

    diam_m = req.pipe_diameter_in * 0.0254
    length_m = req.pipeline_length_km * 1000.0
    p_restart_untreated = round((4.0 * length_m * ys_untreated / diam_m) / 1e5, 2)
    p_restart_treated = round((4.0 * length_m * ys_treated / diam_m) / 1e5, 2)

    total_untreated_dep = sum(p.untreated_wax_dep_mm_day for p in profile_points)
    total_treated_dep = sum(p.treated_wax_dep_mm_day for p in profile_points)
    wax_red_pct = round(100.0 * (1.0 - total_treated_dep / max(1e-6, total_untreated_dep)), 1)

    bsw = compute_bsw_pct(crude, req.demulsifier_id, req.demulsifier_dosage_ppm, req.treating_temp_c, is_incumbent=False)
    refinery_ok = bsw <= 0.50

    conv_temp = 66.0
    temp_red = round(max(0.0, conv_temp - req.treating_temp_c), 1)
    winter_arrival_c = 22.0
    conv_lift = max(1.0, conv_temp - winter_arrival_c)
    new_lift = max(0.0, req.treating_temp_c - winter_arrival_c)
    fuel_saved_pct = round(min(75.0, max(0.0, 100.0 * (1.0 - new_lift / conv_lift))), 1)

    mass_flow_kg_hr = req.flow_rate_m3_hr * 1000.0 * sg
    cp_kj_kg_k = 2.05
    power_saved_kw = (mass_flow_kg_hr * cp_kj_kg_k * temp_red) / 3600.0
    energy_saved_mwh_yr = round((power_saved_kw / 0.78) * 8000.0 / 1000.0, 1)
    co2_reduced_tonnes_yr = round(energy_saved_mwh_yr * 0.202, 1)

    emulsion_curve: List[EmulsionCurvePoint] = []
    for t in range(30, 72, 5):
        emulsion_curve.append(
            EmulsionCurvePoint(
                treating_temp_c=float(t),
                untreated_bsw_pct=compute_bsw_pct(crude, req.demulsifier_id, 0.0, float(t), is_incumbent=False),
                incumbent_bsw_pct=compute_bsw_pct(crude, req.demulsifier_id, 50.0, float(t), is_incumbent=True),
                indigenous_bsw_pct=compute_bsw_pct(crude, req.demulsifier_id, req.demulsifier_dosage_ppm, float(t), is_incumbent=False),
            )
        )

    ppd_cost = (req.ppd_dosage_ppm * 0.001) * ppd.unit_cost_inr_per_kg
    dem_cost = (req.demulsifier_dosage_ppm * 0.001) * dem.unit_cost_inr_per_kg
    landed_cost = round(ppd_cost + dem_cost, 2)

    incumbent_cost = round((450.0 * 0.001 * 460.0) + (55.0 * 0.001 * 520.0), 2)
    cost_adv = round(100.0 * (1.0 - landed_cost / incumbent_cost), 1)

    return SimulationResponse(
        pour_point_untreated_c=crude.pour_point_c,
        pour_point_treated_c=pp_treated,
        pour_point_depression_c=pp_dep,
        sub_4c_compliant=sub_4c,
        apparent_viscosity_cp=outlet_visc_treated,
        yield_stress_untreated_pa=ys_untreated,
        yield_stress_treated_pa=ys_treated,
        restart_pressure_untreated_bar=p_restart_untreated,
        restart_pressure_treated_bar=p_restart_treated,
        wax_deposition_reduction_pct=wax_red_pct,
        bsw_pct=bsw,
        refinery_spec_compliant=refinery_ok,
        conventional_treating_temp_c=conv_temp,
        temp_reduction_c=temp_red,
        fuel_gas_saved_pct=fuel_saved_pct,
        energy_saved_mwh_yr=energy_saved_mwh_yr,
        co2_reduced_tonnes_yr=co2_reduced_tonnes_yr,
        landed_cost_inr_per_tonne=landed_cost,
        incumbent_cost_inr_per_tonne=incumbent_cost,
        cost_advantage_pct=cost_adv,
        profile_points=profile_points,
        emulsion_curve=emulsion_curve,
    )


def recommend_formulation(req: RecommendationRequest) -> RecommendationResponse:
    crude = req.crude
    ppds = [c for c in CHEMISTRIES if c.category == "PPD"]
    dems = [c for c in CHEMISTRIES if c.category == "Demulsifier"]

    best_ppd = ppds[0]
    best_ppd_dose = 300.0
    best_ppd_cost = float("inf")
    best_pp = 99.0

    for ppd in ppds:
        for dose in range(100, 460, 10):
            pp = compute_pour_point_treated(crude, ppd.id, float(dose))
            if pp <= req.target_pour_point_c:
                cost = dose * 0.001 * ppd.unit_cost_inr_per_kg
                if cost < best_ppd_cost:
                    best_ppd = ppd
                    best_ppd_dose = float(dose)
                    best_ppd_cost = cost
                    best_pp = pp
                break

    if best_pp == 99.0:
        best_ppd = ppds[0]
        best_ppd_dose = 320.0
        best_pp = compute_pour_point_treated(crude, best_ppd.id, best_ppd_dose)
        best_ppd_cost = best_ppd_dose * 0.001 * best_ppd.unit_cost_inr_per_kg

    best_dem = dems[0]
    best_dem_dose = 45.0
    best_dem_cost = float("inf")
    best_bsw = 99.0

    for dem in dems:
        for dose in range(15, 105, 5):
            bsw = compute_bsw_pct(crude, dem.id, float(dose), req.target_treating_temp_c, is_incumbent=False)
            if bsw <= req.target_bsw_pct:
                cost = dose * 0.001 * dem.unit_cost_inr_per_kg
                if cost < best_dem_cost:
                    best_dem = dem
                    best_dem_dose = float(dose)
                    best_dem_cost = cost
                    best_bsw = bsw
                break

    if best_bsw == 99.0:
        best_dem = dems[1]
        best_dem_dose = 55.0
        best_bsw = compute_bsw_pct(crude, best_dem.id, best_dem_dose, req.target_treating_temp_c, is_incumbent=False)
        best_dem_cost = best_dem_dose * 0.001 * best_dem.unit_cost_inr_per_kg

    total_cost = round(best_ppd_cost + best_dem_cost, 2)
    incumbent_cost = round((450.0 * 0.001 * 460.0) + (55.0 * 0.001 * 520.0), 2)

    rationale = (
        f"For {crude.name} ({crude.wax_wt_pct}% wax, {crude.water_cut_pct}% water cut), "
        f"{best_ppd.name} at {best_ppd_dose:.0f} ppm achieves {best_pp}°C pour point (sub-4°C compliant), "
        f"while {best_dem.name} at {best_dem_dose:.0f} ppm breaks the emulsion to {best_bsw}% BS&W at "
        f"{req.target_treating_temp_c:.0f}°C—saving ~{100.0*(1.0 - total_cost/incumbent_cost):.1f}% on landed additive cost."
    )

    return RecommendationResponse(
        recommended_ppd=best_ppd,
        optimal_ppd_dosage_ppm=best_ppd_dose,
        predicted_pour_point_c=best_pp,
        recommended_demulsifier=best_dem,
        optimal_demulsifier_dosage_ppm=best_dem_dose,
        predicted_bsw_pct=best_bsw,
        estimated_landed_cost_inr_per_tonne=total_cost,
        incumbent_landed_cost_inr_per_tonne=incumbent_cost,
        rationale=rationale,
    )
