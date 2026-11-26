import type {
  AdditiveChemistry,
  CrudeProfile,
  LabScreeningRecord,
  RecommendationResponse,
  SimulationResponse,
} from './types';

export const CRUDE_PRESETS: CrudeProfile[] = [
  {
    id: 'assam-naharkatiya',
    name: 'Upper Assam — Naharkatiya High-Wax',
    region: 'Dibrugarh / Tinsukia',
    wax_wt_pct: 18.5,
    wat_c: 41.0,
    pour_point_c: 30.0,
    api_gravity: 32.4,
    asphaltene_wt_pct: 1.8,
    resin_wt_pct: 8.4,
    water_cut_pct: 28.0,
    salt_ptb: 42.0,
  },
  {
    id: 'assam-moran',
    name: 'Upper Assam — Moran Ageing High-Water-Cut',
    region: 'Charaideo / Sivasagar',
    wax_wt_pct: 16.2,
    wat_c: 38.5,
    pour_point_c: 27.0,
    api_gravity: 30.8,
    asphaltene_wt_pct: 2.4,
    resin_wt_pct: 9.6,
    water_cut_pct: 48.0,
    salt_ptb: 76.0,
  },
  {
    id: 'assam-jorhat',
    name: 'Upper Assam — Jorhat Winter Trunk Blend',
    region: 'Jorhat',
    wax_wt_pct: 19.8,
    wat_c: 43.0,
    pour_point_c: 32.0,
    api_gravity: 33.1,
    asphaltene_wt_pct: 1.4,
    resin_wt_pct: 7.2,
    water_cut_pct: 22.0,
    salt_ptb: 35.0,
  },
  {
    id: 'arunachal-kumchai',
    name: 'Arunachal — Kumchai Heavy-Paraffin',
    region: 'Changlang / Arunachal Pradesh',
    wax_wt_pct: 21.0,
    wat_c: 44.5,
    pour_point_c: 33.0,
    api_gravity: 29.5,
    asphaltene_wt_pct: 2.9,
    resin_wt_pct: 10.5,
    water_cut_pct: 34.0,
    salt_ptb: 58.0,
  },
  {
    id: 'tripura-marginal',
    name: 'Tripura — Marginal Tight Emulsion',
    region: 'Tripura',
    wax_wt_pct: 13.5,
    wat_c: 34.0,
    pour_point_c: 24.0,
    api_gravity: 35.2,
    asphaltene_wt_pct: 1.1,
    resin_wt_pct: 11.2,
    water_cut_pct: 41.0,
    salt_ptb: 64.0,
  },
];

