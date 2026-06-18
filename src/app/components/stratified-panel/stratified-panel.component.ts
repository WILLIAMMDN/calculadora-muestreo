import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  SamplingHistoryEntry,
  StratifiedResult,
  Stratum,
  SummaryItem,
} from '../../models/sampling.models';
import { SamplingCalculatorService } from '../../services/sampling-calculator.service';
import { ResultPanelComponent } from '../result-panel/result-panel.component';

@Component({
  selector: 'app-stratified-panel',
  imports: [CommonModule, FormsModule, ResultPanelComponent],
  templateUrl: './stratified-panel.component.html',
  styleUrl: './stratified-panel.component.scss',
})
export class StratifiedPanelComponent {
  @Output() historyCreated = new EventEmitter<SamplingHistoryEntry>();

  confidence = 95;
  proportion = 50;
  marginError = 5;
  strata: Stratum[] = [
    { id: 1, name: 'Estrato A', population: 300 },
    { id: 2, name: 'Estrato B', population: 450 },
    { id: 3, name: 'Estrato C', population: 250 },
  ];
  result: StratifiedResult | null = null;
  errorMessage = '';

  constructor(private readonly calculator: SamplingCalculatorService) {}

  get resultSummary(): SummaryItem[] {
    if (!this.result) {
      return [];
    }

    return [
      { label: 'Poblacion total', value: this.result.totalPopulation.toString() },
      { label: 'Total asignado', value: this.result.totalAllocated.toString() },
    ];
  }

  addStratum(): void {
    const nextId = Math.max(...this.strata.map((item) => item.id), 0) + 1;
    this.strata = [...this.strata, { id: nextId, name: `Estrato ${nextId}`, population: 100 }];
  }

  removeStratum(id: number): void {
    this.strata = this.strata.filter((item) => item.id !== id);
  }

  calculate(): void {
    this.errorMessage = '';
    try {
      this.result = this.calculator.calculateStratified(
        {
          populationType: 'finite',
          confidence: this.confidence,
          proportion: this.proportion / 100,
          marginError: this.marginError / 100,
        },
        this.strata,
      );
      this.historyCreated.emit(
        this.calculator.createHistoryEntry(
          'stratified',
          'Asignacion estratificada',
          `${this.result.totalAllocated} unidades distribuidas en ${this.result.allocations.length} estratos`,
        ),
      );
    } catch (error) {
      this.result = null;
      this.errorMessage = error instanceof Error ? error.message : 'No se pudo calcular.';
    }
  }
}
