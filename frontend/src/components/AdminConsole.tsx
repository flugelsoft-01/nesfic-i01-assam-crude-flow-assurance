import { useState } from 'react';
import {
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  Gauge,
  RefreshCw,
  ShieldCheck,
  Sliders,
  Trash2,
  XCircle,
} from 'lucide-react';
import type {
  AdditiveChemistry,
  AuditLogEntry,
  CrudeProfile,
  DosingApprovalRequest,
  LabScreeningRecord,
  PilotSiteConfig,
  UserRole,
} from '../types';

interface AdminConsoleProps {
  role: UserRole;
  presets: CrudeProfile[];
  onAddPreset: (crude: CrudeProfile) => void;
  onDeletePreset: (id: string) => void;
  chemistries: AdditiveChemistry[];
  onUpdateChemistry: (id: string, cost: number, minPpm: number, maxPpm: number) => void;
  pilotConfig: PilotSiteConfig;
  onUpdatePilotConfig: (cfg: PilotSiteConfig) => void;
  approvals: DosingApprovalRequest[];
  onResolveApproval: (id: string, decision: 'Approved' | 'Rejected', note: string) => void;
  labRecords: LabScreeningRecord[];
  auditLogs: AuditLogEntry[];
  onRecalibrateModel: (offsetC: number) => void;
}

type AdminSubTab = 'approvals' | 'assays' | 'pricing' | 'telemetry' | 'calibration' | 'audit';

