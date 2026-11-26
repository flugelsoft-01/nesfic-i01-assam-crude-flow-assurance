import { useEffect, useState } from 'react';
import {
  Activity,
  Beaker,
  BookOpen,
  CheckCircle2,
  Droplets,
  Flame,
  FlaskConical,
  Gauge,
  IndianRupee,
  Send,
  ShieldCheck,
  Sparkles,
  ThermometerSnowflake,
  AlertTriangle,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  AdditiveChemistry,
  AuditLogEntry,
  CrudeProfile,
  DosingApprovalRequest,
  LabScreeningRecord,
  PilotSiteConfig,
  RecommendationResponse,
  SimulationResponse,
  UserRole,
} from './types';
import {
  CHEMISTRIES,
  CRUDE_PRESETS,
  INITIAL_LAB_RECORDS,
  recommendLocally,
  simulateLocally,
} from './engine';
import AdminConsole from './components/AdminConsole';

async function fetchJsonOrFallback<T>(url: string, init: RequestInit | undefined, fallback: () => T): Promise<T> {
  try {
    const res = await fetch(url, init);
    const ct = res.headers.get('content-type') || '';
    if (!res.ok || !ct.includes('application/json')) {
      return fallback();
    }
    return (await res.json()) as T;
  } catch {
    return fallback();
  }
}

type TabKey = 'simulator' | 'chemistries' | 'lab' | 'admin' | 'tutorial';

const TAB_SLUGS: Record<TabKey, string> = {
  simulator: 'upper-assam-flow-assurance-digital-twin',
  chemistries: 'indigenous-ppd-demulsifier-chemistries',
  lab: 'assam-lab-screening-sop',
  admin: 'admin-control-center',
  tutorial: 'tutorial-and-user-guide',
};

const DEFAULT_PILOT_CONFIG: PilotSiteConfig = {
  site_name: 'Upper Assam — Naharkatiya GGS-2 & 12" Trunk Segment',
  pipe_diameter_in: 12.0,
  max_pour_point_c: 4.0,
  max_bsw_pct: 0.5,
  incumbent_ppd_cost_inr_tonne: 207.0,
  incumbent_dem_cost_inr_tonne: 28.6,
  scada_status: 'Connected (OPC-UA)',
  calibration_offset_c: 0.0,
};