export const CHEMISTRIES: AdditiveChemistry[] = [
  {
    id: 'PF-PPD-101',
    name: 'ParaFlow PPD-101 (Comb Polyacrylate-Maleic)',
    category: 'PPD',
    architecture: 'C18–C22 Alkyl Acrylate–Maleic Anhydride Comb Copolymer',
    indigenous_feedstock: 'Indigenous fatty-alcohol acrylate + local aromatic solvent',
    unit_cost_inr_per_kg: 310.0,
    recommended_dosage_min_ppm: 150.0,
    recommended_dosage_max_ppm: 300.0,
    target_crude_note: 'Optimal for 15–22 wt% high-paraffin Upper Assam crudes under <4°C winter flow.',
  },
  {
    id: 'PF-PPD-204',
    name: 'ParaFlow PPD-204 (EVA-g-Octadecyl Terpolymer)',
    category: 'PPD',
    architecture: 'Ethylene-Vinyl Acetate grafted with Octadecyl Methacrylate',
    indigenous_feedstock: 'Domestic EVA base + bio-esterified C18 side chains',
    unit_cost_inr_per_kg: 340.0,
    recommended_dosage_min_ppm: 180.0,
    recommended_dosage_max_ppm: 350.0,
    target_crude_note: 'High-asphaltene tolerance for Moran & Kumchai ageing fields.',
  },
  {
    id: 'PF-PPD-302',
    name: 'ParaFlow PPD-302 (CNSL-Modified Green Acrylate)',
    category: 'PPD',
    architecture: 'Cashew Nut Shell Liquid (Cardanol) Phenolic-Acrylate Hybrid',
    indigenous_feedstock: '100% Indian bio-derived CNSL + acrylic monomer',
    unit_cost_inr_per_kg: 285.0,
    recommended_dosage_min_ppm: 160.0,
    recommended_dosage_max_ppm: 320.0,
    target_crude_note: 'Eco-friendly, low-toxicity PPD for sensitive Brahmaputra basin corridors.',
  },
  {
    id: 'PF-DEM-110',
    name: 'ParaBreak DEM-110 (Multi-Branched EO/PO Polyether)',
    category: 'Demulsifier',
    architecture: 'Hyperbranched Phenolic-Resin-Initiated EO/PO Block Polyether',
    indigenous_feedstock: 'Indigenous novolac resin + domestic ethylene/propylene oxide',
    unit_cost_inr_per_kg: 360.0,
    recommended_dosage_min_ppm: 20.0,
    recommended_dosage_max_ppm: 55.0,
    target_crude_note: 'Rapid interfacial film displacement at 36–45°C for high-wax emulsions.',
  },
  {
    id: 'PF-DEM-208',
    name: 'ParaBreak DEM-208 (PAMAM-EO/PO Dendrimer)',
    category: 'Demulsifier',
    architecture: 'Polyamidoamine-Core Star-Branched Block Copolymer',
    indigenous_feedstock: 'Domestic amine-acrylate dendrimer + EO/PO alkoxylate',
    unit_cost_inr_per_kg: 410.0,
    recommended_dosage_min_ppm: 18.0,
    recommended_dosage_max_ppm: 45.0,
    target_crude_note: 'Ultra-fast droplet coalescence for >40% water-cut ageing fields (Moran).',
  },
  {
    id: 'PF-DEM-305',
    name: 'ParaBreak DEM-305 (Silicone-Polyether Co-Surfactant)',
    category: 'Demulsifier',
    architecture: 'Trisiloxane-Grafted EO/PO Low-IFT Surfactant Blend',
    indigenous_feedstock: 'Domestic organosiloxane + polyether blend',
    unit_cost_inr_per_kg: 395.0,
    recommended_dosage_min_ppm: 15.0,
    recommended_dosage_max_ppm: 40.0,
    target_crude_note: 'Targets tight resin-stabilized emulsions in Tripura & Jorhat crudes.',
  },
];

export const INITIAL_LAB_RECORDS: LabScreeningRecord[] = [
  {
    batch_id: 'LAB-ASSAM-001',
    crude_id: 'assam-naharkatiya',
    test_method: 'ASTM D5853 Pour Point',
    temp_c: 2.0,
    additive_id: 'PF-PPD-101',
    dosage_ppm: 220.0,
    measured_value: 1.5,
    unit: '°C',
    spec_limit: 4.0,
    passed: true,
    operator: 'Dr. R. Borah (GGS Lab)',
    notes: 'Clear flow at 2°C; 28.5°C depression vs. untreated 30°C baseline.',
  },
  {
    batch_id: 'LAB-ASSAM-002',
    crude_id: 'assam-moran',
    test_method: 'Bottle Test BS&W (40°C)',
    temp_c: 40.0,
    additive_id: 'PF-DEM-208',
    dosage_ppm: 32.0,
    measured_value: 0.32,
    unit: '% v/v',
    spec_limit: 0.5,
    passed: true,
    operator: 'S. Gogoi (Process Chem)',
    notes: 'Sharp oil-water interface within 18 min at 40°C (25°C below heater-treater baseline).',
  },
  {
    batch_id: 'LAB-ASSAM-003',
    crude_id: 'assam-jorhat',
    test_method: 'Cold Finger Wax Deposition',
    temp_c: 3.0,
    additive_id: 'PF-PPD-101',
    dosage_ppm: 250.0,
    measured_value: 68.4,
    unit: '% inhibition',
    spec_limit: 55.0,
    passed: true,
    operator: 'Dr. R. Borah (GGS Lab)',
    notes: 'Significant crystal morphology modification observed via cross-polarized microscopy.',
  },
  {
    batch_id: 'LAB-ASSAM-004',
    crude_id: 'arunachal-kumchai',
    test_method: 'Rheometer Yield Stress (3°C)',
    temp_c: 3.0,
    additive_id: 'PF-PPD-204',
    dosage_ppm: 280.0,
    measured_value: 4.8,
    unit: 'Pa',
    spec_limit: 12.0,
    passed: true,
    operator: 'A. Kalita (Flow Assurance)',
    notes: '87% reduction in gel yield stress compared to untreated 37.5 Pa.',
  },
];

const round = (v: number, digits = 2) => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};

