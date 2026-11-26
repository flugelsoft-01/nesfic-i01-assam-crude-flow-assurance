# ParaFlow-NE (`paraflow-ne-flow-assurance`)

**NESFIC-I-01** — *Low-Temperature Flow Assurance for High-Wax North-East Crude: Next-Generation Pour Point Depressants and Energy-Efficient Demulsifiers* (MC² Foundation / Assam Innovation & Startup Foundation).

## Components
- `backend/`: Python 3.13 + FastAPI simulation, QSPR formulation recommender, pipeline thermal/rheology solver, and GGS heater-treater energy/CO₂ balance engine (`pytest` suite in `backend/tests/`).
- `frontend/`: React 18 + TypeScript + Vite + Recharts interactive Digital Twin, Indigenous Chemistries catalog, and Lab Screening & SOP tracker.
- `docs/proposal_nesfic_i01.md`: Complete 12-section NESFIC-I-01 proposal (all sections strictly ≤500 words).
- `deliverables/NESFIC-I-01_Proposal.pdf` & `deliverables/NESFIC-I-01_Proof_of_Work.pdf`: Submission-ready PDFs (<10 MB).

## Quick Start
```bash
# Backend (port 8011)
cd backend && .venv/bin/uvicorn main:app --host 127.0.0.1 --port 8011

# Frontend (port 5173)
cd frontend && npm run dev -- --host 127.0.0.1 --port 5173

# Run backend tests
backend/.venv/bin/pytest -v backend/tests/test_engine.py
```

## Cloudflare Workers Deployment (Full-Stack: SPA + `/api/*`)
This repository is configured for **Cloudflare Workers with Static Assets** (`wrangler.jsonc` + `worker/src/index.ts`):
```bash
# Authenticate with Cloudflare
npx wrangler login

# Preview build & packaging
npm run deploy:dry-run

# Deploy frontend + /api/* Worker to Cloudflare
npm run deploy
```

