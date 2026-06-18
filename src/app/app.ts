import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SamplingHistoryEntry, SamplingMethod } from './models/sampling.models';
import { ClusterPanelComponent } from './components/cluster-panel/cluster-panel.component';
import { HistoryPanelComponent } from './components/history-panel/history-panel.component';
import { SampleSizePanelComponent } from './components/sample-size-panel/sample-size-panel.component';
import { StratifiedPanelComponent } from './components/stratified-panel/stratified-panel.component';
import { SystematicPanelComponent } from './components/systematic-panel/systematic-panel.component';
import { SamplingCalculatorService } from './services/sampling-calculator.service';

interface MethodTab {
  id: SamplingMethod;
  label: string;
  caption: string;
}

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    ClusterPanelComponent,
    HistoryPanelComponent,
    SampleSizePanelComponent,
    StratifiedPanelComponent,
    SystematicPanelComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  activeMethod: SamplingMethod = 'simple';
  history: SamplingHistoryEntry[] = [];

  readonly methods: MethodTab[] = [
    { id: 'simple', label: 'Simple', caption: 'Tamano base' },
    { id: 'stratified', label: 'Estratificado', caption: 'Asignacion' },
    { id: 'cluster', label: 'Conglomerados', caption: 'Seleccion' },
    { id: 'systematic', label: 'Sistematico', caption: 'Intervalo' },
  ];

  constructor(private readonly calculator: SamplingCalculatorService) {
    this.history = this.calculator.loadHistory();
  }

  setMethod(method: SamplingMethod): void {
    this.activeMethod = method;
  }

  addHistory(entry: SamplingHistoryEntry): void {
    this.history = [entry, ...this.history].slice(0, 12);
    this.calculator.saveHistory(this.history);
  }

  clearHistory(): void {
    this.history = [];
    this.calculator.saveHistory([]);
  }
}