function ppdEffectivenessFactor(ppdId: string, crude: CrudeProfile): number {
  let base = { 'PF-PPD-101': 1.04, 'PF-PPD-204': 1.0, 'PF-PPD-302': 0.96 }[ppdId] ?? 0.95;
  if (ppdId === 'PF-PPD-204' && crude.asphaltene_wt_pct >= 2.2) base += 0.06;
  if (ppdId === 'PF-PPD-101' && crude.wax_wt_pct >= 17.0) base += 0.05;
  return base;
}

function demEffectivenessFactor(demId: string, crude: CrudeProfile): number {
  let base = { 'PF-DEM-110': 1.0, 'PF-DEM-208': 1.06, 'PF-DEM-305': 1.02 }[demId] ?? 0.95;
  if (demId === 'PF-DEM-208' && crude.water_cut_pct >= 38.0) base += 0.07;
  if (demId === 'PF-DEM-305' && crude.resin_wt_pct >= 10.0) base += 0.06;
  return base;
}

function computePourPointTreated(crude: CrudeProfile, ppdId: string, dosagePpm: number): number {
  if (dosagePpm <= 0) return crude.pour_point_c;
  const eff = ppdEffectivenessFactor(ppdId, crude);
  const maxDep = (26.5 + 0.35 * crude.wax_wt_pct) * eff;
  const dep = (maxDep * dosagePpm ** 1.35) / (70.0 ** 1.35 + dosagePpm ** 1.35);
  return round(Math.max(-6.0, crude.pour_point_c - dep), 2);
}

function computeBswPct(
  crude: CrudeProfile,
  demId: string,
  dosagePpm: number,
  treatingTempC: number,
  isIncumbent = false,
): number {
  const stability = 0.65 + 0.025 * crude.resin_wt_pct + 0.05 * crude.asphaltene_wt_pct + 0.004 * crude.water_cut_pct;
  if (dosagePpm <= 0) {
    const raw = Math.min(crude.water_cut_pct * 0.45, 2.5 * stability * Math.exp(-0.028 * (treatingTempC - 25.0)));
    return round(Math.max(0.45, raw), 3);
  }
  let bsw: number;
  if (isIncumbent) {
    const tempFactor = Math.exp(-0.062 * (treatingTempC - 30.0));
    const doseFactor = 1.0 / (1.0 + (dosagePpm / 35.0) ** 1.1);
    bsw = 0.14 + 3.2 * stability * tempFactor * doseFactor;
  } else {
    const eff = demEffectivenessFactor(demId, crude);
    const tempFactor = Math.exp(-0.088 * (treatingTempC - 24.0));
    const doseFactor = 1.0 / (1.0 + (dosagePpm / (11.5 / eff)) ** 1.35);
    bsw = 0.08 + 2.1 * stability * tempFactor * doseFactor;
  }
  return round(Math.min(crude.water_cut_pct, Math.max(0.08, bsw)), 3);
}

