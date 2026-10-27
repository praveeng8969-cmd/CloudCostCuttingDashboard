# CloudCut Machine Learning Module

## Overview

This isolated Python module classifies storage metadata as `KEEP`, `REVIEW`, or `ARCHIVE_CANDIDATE`. It is advisory only: it never deletes, moves, or changes cloud objects. The existing CloudCut cost calculations and rule-based recommendations remain independent.

## Why Random Forest

Random Forest handles mixed numeric and categorical metadata, non-linear thresholds, and unknown categories after preprocessing. It is lightweight, CPU-friendly, and easier to explain and operate than a deep-learning stack for this tabular problem.

## Features and training data

The model uses file size in GB, days since last access, storage class, and file type. `generate_dataset.py` creates 2,500 deterministic synthetic records with seed `42`, including missing access metadata, unknown categories, old backups, large objects, and archival tiers. Labels come from documented storage-management assumptions in `assign_label`; they are not customer outcomes or proof of savings.

## Train the model

```powershell
cd ML
python -m pip install -r requirements.txt
python generate_dataset.py
python train.py
```

Training uses an 80/20 stratified split. Numeric values are median-imputed, categorical values are imputed and one-hot encoded, and all preprocessing is fitted only on training data. `train.py` compares the Random Forest with a most-frequent-class baseline and writes genuine metrics to `models/metrics.json`.

## Run the API

### Windows PowerShell

```powershell
cd ML
python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

### Linux or macOS

```bash
cd ML
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python generate_dataset.py
python train.py
python -m uvicorn app:app --host 127.0.0.1 --port 8000
```

API endpoints:

- `GET /health` reports model readiness.
- `GET /model-info` returns algorithm, version, dataset type, and actual evaluation metrics.
- `POST /predict` accepts 1–500 metadata records and returns class probabilities, confidence, and explanations.
- Interactive documentation is available at `http://127.0.0.1:8000/docs`.

## Run with Next.js

Keep the API running in one terminal. In a second terminal at the project root:

```powershell
$env:ML_SERVICE_URL='http://127.0.0.1:8000'
npm run dev
```

Open `http://localhost:3000/ml-insights`. `ML_SERVICE_URL` is read only by server-side Next.js route handlers. If the Python service is offline, the rest of CloudCut remains usable and the ML page shows an error.

## Tests

```powershell
python -m pytest ML/tests -q
npx tsc --noEmit
npm run build
```

Tests cover generation, training, saved-model loading, prediction, unknown categories, missing access data, API validation, and API endpoints.

## Limitations

- Training data is synthetic and reflects explicit assumptions rather than observed customer decisions.
- Held-out synthetic metrics do not establish production accuracy or financial savings.
- Last-access age must come from access metadata; last-modified time must not be substituted silently.
- A production model needs representative labeled cloud-storage data, bias/error analysis, monitoring, and human approval workflows.

## Shared prediction and recommendation integration

After a validated CSV or demo dataset becomes active, the shared Next.js provider automatically starts analysis. It sends records to FastAPI through server-side proxy routes in batches of at most 500. FastAPI returns the saved model's version, ordered file classifications, genuine probabilities, and explanations. The browser stores a customer-scoped analysis keyed by dataset/pricing fingerprint and model version. Dataset replacement, reset, account changes, pricing changes, or model-version changes invalidate stale results.

The internal job lifecycle is `PENDING`, `VALIDATING`, `PROCESSING`, `COMPLETED`, or `FAILED`. Customer pages map these states to plain storage-analysis messages and expose retry only after failure. Navigation does not restart completed analysis. Browser refresh during an incomplete local job safely starts it again. Because browser storage and browser-triggered requests are not durable server infrastructure, production deployments should use authenticated database-backed jobs and a persistent worker if analysis must continue after the browser closes.

The separate technical insights route is retained only as a redirect for old links. Customer navigation and reports intentionally hide implementation details while this developer document preserves the model's actual algorithm, metrics, and synthetic-data limitations.

The shared scenario builder combines classifications with existing inactivity and file metadata signals. `ARCHIVE_CANDIDATE` records may receive a lower-cost tier comparison when a configured eligible tier exists. `REVIEW` and `KEEP` remain advisory and receive no invented savings. The priority score is a deterministic rule-based score informed by confidence, size, and calculated savings; it is not another trained model.

Financial scenarios use configured CloudCut rates only:

- `current cost = size GB × current storage-class rate`
- `proposed cost = size GB × proposed storage-class rate`
- `gross savings = max(0, current cost − proposed cost)`

Only one primary ML-supported tier action contributes to each file's headline total. Existing duplicate and lifecycle recommendations remain visible separately because duplicate metadata is only a candidate signal, not proof of content identity.

## Measured local inference

On the documented Windows development environment, the first 50-record call took 3.120 seconds including cold model loading. Warm batched inference took 0.248 seconds for 500 records, 0.978 seconds for 2,000 records, and 4.990 seconds for 10,000 records. Results vary by hardware and Python environment.

## Deployment

Run FastAPI as a separate Python service, deploy the trained local artifact with that service, and set the Next.js server's private `ML_SERVICE_URL` to its internal or HTTPS address. Do not use a `NEXT_PUBLIC_` variable for the backend URL. Restrict origins/network access in production and retrain only from trusted local datasets and code.

## College viva explanation

CloudCut converts four metadata fields into a review category. A preprocessing pipeline fills missing values and encodes text categories, then a Random Forest combines many decision trees to classify each record. The model is tested on 20% of data it did not train on and compared with a simple baseline. FastAPI exposes the trained model, while Next.js forwards only necessary metadata and displays the prediction as advice. Because the dataset is synthetic, the result is a prototype that must be validated on real labeled data before production use.
