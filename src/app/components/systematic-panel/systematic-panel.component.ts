import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SamplingHistoryEntry, SystematicResult } from '../../models/sampling.models';
import { SamplingCalculatorService } from '../../services/sampling-calculator.service';

@Component({
  selector: 'app-systematic-panel',
  imports: [CommonModule, FormsModule],
  templateUrl: './systematic-panel.component.html',
  styleUrl: './systematic-panel.component.scss',
})
export class SystematicPanelComponent {
  @Output() historyCreated = new EventEmitter<SamplingHistoryEntry>();

  prefix = 'Persona';
  rangeStart = 1;
  rangeEnd = 40;
  populationText = '';
  sampleSize = 10;
  startPosition: number | null = null;
  result: SystematicResult | null = null;
  errorMessage = '';

  constructor(private readonly calculator: SamplingCalculatorService) {
    this.generatePopulation();
  }

  generatePopulation(): void {
    const start = Math.min(this.rangeStart, this.rangeEnd);
    const end = Math.max(this.rangeStart, this.rangeEnd);
    this.populationText = Array.from({ length: end - start + 1 }, (_, index) => {
      const value = start + index;
      return this.prefix.trim() ? `${this.prefix.trim()} ${value}` : String(value);
    }).join('\n');
  }

  calculate(): void {
    this.errorMessage = '';
    try {
      const population = this.populationText.split('\n');
      this.result = this.calculator.calculateSystematicSample(
        population,
        this.sampleSize,
        this.startPosition ?? undefined,
      );
      this.historyCreated.emit(
        this.calculator.createHistoryEntry(
          'systematic',
          'Muestreo sistematico',
          `${this.result.sample.length} unidades con intervalo ${this.result.interval}`,
        ),
      );
    } catch (error) {
      this.result = null;
      this.errorMessage = error instanceof Error ? error.message : 'No se pudo calcular.';
    }
  }
}