export function simulateLocally(params: {
  crude: CrudeProfile;
  ambient_temp_c: number;
  inlet_temp_c: number;
  pipeline_length_km: number;
  flow_rate_m3_hr: number;
  pipe_diameter_in: number;
  treating_temp_c: number;
  ppd_id: string;
  ppd_dosage_ppm: number;
  demulsifier_id: string;
  demulsifier_dosage_ppm: number;
}): SimulationResponse {
  const {
    crude,
    ambient_temp_c: ambientTemp,
    inlet_temp_c: inletTemp,
    pipeline_length_km: pipelineLen,
    flow_rate_m3_hr: flowRate,
    pipe_diameter_in: pipeDiam,
    treating_temp_c: treatingTemp,
    ppd_id: ppdId,
    ppd_dosage_ppm: ppdDose,
    demulsifier_id: demId,
    demulsifier_dosage_ppm: demDose,
  } = params;

  const ppd = CHEMISTRIES.find((c) => c.id === ppdId) ?? CHEMISTRIES[0];
  const dem = CHEMISTRIES.find((c) => c.id === demId) ?? CHEMISTRIES[3];

  const ppTreated = computePourPointTreated(crude, ppdId, ppdDose);
  const ppDep = round(crude.pour_point_c - ppTreated, 2);

  const nPoints = 11;
  const profilePoints = [];
  const coolingK = 0.078 * (12.0 / Math.max(4.0, pipeDiam)) * (140.0 / Math.max(20.0, flowRate)) ** 0.55;
  const sg = 141.5 / (131.5 + crude.api_gravity);
  const baseVisc = 6.5 * Math.exp(0.045 * crude.wax_wt_pct);

  for (let i = 0; i < nPoints; i++) {
    const dist = round((pipelineLen * i) / (nPoints - 1), 2);
    const tempC = ambientTemp + (inletTemp - ambientTemp) * Math.exp(-coolingK * dist);

    let viscUntreated = baseVisc * Math.exp(0.095 * Math.max(0.0, crude.wat_c - tempC));
    if (tempC <= crude.pour_point_c) viscUntreated *= Math.exp(0.14 * (crude.pour_point_c - tempC));
    viscUntreated = Math.min(viscUntreated, 18500.0);

    let viscTreated = baseVisc * Math.exp(0.042 * Math.max(0.0, crude.wat_c - 8.0 - tempC));
    if (tempC <= ppTreated) viscTreated *= Math.exp(0.09 * (ppTreated - tempC));
    viscTreated = Math.min(viscTreated, 3500.0);

    const depUntreated = Math.max(0.0, (0.045 * crude.wax_wt_pct * Math.max(0.0, crude.wat_c - tempC)) / 25.0);
    const inhibition = ppdDose > 0 ? Math.min(0.78, (0.78 * ppdDose) / (ppdDose + 85.0)) : 0.0;
    const depTreated = depUntreated * (1.0 - inhibition);

    profilePoints.push({
      distance_km: dist,
      crude_temp_c: round(tempC, 2),
      untreated_viscosity_cp: round(viscUntreated, 1),
      treated_viscosity_cp: round(viscTreated, 1),
      untreated_wax_dep_mm_day: round(depUntreated, 3),
      treated_wax_dep_mm_day: round(depTreated, 3),
    });
  }

  const outletVisc = profilePoints[profilePoints.length - 1].treated_viscosity_cp;
  const ysUntreated = round(Math.max(1.5, 2.2 * Math.max(1.0, crude.pour_point_c - ambientTemp) * (crude.wax_wt_pct / 16.0)), 2);
  const ysTreated = round(Math.max(0.4, 0.35 * Math.max(0.5, ppTreated - ambientTemp + 2.5)), 2);

  const diamM = pipeDiam * 0.0254;
  const lengthM = pipelineLen * 1000.0;
  const pRestartUntreated = round(((4.0 * lengthM * ysUntreated) / diamM) / 1e5, 2);
  const pRestartTreated = round(((4.0 * lengthM * ysTreated) / diamM) / 1e5, 2);

  const totalUntreatedDep = profilePoints.reduce((s, p) => s + p.untreated_wax_dep_mm_day, 0);
  const totalTreatedDep = profilePoints.reduce((s, p) => s + p.treated_wax_dep_mm_day, 0);
  const waxRedPct = round(100.0 * (1.0 - totalTreatedDep / Math.max(1e-6, totalUntreatedDep)), 1);

  const bsw = computeBswPct(crude, demId, demDose, treatingTemp, false);
  const convTemp = 66.0;
  const tempRed = round(Math.max(0.0, convTemp - treatingTemp), 1);
  const winterArrival = 22.0;
  const fuelSavedPct = round(
    Math.min(75.0, Math.max(0.0, 100.0 * (1.0 - Math.max(0.0, treatingTemp - winterArrival) / Math.max(1.0, convTemp - winterArrival)))),
    1,
  );

  const massFlowKgHr = flowRate * 1000.0 * sg;
  const powerSavedKw = (massFlowKgHr * 2.05 * tempRed) / 3600.0;
  const energySavedMwhYr = round(((powerSavedKw / 0.78) * 8000.0) / 1000.0, 1);
  const co2Reduced = round(energySavedMwhYr * 0.202, 1);

  const emulsionCurve = [];
  for (let t = 30; t < 72; t += 5) {
    emulsionCurve.push({
      treating_temp_c: t,
      untreated_bsw_pct: computeBswPct(crude, demId, 0.0, t, false),
      incumbent_bsw_pct: computeBswPct(crude, demId, 50.0, t, true),
      indigenous_bsw_pct: computeBswPct(crude, demId, demDose, t, false),
    });
  }

  const landedCost = round(ppdDose * 0.001 * ppd.unit_cost_inr_per_kg + demDose * 0.001 * dem.unit_cost_inr_per_kg, 2);
  const incumbentCost = round(450.0 * 0.001 * 460.0 + 55.0 * 0.001 * 520.0, 2);
  const costAdv = round(100.0 * (1.0 - landedCost / incumbentCost), 1);

  return {
    pour_point_untreated_c: crude.pour_point_c,
    pour_point_treated_c: ppTreated,
    pour_point_depression_c: ppDep,
    sub_4c_compliant: ppTreated <= 4.0,
    apparent_viscosity_cp: outletVisc,
    yield_stress_untreated_pa: ysUntreated,
    yield_stress_treated_pa: ysTreated,
    restart_pressure_untreated_bar: pRestartUntreated,
    restart_pressure_treated_bar: pRestartTreated,
    wax_deposition_reduction_pct: waxRedPct,
    bsw_pct: bsw,
    refinery_spec_compliant: bsw <= 0.5,
    conventional_treating_temp_c: convTemp,
    temp_reduction_c: tempRed,
    fuel_gas_saved_pct: fuelSavedPct,
    energy_saved_mwh_yr: energySavedMwhYr,
    co2_reduced_tonnes_yr: co2Reduced,
    landed_cost_inr_per_tonne: landedCost,
    incumbent_cost_inr_per_tonne: incumbentCost,
    cost_advantage_pct: costAdv,
    profile_points: profilePoints,
    emulsion_curve: emulsionCurve,
  };
}

