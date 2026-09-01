# CloudCut — Cloud Storage Cost Cutting Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

> **"See where your cloud money goes. Cut unnecessary storage costs."**

CloudCut is an enterprise-grade cloud storage cost monitoring and optimization prototype designed to help organizations inspect storage across multi-cloud environments (AWS S3, Google Cloud Storage, Azure Blob Storage), detect duplicate and stale data, generate analytical reports, and cut redundant storage expenses.

---

## 🌟 Key Features

1. **Enterprise Analytics Dashboard (`/dashboard`)**:
   - 6 Core KPI metric cards (Total Storage, Monthly Cost, Potential Savings, Optimization Score Ring, Duplicate Storage, Inactive Storage).
   - 12-Month Cloud Storage Cost Trend line chart (Current vs. Projected Trajectory).
   - Storage Growth tracking (5 TB → 12.8 TB).
   - File Type breakdown donut chart and Department-wise storage distribution.
   - Smart AI Insights Panel with direct CTA.
   - Recent storage activity table with status badges.

2. **Storage Analysis (`/storage`)**:
   - High-level capacity indicators (12.8 TB total, 10.6 TB used, 2.2 TB available, 83% utilization).
   - Interactive file inventory table with search, file type filters, storage class filters, and recommendation tags.

3. **Cost & Billing Analytics (`/cost-analysis`)**:
   - MoM spend comparison & annual cost projections (₹14.8 Lakhs projected vs. ₹11.0 Lakhs optimized).
   - Cost by service and storage class breakdown.

4. **Actionable Recommendations (`/recommendations`)**:
   - Top-level potential savings banner (₹31,800/mo · ₹3,81,600/yr).
   - 5 Priority-ranked recommendation cards (Duplicate cleanup, Archive old backups, Remove unused snapshots, Compress log files, Delete temp artifacts).
   - Interactive modal confirmation & simulated optimization workflows.

5. **Duplicate File Manager (`/duplicates`)**:
   - Scan & detect 1,284 duplicate files occupying 284 GB.
   - Multi-select checkbox table with batch deletion modal and real-time savings counter.

6. **Automated Reports (`/reports`)**:
   - Generate, preview, and download PDF / CSV reports with step-by-step progress simulation.

7. **Multi-Cloud Integration (`/cloud-providers`)**:
   - AWS S3, Google Cloud Storage, and Azure Blob Storage integrations.
   - Simulated provider connection modal and live bucket sync.

8. **Settings & Governance (`/settings`)**:
   - Configurable account details, notification channels, budget threshold limits, and theme preferences.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.17.0 or later)
- npm / yarn / pnpm

### Installation

```bash
# 1. Clone repository
git clone https://github.com/praveeng8969-cmd/CloudCostCuttingDashboard.git

# 2. Navigate to project root
cd CloudCostCuttingDashboard

# 3. Install dependencies
npm install

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Access

- **Demo URL**: `http://localhost:3000/login`
- **Email**: `admin@cloudcut.demo` (or click *Access Demo Account*)
- **Password**: `demo1234` (any credentials will work for prototype demonstration)

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts & Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

---

## 👥 Presentation Walkthrough (2–3 Minutes Flow)

1. **Login (`/login`)** → Click *Access Demo Account* or sign in.
2. **Dashboard (`/dashboard`)** → Review the ₹1,24,500 monthly spend and the ₹31,800 savings opportunity.
3. **Storage Analysis (`/storage`)** → Inspect department storage allocation and search large files.
4. **Duplicate Detection (`/duplicates`)** → Select duplicate files and trigger batch deletion.
5. **Recommendations (`/recommendations`)** → Execute an optimization action and view the confirmation toast.
6. **Reports (`/reports`)** → Simulate report generation and export.
7. **Cloud Providers (`/cloud-providers`)** → Connect Azure Blob Storage and sync buckets.
