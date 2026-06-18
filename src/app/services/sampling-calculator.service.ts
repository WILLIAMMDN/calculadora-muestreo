import { Injectable } from '@angular/core';
import {
  Cluster,
  ClusterResult,
  SampleSizeRequest,
  SampleSizeResult,
  SamplingHistoryEntry,
  SamplingMethod,
  StratifiedResult,
  Stratum,
  SummaryItem,
  SystematicResult,
} from '../models/sampling.models';

@Injectable({ providedIn: 'root' })
export class SamplingCalculatorService {
  private readonly historyKey = 'calculadora-muestreo-history-v2';

  calculateSampleSize(request: SampleSizeRequest): SampleSizeResult {
    this.assertSampleRequest(request);

    const zScore = this.getZScore(request.confidence);
    const q = 1 - request.proportion;
    const initial =
      (Math.pow(zScore, 2) * request.proportion * q) / Math.pow(request.marginError, 2);

    const finiteCorrectionApplied =
      request.populationType === 'finite' && typeof request.population === 'number';

    const exactSampleSize = finiteCorrectionApplied
      ? (request.population! * initial) / (request.population! + initial - 1)
      : initial;

    const sampleSize = Math.ceil(exactSampleSize);
    const formula = finiteCorrectionApplied
      ? 'n = (N x Z^2 x p x q) / ((N - 1) x e^2 + Z^2 x p x q)'
      : 'n = (Z^2 x p x q) / e^2';

    return {
      sampleSize,
      exactSampleSize,
      zScore,
      q,
      formula,
      finiteCorrectionApplied,
      summary: [
        { label: 'Nivel de confianza', value: `${request.confidence}%` },
        { label: 'Z critico', value: zScore.toFixed(3) },
        { label: 'Proporcion esperada', value: this.asPercent(request.proportion) },
        { label: 'Error maximo', value: this.asPercent(request.marginError) },
        {
          label: 'Tipo de poblacion',
          value: finiteCorrectionApplied ? `${request.population} elementos` : 'Infinita',
        },
      ],
    };
  }

  calculateStratified(request: SampleSizeRequest, strata: Stratum[]): StratifiedResult {
    const cleanedStrata = strata.filter((item) => item.name.trim() && item.population > 0);
    if (!cleanedStrata.length) {
      throw new Error('Agrega al menos un estrato valido.');
    }

    const totalPopulation = cleanedStrata.reduce((sum, item) => sum + item.population, 0);
    const baseResult = this.calculateSampleSize({
      ...request,
      populationType: 'finite',
      population: totalPopulation,
    });

    const allocations = cleanedStrata.map((item) => {
      const weight = item.population / totalPopulation;
      const exactSample = baseResult.exactSampleSize * weight;
      return {
        name: item.name.trim(),
        population: item.population,
        weight,
        exactSample,
        sample: Math.ceil(exactSample),
      };
    });

    return {
      ...baseResult,
      totalPopulation,
      totalAllocated: allocations.reduce((sum, item) => sum + item.sample, 0),
      allocations,
    };
  }

  calculateClusterSample(clusters: Cluster[], count: number): ClusterResult {
    const validClusters = clusters.filter((cluster) => cluster.name.trim() && cluster.members.length);
    if (!validClusters.length) {
      throw new Error('Agrega conglomerados con integrantes.');
    }
    if (!Number.isInteger(count) || count < 1 || count > validClusters.length) {
      throw new Error('El numero de conglomerados debe estar dentro del rango disponible.');
    }

    const selectedClusters = this.shuffle(validClusters).slice(0, count);
    const finalSample = selectedClusters.flatMap((cluster) => cluster.members);

    return {
      selectedClusters,
      finalSample,
      summary: [
        { label: 'Conglomerados disponibles', value: String(validClusters.length) },
        { label: 'Conglomerados seleccionados', value: String(selectedClusters.length) },
        { label: 'Unidades finales', value: String(finalSample.length) },
      ],
    };
  }