export default function AdminConsole({
  role,
  presets,
  onAddPreset,
  onDeletePreset,
  chemistries,
  onUpdateChemistry,
  pilotConfig,
  onUpdatePilotConfig,
  approvals,
  onResolveApproval,
  labRecords,
  auditLogs,
  onRecalibrateModel,
}: AdminConsoleProps) {
  const [subTab, setSubTab] = useState<AdminSubTab>('approvals');
  const isAdmin = role === 'PSU Pilot Admin';
  const canEditAssays = role === 'PSU Pilot Admin' || role === 'Installation Chemist';

  // New crude assay state
  const [crudeName, setCrudeName] = useState('Upper Assam — Lakwa Winter Blend');
  const [crudeRegion, setCrudeRegion] = useState('Sivasagar');
  const [waxPct, setWaxPct] = useState(17.4);
  const [watC, setWatC] = useState(39.5);
  const [pourC, setPourC] = useState(29.0);
  const [waterCut, setWaterCut] = useState(32.0);
  const [csvStatus, setCsvStatus] = useState('');

  // Calibration calculations from labRecords
  const pourRecords = labRecords.filter((r) => r.test_method.includes('Pour'));
  const bswRecords = labRecords.filter((r) => r.test_method.includes('BS&W'));
  const passCount = labRecords.filter((r) => r.passed).length;
  const passRate = labRecords.length > 0 ? ((passCount / labRecords.length) * 100).toFixed(1) : '100.0';
  const avgPourMeasured =
    pourRecords.length > 0
      ? (pourRecords.reduce((s, r) => s + r.measured_value, 0) / pourRecords.length).toFixed(2)
      : '1.50';
  const avgBswMeasured =
    bswRecords.length > 0
      ? (bswRecords.reduce((s, r) => s + r.measured_value, 0) / bswRecords.length).toFixed(3)
      : '0.320';

  const handleCreateAssay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditAssays) return;
    const id = crudeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 28);
    onAddPreset({
      id: `${id}-${Date.now().toString().slice(-3)}`,
      name: crudeName,
      region: crudeRegion,
      wax_wt_pct: waxPct,
      wat_c: watC,
      pour_point_c: pourC,
      api_gravity: 31.8,
      asphaltene_wt_pct: 1.9,
      resin_wt_pct: 8.8,
      water_cut_pct: waterCut,
      salt_ptb: 45.0,
    });
    setCsvStatus(`Added "${crudeName}" to active crude presets.`);
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canEditAssays) return;
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    let added = 0;
    for (let i = 0; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      if (i === 0 && cols[0].toLowerCase() === 'name') continue;
      if (cols.length >= 6 && !Number.isNaN(Number(cols[2]))) {
        onAddPreset({
          id: `csv-${Date.now()}-${i}`,
          name: cols[0],
          region: cols[1] || 'Upper Assam',
          wax_wt_pct: Number(cols[2]),
          wat_c: Number(cols[3]),
          pour_point_c: Number(cols[4]),
          api_gravity: Number(cols[5]) || 32.0,
          asphaltene_wt_pct: Number(cols[6]) || 1.8,
          resin_wt_pct: Number(cols[7]) || 8.5,
          water_cut_pct: Number(cols[8]) || 30.0,
          salt_ptb: Number(cols[9]) || 45.0,
        });
        added++;
      }
    }
    setCsvStatus(`Imported ${added} crude assay preset(s) from ${file.name}.`);
  };

  const downloadCsv = (filename: string, headers: string[], rows: (string | number | boolean)[][]) => {
    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPilotBundle = () => {
    const payload = {
      generated_at: new Date().toISOString(),
      platform: 'ParaFlow-NE (NESFIC-I-01)',
      organization: 'Flugelsoft Labs',
      lead_applicant: 'Kalyanjit Hatibaruah',
      pilot_config: pilotConfig,
      crude_presets: presets,
      chemistries,
      approvals,
      lab_records: labRecords,
      audit_logs: auditLogs,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NESFIC-I-01_Pilot_Audit_Bundle.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <strong>Admin Control Center</strong> · Active Role: <span className="badge badge-pass">{role}</span>
          {!isAdmin && (
            <span style={{ marginLeft: '0.5rem', color: '#b45309' }}>
              (Switch role to <strong>PSU Pilot Admin</strong> in top bar to approve dosing or edit pricing/telemetry)
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.78rem', color: '#475569' }}>
          Pilot Site: <strong>{pilotConfig.site_name}</strong> · Telemetry: <strong>{pilotConfig.scada_status}</strong>
        </span>
      </div>

      <div className="admin-subtabs" role="tablist" aria-label="Admin sections">
        <button className={`nav-tab ${subTab === 'approvals' ? 'active' : ''}`} onClick={() => setSubTab('approvals')}>
          <ShieldCheck size={15} /> Dosing Approvals ({approvals.filter((a) => a.status === 'Pending').length})
        </button>
        <button className={`nav-tab ${subTab === 'assays' ? 'active' : ''}`} onClick={() => setSubTab('assays')}>
          <Database size={15} /> Crude Assay Manager
        </button>
        <button className={`nav-tab ${subTab === 'pricing' ? 'active' : ''}`} onClick={() => setSubTab('pricing')}>
          <Sliders size={15} /> Additive Pricing &amp; Limits
        </button>
        <button className={`nav-tab ${subTab === 'telemetry' ? 'active' : ''}`} onClick={() => setSubTab('telemetry')}>
          <Gauge size={15} /> Pilot Site &amp; Telemetry
        </button>
        <button className={`nav-tab ${subTab === 'calibration' ? 'active' : ''}`} onClick={() => setSubTab('calibration')}>
          <RefreshCw size={15} /> Model Calibration &amp; Drift
        </button>
        <button className={`nav-tab ${subTab === 'audit' ? 'active' : ''}`} onClick={() => setSubTab('audit')}>
          <FileSpreadsheet size={15} /> Audit Trail &amp; Exports
        </button>
      </div>

      {subTab === 'approvals' && (
        <div className="card">
          <h2 className="card-title">Field Dosing Change Requests (RBAC Human-in-the-Loop Sign-Off)</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Submitted By</th>
                  <th>Crude Slate</th>
                  <th>Recommended Package</th>
                  <th>Predicted PP / BS&amp;W</th>
                  <th>Status</th>
                  <th>Admin Action</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((req) => (
                  <tr key={req.id}>
                    <td><strong>{req.id}</strong><br /><span style={{ fontSize: '0.72rem', color: '#64748b' }}>{req.timestamp}</span></td>
                    <td>{req.submitted_by}</td>
                    <td>{req.crude_name}</td>
                    <td>{req.ppd_id} ({req.ppd_dosage_ppm} ppm) + {req.dem_id} ({req.dem_dosage_ppm} ppm)</td>
                    <td>{req.predicted_pp_c}°C / {req.predicted_bsw_pct}%</td>
                    <td>
                      <span className={`badge ${req.status === 'Approved' ? 'badge-pass' : req.status === 'Rejected' ? 'badge-fail' : 'badge-warn'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      {req.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-sm btn-approve"
                            disabled={!isAdmin}
                            title={isAdmin ? 'Approve for field dosing' : 'Requires PSU Pilot Admin role'}
                            onClick={() => onResolveApproval(req.id, 'Approved', 'Approved for GGS dosing skid')}
                          >
                            <CheckCircle2 size={13} /> Approve
                          </button>
                          <button
                            className="btn btn-sm btn-reject"
                            disabled={!isAdmin}
                            title={isAdmin ? 'Reject request' : 'Requires PSU Pilot Admin role'}
                            onClick={() => onResolveApproval(req.id, 'Rejected', 'Requires repeat bottle test')}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.76rem', color: '#475569' }}>{req.reviewer_note}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'assays' && (
        <div className="admin-grid-2">
          <section className="card">
            <h2 className="card-title">Add Crude Assay Preset or Import CSV</h2>
            {csvStatus && <div className="banner">{csvStatus}</div>}
            <form onSubmit={handleCreateAssay}>
              <div className="form-group">
                <label htmlFor="new-crude-name">Field / Crude Name</label>
                <input id="new-crude-name" type="text" value={crudeName} onChange={(e) => setCrudeName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="new-crude-region">District / Basin</label>
                <input id="new-crude-region" type="text" value={crudeRegion} onChange={(e) => setCrudeRegion(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="new-wax">Wax Content (wt%)</label>
                <input id="new-wax" type="number" step="0.1" value={waxPct} onChange={(e) => setWaxPct(Number(e.target.value))} required />
              </div>
              <div className="form-group">
                <label htmlFor="new-wat">WAT (°C) / Native Pour Point (°C)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" step="0.5" value={watC} onChange={(e) => setWatC(Number(e.target.value))} aria-label="WAT C" />
                  <input type="number" step="0.5" value={pourC} onChange={(e) => setPourC(Number(e.target.value))} aria-label="Pour point C" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="new-wc">Emulsion Water Cut (%)</label>
                <input id="new-wc" type="number" step="0.5" value={waterCut} onChange={(e) => setWaterCut(Number(e.target.value))} required />
              </div>
              <button className="btn btn-primary" type="submit" disabled={!canEditAssays}>
                Add Crude Assay to Simulator
              </button>
            </form>
            <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
              <label htmlFor="csv-upload" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Bulk CSV Import (name,region,wax_wt_pct,wat_c,pour_point_c,api_gravity)
              </label>
              <input id="csv-upload" type="file" accept=".csv" onChange={handleCsvUpload} disabled={!canEditAssays} />
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Active Regional Crude Presets ({presets.length})</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Crude Name</th>
                    <th>Wax %</th>
                    <th>Native PP</th>
                    <th>Water Cut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {presets.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong><br /><span style={{ fontSize: '0.73rem', color: '#64748b' }}>{p.region}</span></td>
                      <td>{p.wax_wt_pct}%</td>
                      <td>{p.pour_point_c}°C</td>
                      <td>{p.water_cut_pct}%</td>
                      <td>
                        <button
                          className="btn btn-sm btn-secondary"
                          disabled={!isAdmin || presets.length <= 1}
                          onClick={() => onDeletePreset(p.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {subTab === 'pricing' && (
        <div className="card">
          <h2 className="card-title">Additive Pricing (₹/kg) &amp; Dosage Envelope Master</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Chemistry</th>
                  <th>Category</th>
                  <th>Unit Cost (₹/kg)</th>
                  <th>Min ppm</th>
                  <th>Max ppm</th>
                </tr>
              </thead>
              <tbody>
                {chemistries.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.id}</strong></td>
                    <td>{c.name}</td>
                    <td>{c.category}</td>
                    <td>
                      <input
                        type="number"
                        style={{ width: '90px', padding: '0.3rem 0.45rem' }}
                        value={c.unit_cost_inr_per_kg}
                        disabled={!isAdmin}
                        onChange={(e) => onUpdateChemistry(c.id, Number(e.target.value), c.recommended_dosage_min_ppm, c.recommended_dosage_max_ppm)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        style={{ width: '80px', padding: '0.3rem 0.45rem' }}
                        value={c.recommended_dosage_min_ppm}
                        disabled={!isAdmin}
                        onChange={(e) => onUpdateChemistry(c.id, c.unit_cost_inr_per_kg, Number(e.target.value), c.recommended_dosage_max_ppm)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        style={{ width: '80px', padding: '0.3rem 0.45rem' }}
                        value={c.recommended_dosage_max_ppm}
                        disabled={!isAdmin}
                        onChange={(e) => onUpdateChemistry(c.id, c.unit_cost_inr_per_kg, c.recommended_dosage_min_ppm, Number(e.target.value))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'telemetry' && (
        <div className="card" style={{ maxWidth: '760px' }}>
          <h2 className="card-title">Pilot Site, Pipeline Spec Thresholds &amp; SCADA Telemetry</h2>
          <div className="form-group">
            <label htmlFor="site-name">Nominated GGS / Trunk Line Asset</label>
            <input
              id="site-name"
              type="text"
              value={pilotConfig.site_name}
              disabled={!isAdmin}
              onChange={(e) => onUpdatePilotConfig({ ...pilotConfig, site_name: e.target.value })}
            />
          </div>
          <div className="admin-grid-2">
            <div className="form-group">
              <label htmlFor="pipe-diam">Trunk Pipe Diameter (inches)</label>
              <input
                id="pipe-diam"
                type="number"
                value={pilotConfig.pipe_diameter_in}
                disabled={!isAdmin}
                onChange={(e) => onUpdatePilotConfig({ ...pilotConfig, pipe_diameter_in: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="scada-mode">Telemetry Ingestion Mode</label>
              <select
                id="scada-mode"
                value={pilotConfig.scada_status}
                disabled={!isAdmin}
                onChange={(e) => onUpdatePilotConfig({ ...pilotConfig, scada_status: e.target.value as PilotSiteConfig['scada_status'] })}
              >
                <option value="Connected (OPC-UA)">Connected (OPC-UA)</option>
                <option value="CSV Batch Mode">CSV Batch Mode</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="max-pp">Max Pour Point Threshold (°C)</label>
              <input
                id="max-pp"
                type="number"
                step="0.5"
                value={pilotConfig.max_pour_point_c}
                disabled={!isAdmin}
                onChange={(e) => onUpdatePilotConfig({ ...pilotConfig, max_pour_point_c: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="max-bsw">Refinery Gate BS&amp;W Limit (%)</label>
              <input
                id="max-bsw"
                type="number"
                step="0.05"
                value={pilotConfig.max_bsw_pct}
                disabled={!isAdmin}
                onChange={(e) => onUpdatePilotConfig({ ...pilotConfig, max_bsw_pct: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )}

      {subTab === 'calibration' && (
        <div className="card">
          <h2 className="card-title">QSPR Model Calibration &amp; Lab-to-Digital Drift Monitor</h2>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">Lab Spec Pass Rate</div>
              <div className="kpi-value" style={{ color: '#059669' }}>{passRate}%</div>
              <div className="kpi-sub">{passCount} of {labRecords.length} batches within spec</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Mean Measured Pour Point</div>
              <div className="kpi-value" style={{ color: '#0891b2' }}>{avgPourMeasured}°C</div>
              <div className="kpi-sub">Target ≤ {pilotConfig.max_pour_point_c}°C</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Mean Measured BS&amp;W</div>
              <div className="kpi-value" style={{ color: '#059669' }}>{avgBswMeasured}%</div>
              <div className="kpi-sub">Target ≤ {pilotConfig.max_bsw_pct}% v/v</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Active Thermal Offset</div>
              <div className="kpi-value" style={{ color: '#4f46e5' }}>{pilotConfig.calibration_offset_c > 0 ? `+${pilotConfig.calibration_offset_c}` : pilotConfig.calibration_offset_c}°C</div>
              <div className="kpi-sub">Applied to winter pour-point predictions</div>
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ maxWidth: '340px' }}
            disabled={!isAdmin}
            onClick={() => onRecalibrateModel(Number((Number(avgPourMeasured) - 1.8).toFixed(2)))}
          >
            <RefreshCw size={15} /> Recalibrate QSPR Model from Lab Batches
          </button>
        </div>
      )}

      {subTab === 'audit' && (
        <div className="card">
          <h2 className="card-title">
            <span>Immutable Compliance &amp; Activity Audit Trail</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() =>
                  downloadCsv(
                    'NESFIC-I-01_Audit_Log.csv',
                    ['ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Details'],
                    auditLogs.map((l) => [l.id, l.timestamp, l.actor, l.role, l.action, l.details]),
                  )
                }
              >
                <Download size={13} /> Export Audit CSV
              </button>
              <button className="btn btn-sm btn-primary" style={{ width: 'auto' }} onClick={exportPilotBundle}>
                <Download size={13} /> Export Pilot JSON Bundle
              </button>
            </div>
          </h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Timestamp</th>
                  <th>Actor &amp; Role</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td><strong>{log.id}</strong></td>
                    <td>{log.timestamp}</td>
                    <td>{log.actor} <span className="badge badge-pass">{log.role}</span></td>
                    <td>{log.action}</td>
                    <td>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
