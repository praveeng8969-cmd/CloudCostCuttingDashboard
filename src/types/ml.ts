export type MLPredictionClass = 'KEEP' | 'REVIEW' | 'ARCHIVE_CANDIDATE'
export type AnalysisJobStatus = 'PENDING' | 'VALIDATING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface MLPrediction {
  fileId: string
  prediction: MLPredictionClass
  confidence: number
  explanation: string
  probabilities: Record<string, number>
}

export interface MLModelInfo {
  modelName: string
  modelVersion: string
  algorithm: string
  trainingDatasetType: string
  metrics: {
    accuracy: number
    precision: number
    recall: number
    f1: number
  }
}

export interface SharedMLAnalysis {
  customerId: string
  datasetId: string
  datasetFingerprint: string
  modelVersion: string
  analyzedAt: string
  predictions: MLPrediction[]
}

export interface OptimizationScenario {
  fileId: string
  source: 'ML_SUPPORTED'
  prediction: MLPredictionClass
  confidence: number
  currentStorageClass: string
  proposedStorageClass: string | null
  currentMonthlyCost: number
  proposedMonthlyCost: number
  grossMonthlySavings: number
  action: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  ruleSignals: string[]
  constraints: string[]
  eligible: boolean
}

export interface OptimizationSummary {
  scenarios: OptimizationScenario[]
  currentMonthlyCost: number
  mlFlaggedStorageCost: number
  grossPotentialMonthlySavings: number
  estimatedOptimizedMonthlyCost: number
  counts: Record<MLPredictionClass, number>
}