  calculateSystematicSample(
    population: string[],
    sampleSize: number,
    startPosition?: number,
  ): SystematicResult {
    const cleanPopulation = population.map((item) => item.trim()).filter(Boolean);
    if (!cleanPopulation.length) {
      throw new Error('Agrega una poblacion para calcular la muestra.');
    }
    if (!Number.isInteger(sampleSize) || sampleSize < 1 || sampleSize > cleanPopulation.length) {
      throw new Error('El tamano de muestra debe ser mayor que cero y menor o igual a la poblacion.');
    }

    const interval = Math.floor(cleanPopulation.length / sampleSize);
    if (interval < 1) {
      throw new Error('El intervalo calculado no es valido.');
    }

    const selectedStart =
      typeof startPosition === 'number' && startPosition > 0
        ? Math.min(startPosition, interval)
        : this.randomInteger(1, interval);

    const sample = Array.from({ length: sampleSize }, (_, index) => {
      const itemIndex = (selectedStart - 1 + index * interval) % cleanPopulation.length;
      return cleanPopulation[itemIndex];
    });

    return {
      interval,
      startPosition: selectedStart,
      populationSize: cleanPopulation.length,
      sample,
      summary: [
        { label: 'Poblacion', value: String(cleanPopulation.length) },
        { label: 'Tamano de muestra', value: String(sampleSize) },
        { label: 'Intervalo k', value: String(interval) },
        { label: 'Inicio', value: String(selectedStart) },
      ],
    };
  }

  createHistoryEntry(method: SamplingMethod, label: string, result: string): SamplingHistoryEntry {
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      method,
      label,
      result,
    };
  }

  loadHistory(): SamplingHistoryEntry[] {
    try {
      const raw = localStorage.getItem(this.historyKey);
      return raw ? (JSON.parse(raw) as SamplingHistoryEntry[]) : [];
    } catch {
      return [];
    }
  }

  saveHistory(entries: SamplingHistoryEntry[]): void {
    localStorage.setItem(this.historyKey, JSON.stringify(entries.slice(0, 12)));
  }

  asPercent(value: number): string {
    return `${(value * 100).toFixed(value * 100 < 10 ? 2 : 1)}%`;
  }

  private assertSampleRequest(request: SampleSizeRequest): void {
    if (request.populationType === 'finite') {
      if (!request.population || request.population <= 1) {
        throw new Error('La poblacion finita debe ser mayor que 1.');
      }
    }
    if (request.confidence <= 0 || request.confidence >= 100) {
      throw new Error('El nivel de confianza debe estar entre 0 y 100.');
    }
    if (request.proportion <= 0 || request.proportion >= 1) {
      throw new Error('La proporcion esperada debe estar entre 0 y 100%.');
    }
    if (request.marginError <= 0 || request.marginError >= 1) {
      throw new Error('El error maximo debe estar entre 0 y 100%.');
    }
  }

  private getZScore(confidence: number): number {
    const knownValues = new Map<number, number>([
      [80, 1.282],
      [85, 1.44],
      [90, 1.645],
      [95, 1.96],
      [98, 2.326],
      [99, 2.576],
    ]);

    const known = knownValues.get(confidence);
    if (known) {
      return known;
    }

    const cumulativeProbability = 1 - (1 - confidence / 100) / 2;
    return this.inverseNormalCdf(cumulativeProbability);
  }

  private inverseNormalCdf(probability: number): number {
    const a = [
      -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
      1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
    ];
    const b = [
      -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
      6.680131188771972e1, -1.328068155288572e1,
    ];
    const c = [
      -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
      -2.549732539343734, 4.374664141464968, 2.938163982698783,
    ];
    const d = [
      7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
      3.754408661907416,
    ];
    const pLow = 0.02425;
    const pHigh = 1 - pLow;

    if (probability < pLow) {
      const q = Math.sqrt(-2 * Math.log(probability));
      return (
        (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
      );
    }

    if (probability <= pHigh) {
      const q = probability - 0.5;
      const r = q * q;
      return (
        (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q /
        (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
      );
    }

    const q = Math.sqrt(-2 * Math.log(1 - probability));
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }

  private shuffle<T>(items: T[]): T[] {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
    }
    return copy;
  }

  private randomInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

