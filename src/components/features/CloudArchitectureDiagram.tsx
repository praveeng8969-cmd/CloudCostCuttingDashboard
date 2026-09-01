'use client'

import { useState } from 'react'
import {
  Cloud, HardDrive, Database, Archive, Sparkles,
  ArrowRight, ShieldCheck, AlertCircle, RefreshCw, Zap
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export default function CloudArchitectureDiagram() {
  const [activeNode, setActiveNode] = useState<string | null>('dedup')

  const nodes = [
    {
      id: 'ingest',
      label: 'Cloud Ingestion',
      sub: 'Multi-Cloud Egress',
      tier: 'Raw Data Stream',
      cost: '₹14,800/mo',
      color: 'border-yellow-400 text-yellow-300 bg-yellow-950/40 shadow-yellow-500/20',
      glow: '#eab308',
      icon: Cloud,
      details: 'Ingesting raw logs, database dumps, and application assets across US-East and AP-South regions.'
    },
    {
      id: 'hot',
      label: 'Standard S3 / Hot',
      sub: 'AWS & GCP Buckets',
      tier: 'High-Cost Tier',
      cost: '₹62,400/mo',
      color: 'border-blue-500 text-blue-400 bg-blue-950/40 shadow-blue-500/20',
      glow: '#3b82f6',
      icon: HardDrive,
      details: 'Primary production storage for engineering and marketing. 6.8 TB currently stored at premium rate.'
    },
    {
      id: 'dedup',
      label: 'Deduplication AI',
      sub: 'Waste Detector',
      tier: 'Optimization Engine',
      cost: '-₹12,000/mo',
      color: 'border-orange-500 text-orange-400 bg-orange-950/40 shadow-orange-500/20',
      glow: '#f97316',
      icon: Sparkles,
      details: 'Detects 1,284 duplicate files (284 GB) and removes redundant replicas with zero data loss.'
    },
    {
      id: 'reaper',
      label: 'Snapshot Reaper',
      sub: 'Unused EBS Disks',
      tier: 'Orphan Cleaner',
      cost: '-₹5,200/mo',
      color: 'border-red-500 text-red-400 bg-red-950/40 shadow-red-500/20',
      glow: '#ef4444',
      icon: AlertCircle,
      details: 'Identifies 32 orphan disk snapshots older than 180 days across terminated EC2 / VM compute instances.'
    },
    {
      id: 'cold',
      label: 'Glacier Deep Archive',
      sub: '80% Cheaper Tier',
      tier: 'Target State',
      cost: '₹11,200/mo',
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40 shadow-emerald-500/20',
      glow: '#10b981',
      icon: Archive,
      details: 'Automated lifecycle transitions move 620 GB old database backups into low-cost cold storage.'
    },
  ]

  const selectedNode = nodes.find(n => n.id === activeNode) ?? nodes[2]

  return (
    <div className="card p-6 card-glow-cyan overflow-hidden relative">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="section-title">Cloud Storage Data Flow & Cost Optimization Topology</h3>
          </div>
          <p className="section-sub">Interactive visual topology mapping live ingestion, waste filters, and cold tier routing.</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-2.5 py-1 bg-yellow-400/20 text-yellow-300 rounded-lg border border-yellow-400/30">Yellow: Ingest</span>
          <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">Blue: Active</span>
          <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 rounded-lg border border-orange-500/30">Orange: Duplicates</span>
          <span className="px-2.5 py-1 bg-red-500/20 text-red-400 rounded-lg border border-red-500/30">Red: Orphan Waste</span>
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">Green: Optimized</span>
        </div>
      </div>

      {/* SVG Topology Nodes Flow */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative z-10 mb-5">
        {nodes.map((node, index) => {
          const Icon = node.icon
          const isSelected = activeNode === node.id
          return (
            <div
              key={node.id}
              onClick={() => {
                setActiveNode(node.id)
                toast.success(`Inspecting node: ${node.label}`)
              }}
              className={clsx(
                'p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none relative group',
                node.color,
                isSelected ? 'scale-105 ring-2 ring-white/30 shadow-xl' : 'hover:scale-102 opacity-85 hover:opacity-100'
              )}
            >
              {/* Top Bar Indicator */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center shadow-inner">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/50">
                  Step {index + 1}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-black tracking-tight">{node.label}</h4>
                <p className="text-[10px] opacity-80 mt-0.5">{node.sub}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-semibold opacity-70">{node.tier}</span>
                <span className="text-xs font-black">{node.cost}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Node Inspector Box */}
      <div className="p-4.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md flex-shrink-0"
            style={{ backgroundColor: selectedNode.glow }}
          >
            <selectedNode.icon className="w-5 h-5 text-gray-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-white">{selectedNode.label}</h4>
              <span className="text-xs font-bold text-emerald-400">{selectedNode.cost}</span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{selectedNode.details}</p>
          </div>
        </div>

        <button
          onClick={() => toast.success(`Simulated auto-tuning executed on ${selectedNode.label}!`)}
          className="btn-primary text-xs flex-shrink-0 whitespace-nowrap"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-300" />
          Auto-Tune Node
        </button>
      </div>
    </div>
  )
}
