export type SamplingMethod = 'simple' | 'stratified' | 'cluster' | 'systematic';

export interface SummaryItem {
  label: string;
  value: string;
}

export interface SampleSizeRequest {
  populationType: 'finite' | 'infinite';
  population?: number;
  confidence: number;
  proportion: number;
  marginError: number;
}

export interface SampleSizeResult {
  sampleSize: number;
  exactSampleSize: number;
  zScore: number;
  q: number;
  formula: string;
  finiteCorrectionApplied: boolean;
  summary: SummaryItem[];
}

export interface Stratum {
  id: number;
  name: string;
  population: number;
}

export interface StratumAllocation {
  name: string;
  population: number;
  weight: number;
  exactSample: number;
  sample: number;
}

export interface StratifiedResult extends SampleSizeResult {
  totalPopulation: number;
  totalAllocated: number;
  allocations: StratumAllocation[];
}

export interface Cluster {
  id: number;
  name: string;
  members: string[];
}

export interface ClusterResult {
  selectedClusters: Cluster[];
  finalSample: string[];
  summary: SummaryItem[];
}

export interface SystematicResult {
  interval: number;
  startPosition: number;
  populationSize: number;
  sample: string[];
  summary: SummaryItem[];
}

export interface SamplingHistoryEntry {
  id: string;
  createdAt: string;
  method: SamplingMethod;
  label: string;
  result: string;
}