const INITIAL_APPROVALS: DosingApprovalRequest[] = [
  {
    id: 'REQ-GGS2-01',
    timestamp: '2026-11-26 18:40 IST',
    submitted_by: 'Dr. R. Borah',
    crude_name: 'Upper Assam — Naharkatiya High-Wax',
    ppd_id: 'PF-PPD-101',
    ppd_dosage_ppm: 180,
    dem_id: 'PF-DEM-110',
    dem_dosage_ppm: 15,
    predicted_pp_c: 1.91,
    predicted_bsw_pct: 0.285,
    status: 'Pending',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-11-26 18:15 IST',
    actor: 'Kalyanjit Hatibaruah',
    role: 'PSU Pilot Admin',
    action: 'Pilot Baseline Initialized',
    details: 'Configured Upper Assam GGS-2 winter target (PP ≤ 4.0°C, BS&W ≤ 0.50%).',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === TAB_SLUGS.chemistries) return 'chemistries';
    if (hash === TAB_SLUGS.lab) return 'lab';
    if (hash === TAB_SLUGS.admin) return 'admin';
    if (hash === TAB_SLUGS.tutorial) return 'tutorial';
    return 'simulator';
  });
  const [role, setRole] = useState<UserRole>('PSU Pilot Admin');
  const [pilotConfig, setPilotConfig] = useState<PilotSiteConfig>(DEFAULT_PILOT_CONFIG);
  const [approvals, setApprovals] = useState<DosingApprovalRequest[]>(INITIAL_APPROVALS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [approvalNotice, setApprovalNotice] = useState('');
  const [presets, setPresets] = useState<CrudeProfile[]>([]);
  const [chemistries, setChemistries] = useState<AdditiveChemistry[]>([]);
  const [selectedCrude, setSelectedCrude] = useState<CrudeProfile | null>(null);

  const [ambientTemp, setAmbientTemp] = useState(3.0);
  const [pipelineLength, setPipelineLength] = useState(28);
  const [flowRate, setFlowRate] = useState(140);
  const [treatingTemp, setTreatingTemp] = useState(41);
  const [ppdId, setPpdId] = useState('PF-PPD-101');
  const [ppdDosage, setPpdDosage] = useState(230);
  const [demId, setDemId] = useState('PF-DEM-110');
  const [demDosage, setDemDosage] = useState(35);

  const [simResult, setSimResult] = useState<SimulationResponse | null>(null);
  const [recResult, setRecResult] = useState<RecommendationResponse | null>(null);
  const [labRecords, setLabRecords] = useState<LabScreeningRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // New lab record form
  const [newBatchId, setNewBatchId] = useState('LAB-ASSAM-005');
  const [newMethod, setNewMethod] = useState('ASTM D5853 Pour Point');
  const [newMeasured, setNewMeasured] = useState(1.8);
  const [newOperator, setNewOperator] = useState('GGS Chemistry Team');

  useEffect(() => {
    Promise.all([
      fetchJsonOrFallback('/api/presets', undefined, () => CRUDE_PRESETS),
      fetchJsonOrFallback('/api/chemistries', undefined, () => CHEMISTRIES),
      fetchJsonOrFallback('/api/lab-records', undefined, () => INITIAL_LAB_RECORDS),
    ]).then(([p, c, l]) => {
      setPresets(p);
      setChemistries(c);
      setLabRecords(l);
      if (p.length > 0) setSelectedCrude(p[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedCrude) return;
    setLoading(true);
    const payload = {
      crude: selectedCrude,
      ambient_temp_c: ambientTemp,
      inlet_temp_c: 42.0,
      pipeline_length_km: pipelineLength,
      flow_rate_m3_hr: flowRate,
      pipe_diameter_in: 12.0,
      treating_temp_c: treatingTemp,
      ppd_id: ppdId,
      ppd_dosage_ppm: ppdDosage,
      demulsifier_id: demId,
      demulsifier_dosage_ppm: demDosage,
    };
    fetchJsonOrFallback(
      '/api/simulate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      () => simulateLocally(payload),
    ).then((data: SimulationResponse) => {
      setSimResult(data);
      setLoading(false);
    });
  }, [selectedCrude, ambientTemp, pipelineLength, flowRate, treatingTemp, ppdId, ppdDosage, demId, demDosage]);

  const handleAutoOptimize = async () => {
    if (!selectedCrude) return;
    const rec = await fetchJsonOrFallback(
      '/api/recommend',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crude: selectedCrude,
          target_pour_point_c: 2.0,
          target_treating_temp_c: treatingTemp,
          target_bsw_pct: 0.45,
        }),
      },
      () => recommendLocally(selectedCrude, 2.0, treatingTemp, 0.45),
    );
    setRecResult(rec);
    setPpdId(rec.recommended_ppd.id);
    setPpdDosage(rec.optimal_ppd_dosage_ppm);
    setDemId(rec.recommended_demulsifier.id);
    setDemDosage(rec.optimal_demulsifier_dosage_ppm);
  };

  const handleAddLabRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrude) return;
    const isPour = newMethod.includes('Pour');
    const specLimit = isPour ? 4.0 : 0.5;
    const record: LabScreeningRecord = {
      batch_id: newBatchId,
      crude_id: selectedCrude.id,
      test_method: newMethod,
      temp_c: isPour ? ambientTemp : treatingTemp,
      additive_id: isPour ? ppdId : demId,
      dosage_ppm: isPour ? ppdDosage : demDosage,
      measured_value: newMeasured,
      unit: isPour ? '°C' : '% v/v',
      spec_limit: specLimit,
      passed: newMeasured <= specLimit,
      operator: newOperator,
      notes: 'Logged via ParaFlow-NE Digital Screening Protocol',
    };
    const saved = await fetchJsonOrFallback(
      '/api/lab-records',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      },
      () => record,
    );
    setLabRecords((prev) => [saved, ...prev]);
    setNewBatchId(`LAB-ASSAM-00${labRecords.length + 2}`);
  };

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    window.history.replaceState(null, '', `#${TAB_SLUGS[tab]}`);
  };

  const appendAudit = (action: string, details: string) => {
    const entry: AuditLogEntry = {
      id: `AUD-00${auditLogs.length + 1}`,
      timestamp: new Date().toLocaleString('en-IN', { hour12: false }),
      actor: role === 'PSU Pilot Admin' ? 'Kalyanjit Hatibaruah' : role,
      role,
      action,
      details,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const handleSubmitForApproval = () => {
    if (!selectedCrude || !simResult) return;
    const req: DosingApprovalRequest = {
      id: `REQ-GGS2-0${approvals.length + 1}`,
      timestamp: new Date().toLocaleString('en-IN', { hour12: false }),
      submitted_by: role,
      crude_name: selectedCrude.name,
      ppd_id: ppdId,
      ppd_dosage_ppm: ppdDosage,
      dem_id: demId,
      dem_dosage_ppm: demDosage,
      predicted_pp_c: simResult.pour_point_treated_c,
      predicted_bsw_pct: simResult.bsw_pct,
      status: 'Pending',
    };
    setApprovals((prev) => [req, ...prev]);
    appendAudit('Dosing Request Submitted', `${req.id}: ${ppdId} (${ppdDosage} ppm) + ${demId} (${demDosage} ppm) for ${selectedCrude.name}`);
    setApprovalNotice(`Submitted ${req.id} for PSU Pilot Admin sign-off.`);
    setTimeout(() => setApprovalNotice(''), 4000);
  };

  const handleResolveApproval = (id: string, decision: 'Approved' | 'Rejected', note: string) => {
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status: decision, reviewer_note: note } : a)));
    appendAudit(`Dosing ${decision}`, `${id}: ${note}`);
  };

  const handleAddPreset = (crude: CrudeProfile) => {
    setPresets((prev) => [crude, ...prev]);
    setSelectedCrude(crude);
    appendAudit('Crude Assay Added', `${crude.name} (${crude.wax_wt_pct}% wax, ${crude.pour_point_c}°C PP)`);
  };

  const handleDeletePreset = (id: string) => {
    setPresets((prev) => {
      const next = prev.filter((p) => p.id !== id);
      if (selectedCrude?.id === id && next.length > 0) setSelectedCrude(next[0]);
      return next;
    });
    appendAudit('Crude Assay Removed', `Removed preset ID ${id}`);
  };

  const handleUpdateChemistry = (id: string, cost: number, minPpm: number, maxPpm: number) => {
    setChemistries((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unit_cost_inr_per_kg: cost, recommended_dosage_min_ppm: minPpm, recommended_dosage_max_ppm: maxPpm } : c)),
    );
    appendAudit('Chemistry Pricing Updated', `${id}: ₹${cost}/kg, ${minPpm}–${maxPpm} ppm`);
  };

  const handleUpdatePilotConfig = (cfg: PilotSiteConfig) => {
    setPilotConfig(cfg);
    appendAudit('Pilot Config Updated', `${cfg.site_name} (PP ≤ ${cfg.max_pour_point_c}°C, BS&W ≤ ${cfg.max_bsw_pct}%)`);
  };

  const handleRecalibrateModel = (offsetC: number) => {
    setPilotConfig((prev) => ({ ...prev, calibration_offset_c: offsetC }));
    appendAudit('QSPR Model Recalibrated', `Applied ${offsetC}°C thermal offset from ${labRecords.length} lab batches`);
  };

  const ppds = chemistries.filter((c) => c.category === 'PPD');
  const dems = chemistries.filter((c) => c.category === 'Demulsifier');

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-badge">PF</div>
          <div className="brand-title">
            <h1>ParaFlow-NE · Flow Assurance &amp; Demulsifier Platform</h1>
            <p>NESFIC-I-01 · Indigenous Low-Temp Additives for High-Wax North-East Crude (MC² Foundation)</p>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Primary navigation">
          <a
            href={`#${TAB_SLUGS.simulator}`}
            className={`nav-tab ${activeTab === 'simulator' ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              switchTab('simulator');
            }}
          >
            <Activity size={16} /> Flow Assurance Digital Twin
          </a>
          <a
            href={`#${TAB_SLUGS.chemistries}`}
            className={`nav-tab ${activeTab === 'chemistries' ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              switchTab('chemistries');
            }}
          >
            <FlaskConical size={16} /> Indigenous Chemistries
          </a>
          <a
            href={`#${TAB_SLUGS.lab}`}
            className={`nav-tab ${activeTab === 'lab' ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              switchTab('lab');
            }}
          >
            <Beaker size={16} /> Lab Screening &amp; SOPs
          </a>
          <a
            href={`#${TAB_SLUGS.admin}`}
            className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              switchTab('admin');
            }}
          >
            <ShieldCheck size={16} /> Admin Console
          </a>
          <a
            href={`#${TAB_SLUGS.tutorial}`}
            className={`nav-tab ${activeTab === 'tutorial' ? 'active' : ''}`}
            style={{ textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              switchTab('tutorial');
            }}
          >
            <BookOpen size={16} /> Tutorial
          </a>
          <select
            className="role-select"
            aria-label="Active RBAC Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="PSU Pilot Admin">Role: PSU Pilot Admin</option>
            <option value="Installation Chemist">Role: Installation Chemist</option>
            <option value="GGS Operator">Role: GGS Operator</option>
          </select>
        </nav>
      </header>

      <main className="main-container">
        {activeTab === 'simulator' && (
          <div className="grid-2">
            <section className="card" aria-label="Simulation controls">
              <h2 className="card-title">
                <span>Crude Slate &amp; Dosing Controls</span>
                {loading && <span className="badge badge-warn">Updating…</span>}
              </h2>

              <div className="form-group">
                <label htmlFor="crude-select">North-East Crude Preset</label>
                <select
                  id="crude-select"
                  value={selectedCrude?.id || ''}
                  onChange={(e) => {
                    const found = presets.find((p) => p.id === e.target.value);
                    if (found) setSelectedCrude(found);
                    setRecResult(null);
                  }}
                >
                  {presets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCrude && (
                <div className="banner" style={{ padding: '0.65rem 0.8rem', fontSize: '0.78rem' }}>
                  <strong>{selectedCrude.region}</strong> · Wax: <strong>{selectedCrude.wax_wt_pct}%</strong> · WAT:{' '}
                  <strong>{selectedCrude.wat_c}°C</strong> · Native PP: <strong>{selectedCrude.pour_point_c}°C</strong> ·
                  Water Cut: <strong>{selectedCrude.water_cut_pct}%</strong>
                </div>
              )}

              <div className="form-group">
                <label>
                  <span>Winter Ambient Temp (°C)</span>
                  <strong>{ambientTemp}°C</strong>
                </label>
                <input
                  type="range"
                  min={0}
                  max={18}
                  step={0.5}
                  value={ambientTemp}
                  onChange={(e) => setAmbientTemp(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>
                  <span>GGS Heater-Treater Temp (°C)</span>
                  <strong>{treatingTemp}°C (vs 66°C)</strong>
                </label>
                <input
                  type="range"
                  min={32}
                  max={68}
                  step={1}
                  value={treatingTemp}
                  onChange={(e) => setTreatingTemp(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>
                  <span>Pipeline Length (km)</span>
                  <strong>{pipelineLength} km</strong>
                </label>
                <input
                  type="range"
                  min={5}
                  max={80}
                  step={1}
                  value={pipelineLength}
                  onChange={(e) => setPipelineLength(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label>
                  <span>Crude Flow Rate (m³/hr)</span>
                  <strong>{flowRate} m³/h</strong>
                </label>
                <input
                  type="range"
                  min={40}
                  max={400}
                  step={10}
                  value={flowRate}
                  onChange={(e) => setFlowRate(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ppd-select">Indigenous PPD Chemistry</label>
                <select id="ppd-select" value={ppdId} onChange={(e) => setPpdId(e.target.value)}>
                  {ppds.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <span>PPD Dosage (ppm)</span>
                  <strong>{ppdDosage} ppm</strong>
                </label>
                <input
                  type="range"
                  min={0}
                  max={450}
                  step={10}
                  value={ppdDosage}
                  onChange={(e) => setPpdDosage(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dem-select">Indigenous Low-Temp Demulsifier</label>
                <select id="dem-select" value={demId} onChange={(e) => setDemId(e.target.value)}>
                  {dems.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <span>Demulsifier Dosage (ppm)</span>
                  <strong>{demDosage} ppm</strong>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={demDosage}
                  onChange={(e) => setDemDosage(Number(e.target.value))}
                />
              </div>

              <button className="btn btn-primary" onClick={handleAutoOptimize}>
                <Sparkles size={16} /> Auto-Optimize Indigenous Formulation
              </button>
              <button className="btn btn-secondary" style={{ marginTop: '0.55rem' }} onClick={handleSubmitForApproval}>
                <Send size={15} /> Submit for PSU Pilot Approval
              </button>
              {approvalNotice && (
                <div className="banner" style={{ marginTop: '0.65rem', marginBottom: 0, padding: '0.55rem 0.75rem', fontSize: '0.78rem' }}>
                  {approvalNotice}
                </div>
              )}
            </section>

            <div>
              {recResult && (
                <div className="banner">
                  <strong>QSPR Formulation Optimizer:</strong> {recResult.rationale}
                </div>
              )}

              {simResult && (
                <>
                  <div className="kpi-grid">
                    <div className="kpi-card">
                      <div className="kpi-label">Treated Pour Point</div>
                      <div className="kpi-value" style={{ color: simResult.sub_4c_compliant ? '#059669' : '#e11d48' }}>
                        {simResult.pour_point_treated_c}°C
                      </div>
                      <div className="kpi-sub">
                        <span className={`badge ${simResult.sub_4c_compliant ? 'badge-pass' : 'badge-fail'}`}>
                          {simResult.sub_4c_compliant ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                          {simResult.sub_4c_compliant ? 'Sub-4°C Compliant' : 'Above 4°C Target'}
                        </span>{' '}
                        (−{simResult.pour_point_depression_c}°C)
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-label">Dehydrated BS&amp;W</div>
                      <div
                        className="kpi-value"
                        style={{ color: simResult.refinery_spec_compliant ? '#059669' : '#e11d48' }}
                      >
                        {simResult.bsw_pct}%
                      </div>
                      <div className="kpi-sub">
                        <span className={`badge ${simResult.refinery_spec_compliant ? 'badge-pass' : 'badge-fail'}`}>
                          <Droplets size={12} />
                          {simResult.refinery_spec_compliant ? 'Refinery Spec ≤ 0.50%' : 'Exceeds 0.50% Spec'}
                        </span>
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-label">Restart Pressure</div>
                      <div className="kpi-value" style={{ color: '#0891b2' }}>
                        {simResult.restart_pressure_treated_bar} bar
                      </div>
                      <div className="kpi-sub">
                        <Gauge size={12} style={{ verticalAlign: 'middle' }} /> Down from{' '}
                        <strong>{simResult.restart_pressure_untreated_bar} bar</strong> untreated
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-label">Fuel-Gas &amp; CO₂ Saved</div>
                      <div className="kpi-value" style={{ color: '#d97706' }}>
                        {simResult.fuel_gas_saved_pct}%
                      </div>
                      <div className="kpi-sub">
                        <Flame size={12} style={{ verticalAlign: 'middle' }} /> {simResult.energy_saved_mwh_yr} MWh/yr ·{' '}
                        {simResult.co2_reduced_tonnes_yr} tCO₂/yr
                      </div>
                    </div>

                    <div className="kpi-card">
                      <div className="kpi-label">Landed Chemical Cost</div>
                      <div className="kpi-value" style={{ color: '#059669' }}>
                        ₹{simResult.landed_cost_inr_per_tonne}
                      </div>
                      <div className="kpi-sub">
                        <IndianRupee size={12} style={{ verticalAlign: 'middle' }} /> per tonne vs ₹
                        {simResult.incumbent_cost_inr_per_tonne} imported ({simResult.cost_advantage_pct}% savings)
                      </div>
                    </div>
                  </div>

                  <div className="charts-grid">
                    <div className="card">
                      <h3 className="card-title">
                        <span>Pipeline Apparent Viscosity Profile (cP)</span>
                        <span className="badge badge-pass">
                          <ThermometerSnowflake size={12} /> {simResult.wax_deposition_reduction_pct}% Wax Inhibition
                        </span>
                      </h3>
                      <div style={{ width: '100%', height: 290 }}>
                        <ResponsiveContainer>
                          <LineChart data={simResult.profile_points}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                              dataKey="distance_km"
                              stroke="#475569"
                              tickFormatter={(v) => `${v} km`}
                            />
                            <YAxis stroke="#475569" />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="untreated_viscosity_cp"
                              name="Untreated Viscosity (cP)"
                              stroke="#f43f5e"
                              strokeWidth={2}
                              dot={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="treated_viscosity_cp"
                              name="Indigenous PPD Treated (cP)"
                              stroke="#06b6d4"
                              strokeWidth={2.5}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="card">
                      <h3 className="card-title">
                        <span>Low-Temp Emulsion Breaking (BS&amp;W % vs Temp)</span>
                        <span className="badge badge-pass">−{simResult.temp_reduction_c}°C Treating Temp</span>
                      </h3>
                      <div style={{ width: '100%', height: 290 }}>
                        <ResponsiveContainer>
                          <LineChart data={simResult.emulsion_curve}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                              dataKey="treating_temp_c"
                              stroke="#475569"
                              tickFormatter={(v) => `${v}°C`}
                            />
                            <YAxis stroke="#475569" domain={[0, 'auto']} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }}
                            />
                            <Legend />
                            <ReferenceLine y={0.5} stroke="#10b981" strokeDasharray="4 4" label="0.5% Spec" />
                            <Line
                              type="monotone"
                              dataKey="incumbent_bsw_pct"
                              name="Imported Incumbent (50 ppm)"
                              stroke="#f59e0b"
                              strokeWidth={2}
                              dot={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="indigenous_bsw_pct"
                              name={`ParaBreak (${demDosage} ppm)`}
                              stroke="#10b981"
                              strokeWidth={2.5}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chemistries' && (
          <div className="card">
            <h2 className="card-title">Indigenous Flow-Assurance Additive Portfolio (Make-in-India Feedstocks)</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Molecular Architecture</th>
                    <th>Indigenous Feedstock</th>
                    <th>Dosage Window</th>
                    <th>Cost (₹/kg)</th>
                    <th>Application Note</th>
                  </tr>
                </thead>
                <tbody>
                  {chemistries.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.id}</strong>
                      </td>
                      <td>{c.name}</td>
                      <td>
                        <span className={`badge ${c.category === 'PPD' ? 'badge-pass' : 'badge-warn'}`}>
                          {c.category}
                        </span>
                      </td>
                      <td>{c.architecture}</td>
                      <td>{c.indigenous_feedstock}</td>
                      <td>
                        {c.recommended_dosage_min_ppm}–{c.recommended_dosage_max_ppm} ppm
                      </td>
                      <td>₹{c.unit_cost_inr_per_kg}</td>
                      <td>{c.target_crude_note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="grid-2">
            <section className="card">
              <h2 className="card-title">Log Lab Screening Result (SOP Tracker)</h2>
              <form onSubmit={handleAddLabRecord}>
                <div className="form-group">
                  <label htmlFor="batch-id">Batch ID</label>
                  <input
                    id="batch-id"
                    type="text"
                    value={newBatchId}
                    onChange={(e) => setNewBatchId(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="test-method">Standard Method</label>
                  <select id="test-method" value={newMethod} onChange={(e) => setNewMethod(e.target.value)}>
                    <option value="ASTM D5853 Pour Point">ASTM D5853 Pour Point (Spec ≤ 4.0°C)</option>
                    <option value="Bottle Test BS&W (40°C)">Bottle Test BS&amp;W (Spec ≤ 0.50% v/v)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="measured-val">Measured Value</label>
                  <input
                    id="measured-val"
                    type="number"
                    step="0.05"
                    value={newMeasured}
                    onChange={(e) => setNewMeasured(Number(e.target.value))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="operator-name">Lab Operator</label>
                  <input
                    id="operator-name"
                    type="text"
                    value={newOperator}
                    onChange={(e) => setNewOperator(e.target.value)}
                    required
                  />
                </div>
                <button className="btn btn-primary" type="submit">
                  Record Verified Lab Result
                </button>
              </form>
            </section>

            <section className="card">
              <h2 className="card-title">Laboratory Validation &amp; Reformulation Audit Log</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Batch ID</th>
                      <th>Test Method</th>
                      <th>Additive / Dose</th>
                      <th>Temp</th>
                      <th>Measured</th>
                      <th>Spec</th>
                      <th>Status</th>
                      <th>Operator</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labRecords.map((r) => (
                      <tr key={r.batch_id}>
                        <td>
                          <strong>{r.batch_id}</strong>
                        </td>
                        <td>{r.test_method}</td>
                        <td>
                          {r.additive_id} ({r.dosage_ppm} ppm)
                        </td>
                        <td>{r.temp_c}°C</td>
                        <td>
                          {r.measured_value} {r.unit}
                        </td>
                        <td>
                          ≤ {r.spec_limit} {r.unit}
                        </td>
                        <td>
                          <span className={`badge ${r.passed ? 'badge-pass' : 'badge-fail'}`}>
                            {r.passed ? 'PASS' : 'FAIL'}
                          </span>
                        </td>
                        <td>{r.operator}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'admin' && (
          <AdminConsole
            role={role}
            presets={presets}
            onAddPreset={handleAddPreset}
            onDeletePreset={handleDeletePreset}
            chemistries={chemistries}
            onUpdateChemistry={handleUpdateChemistry}
            pilotConfig={pilotConfig}
            onUpdatePilotConfig={handleUpdatePilotConfig}
            approvals={approvals}
            onResolveApproval={handleResolveApproval}
            labRecords={labRecords}
            auditLogs={auditLogs}
            onRecalibrateModel={handleRecalibrateModel}
          />
        )}

        {activeTab === 'tutorial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <section className="card">
              <h2 className="card-title">What is ParaFlow-NE? (NESFIC-I-01)</h2>
              <p style={{ margin: '0 0 0.75rem', color: '#334155' }}>
                <strong>ParaFlow-NE</strong> is an indigenous chemical-formulation and flow-assurance digital twin
                built by <strong>Flugelsoft Labs</strong> (Lead Applicant: <strong>Kalyanjit Hatibaruah</strong>) for
                high-wax North-East India crude oils (Upper Assam, Arunachal Pradesh, and Tripura).
              </p>
              <p style={{ margin: 0, color: '#334155' }}>
                During winter (&lt;4°C), high-paraffin crude can solidify inside pipelines, while tight water-in-oil
                emulsions force Group Gathering Stations (GGSs) to burn fuel gas heating treaters to 65–70°C.
                ParaFlow-NE pairs <strong>indigenous sub-4°C Pour Point Depressants (PPDs)</strong> and{' '}
                <strong>low-temperature demulsifiers</strong> with a real-time simulator and lab screening workflow to
                cut fuel-gas use, prevent winter gelation, and lower landed chemical costs vs. imported additives.
              </p>
            </section>

            <section className="admin-grid-2">
              <div className="card">
                <h3 className="card-title">Step 1 · Flow Assurance Digital Twin</h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>
                  Select a regional crude preset (e.g., <em>Naharkatiya High-Wax</em> or <em>Moran Ageing</em>), set
                  winter ambient temperature (&lt;4°C) and GGS heater-treater temperature (~40–42°C), and click{' '}
                  <strong>Auto-Optimize Indigenous Formulation</strong>. Review the 5 KPI cards (Pour Point ≤ 4°C, BS&amp;W
                  ≤ 0.50%, Restart Pressure, Fuel-Gas/CO₂ Saved, and ₹/tonne Cost) and both live charts.
                </p>
              </div>

              <div className="card">
                <h3 className="card-title">Step 2 · Indigenous Chemistries</h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>
                  Browse the Make-in-India portfolio of 3 comb-polymer/CNSL PPDs (<code>PF-PPD-101/204/302</code>) and
                  3 hyperbranched EO/PO low-temperature demulsifiers (<code>PF-DEM-110/208/305</code>) with molecular
                  architectures, domestic feedstocks, dosage envelopes, and unit costs.
                </p>
              </div>

              <div className="card">
                <h3 className="card-title">Step 3 · Lab Screening &amp; SOPs</h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>
                  Record benchtop <strong>ASTM D5853 Pour Point</strong> and <strong>40°C Bottle Test BS&amp;W</strong>{' '}
                  results to verify refinery-gate compliance and track reformulation as field water cuts change.
                </p>
              </div>

              <div className="card">
                <h3 className="card-title">Step 4 · Admin Console &amp; RBAC</h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>
                  Use the top-bar <strong>Role</strong> selector (<code>PSU Pilot Admin</code>,{' '}
                  <code>Installation Chemist</code>, <code>GGS Operator</code>) to submit dosing packages for approval,
                  import crude assay CSVs, adjust additive pricing/telemetry thresholds, recalibrate the QSPR model, and
                  export audit logs.
                </p>
              </div>
            </section>

            <div>
              <button
                className="btn btn-primary"
                style={{ maxWidth: '280px' }}
                onClick={() => switchTab('simulator')}
              >
                <Activity size={16} /> Launch Flow Assurance Digital Twin
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="site-footer" aria-label="Legal, attribution, and regional links">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <strong>Lead Applicant:</strong> Kalyanjit Hatibaruah &nbsp;|&nbsp;{' '}
              <strong>&copy; 2026 Flugelsoft Labs.</strong> All rights reserved.
            </div>
            <nav className="footer-links" aria-label="SEO and regional quick links">
              <a
                href={`#${TAB_SLUGS.simulator}`}
                title="Upper Assam High-Wax Crude Flow Assurance Digital Twin"
                onClick={(e) => {
                  e.preventDefault();
                  switchTab('simulator');
                }}
              >
                Upper Assam Flow Assurance
              </a>
              <a
                href={`#${TAB_SLUGS.chemistries}`}
                title="Indigenous Sub-4°C Pour Point Depressants & Low-Temperature Demulsifiers"
                onClick={(e) => {
                  e.preventDefault();
                  switchTab('chemistries');
                }}
              >
                Indigenous PPD &amp; Demulsifiers
              </a>
              <a
                href={`#${TAB_SLUGS.lab}`}
                title="ASTM D5853 & Bottle Test Lab Screening SOPs for North-East India"
                onClick={(e) => {
                  e.preventDefault();
                  switchTab('lab');
                }}
              >
                Assam Lab Screening SOPs
              </a>
              <a
                href={`#${TAB_SLUGS.tutorial}`}
                title="ParaFlow-NE Tutorial & User Guide"
                onClick={(e) => {
                  e.preventDefault();
                  switchTab('tutorial');
                }}
              >
                Tutorial &amp; User Guide
              </a>
              <a
                href="https://startup.assam.gov.in/nesfic26/problem-statements/nesfic-i-01"
                target="_blank"
                rel="noopener noreferrer"
                title="Official NESFIC-I-01 Problem Statement Portal"
              >
                NESFIC-I-01 Official Challenge
              </a>
            </nav>
          </div>
          <div className="footer-disclaimer">
            <strong>Disclaimer:</strong> ParaFlow-NE is a pre-pilot scientific simulation, QSPR formulation screening,
            and laboratory workflow prototype developed by Flugelsoft Labs for NESFIC-I-01 (Upper Assam, Arunachal
            Pradesh &amp; Tripura high-wax crude basins). Modeled pour points, BS&amp;W curves, restart pressures, and
            energy/cost estimates are engineering projections calibrated to representative regional crude assays and
            must be validated through joint PSU laboratory testing and field pilot trials prior to commercial dosing.
          </div>
        </div>
      </footer>
    </div>
  );
}