export function recommendLocally(
  crude: CrudeProfile,
  targetPp = 2.0,
  targetTemp = 40.0,
  targetBsw = 0.5,
): RecommendationResponse {
  const ppds = CHEMISTRIES.filter((c) => c.category === 'PPD');
  const dems = CHEMISTRIES.filter((c) => c.category === 'Demulsifier');

  let bestPpd = ppds[0];
  let bestPpdDose = 300.0;
  let bestPpdCost = Infinity;
  let bestPp = 99.0;

  for (const ppd of ppds) {
    for (let dose = 100; dose < 460; dose += 10) {
      const pp = computePourPointTreated(crude, ppd.id, dose);
      if (pp <= targetPp) {
        const cost = dose * 0.001 * ppd.unit_cost_inr_per_kg;
        if (cost < bestPpdCost) {
          bestPpd = ppd;
          bestPpdDose = dose;
          bestPpdCost = cost;
          bestPp = pp;
        }
        break;
      }
    }
  }
  if (bestPp === 99.0) {
    bestPpd = ppds[0];
    bestPpdDose = 320.0;
    bestPp = computePourPointTreated(crude, bestPpd.id, bestPpdDose);
    bestPpdCost = bestPpdDose * 0.001 * bestPpd.unit_cost_inr_per_kg;
  }

  let bestDem = dems[0];
  let bestDemDose = 45.0;
  let bestDemCost = Infinity;
  let bestBsw = 99.0;

  for (const dem of dems) {
    for (let dose = 15; dose < 105; dose += 5) {
      const bsw = computeBswPct(crude, dem.id, dose, targetTemp, false);
      if (bsw <= targetBsw) {
        const cost = dose * 0.001 * dem.unit_cost_inr_per_kg;
        if (cost < bestDemCost) {
          bestDem = dem;
          bestDemDose = dose;
          bestDemCost = cost;
          bestBsw = bsw;
        }
        break;
      }
    }
  }
  if (bestBsw === 99.0) {
    bestDem = dems[1];
    bestDemDose = 55.0;
    bestBsw = computeBswPct(crude, bestDem.id, bestDemDose, targetTemp, false);
    bestDemCost = bestDemDose * 0.001 * bestDem.unit_cost_inr_per_kg;
  }

  const totalCost = round(bestPpdCost + bestDemCost, 2);
  const incumbentCost = round(450.0 * 0.001 * 460.0 + 55.0 * 0.001 * 520.0, 2);

  return {
    recommended_ppd: bestPpd,
    optimal_ppd_dosage_ppm: bestPpdDose,
    predicted_pour_point_c: bestPp,
    recommended_demulsifier: bestDem,
    optimal_demulsifier_dosage_ppm: bestDemDose,
    predicted_bsw_pct: bestBsw,
    estimated_landed_cost_inr_per_tonne: totalCost,
    incumbent_landed_cost_inr_per_tonne: incumbentCost,
    rationale: `For ${crude.name} (${crude.wax_wt_pct}% wax, ${crude.water_cut_pct}% water cut), ${bestPpd.name} at ${bestPpdDose} ppm achieves ${bestPp}°C pour point (sub-4°C compliant), while ${bestDem.name} at ${bestDemDose} ppm breaks the emulsion to ${bestBsw}% BS&W at ${targetTemp}°C—saving ~${round(100.0 * (1.0 - totalCost / incumbentCost), 1)}% on landed additive cost.`,
  };
}
