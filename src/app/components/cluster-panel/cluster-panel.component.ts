import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Cluster, ClusterResult, SamplingHistoryEntry } from '../../models/sampling.models';
import { SamplingCalculatorService } from '../../services/sampling-calculator.service';

@Component({
  selector: 'app-cluster-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './cluster-panel.component.html',
  styleUrl: './cluster-panel.component.scss',
})
export class ClusterPanelComponent {
  @Output() historyCreated = new EventEmitter<SamplingHistoryEntry>();

  clusters: Cluster[] = [
    { id: 1, name: 'Sector Norte', members: ['N-01', 'N-02', 'N-03', 'N-04'] },
    { id: 2, name: 'Sector Centro', members: ['C-01', 'C-02', 'C-03'] },
    { id: 3, name: 'Sector Sur', members: ['S-01', 'S-02', 'S-03', 'S-04'] },
  ];
  clusterName = '';
  clusterMembers = '';
  clustersToSelect = 2;
  result: ClusterResult | null = null;
  errorMessage = '';

  constructor(private readonly calculator: SamplingCalculatorService) {}

  get selectedClusterNames(): string {
    return this.result?.selectedClusters.map((cluster) => cluster.name).join(', ') ?? '';
  }

  get finalSampleText(): string {
    return this.result?.finalSample.join(', ') ?? '';
  }

  addCluster(): void {
    const members = this.clusterMembers
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (!this.clusterName.trim() || !members.length) {
      this.errorMessage = 'Completa el nombre y los integrantes del conglomerado.';
      return;
    }

    const nextId = Math.max(...this.clusters.map((item) => item.id), 0) + 1;
    this.clusters = [...this.clusters, { id: nextId, name: this.clusterName.trim(), members }];
    this.clusterName = '';
    this.clusterMembers = '';
    this.errorMessage = '';
  }

  removeCluster(id: number): void {
    this.clusters = this.clusters.filter((item) => item.id !== id);
  }

  calculate(): void {
    this.errorMessage = '';
    try {
      this.result = this.calculator.calculateClusterSample(this.clusters, this.clustersToSelect);
      this.historyCreated.emit(
        this.calculator.createHistoryEntry(
          'cluster',
          'Muestreo por conglomerados',
          `${this.result.finalSample.length} unidades desde ${this.result.selectedClusters.length} conglomerados`,
        ),
      );
    } catch (error) {
      this.result = null;
      this.errorMessage = error instanceof Error ? error.message : 'No se pudo calcular.';
    }
  }
}
