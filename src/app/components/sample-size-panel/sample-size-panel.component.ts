import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SamplingHistoryEntry, SampleSizeResult } from '../../models/sampling.models';
import { SamplingCalculatorService } from '../../services/sampling-calculator.service';
import { ResultPanelComponent } from '../result-panel/result-panel.component';

@Component({
  selector: 'app-sample-size-panel',
  imports: [CommonModule, FormsModule, ResultPanelComponent],
  templateUrl: './sample-size-panel.component.html',
  styleUrl: './sample-size-panel.component.scss',
})
export class SampleSizePanelComponent {
  @Output() historyCreated = new EventEmitter<SamplingHistoryEntry>();

  populationType: 'finite' | 'infinite' = 'finite';
  population = 1200;
  confidence = 95;
  proportion = 50;
  marginError = 5;
  result: SampleSizeResult | null = null;
  errorMessage = '';

  constructor(private readonly calculator: SamplingCalculatorService) {}

  calculate(): void {
    this.errorMessage = '';
    try {
      this.result = this.calculator.calculateSampleSize({
        populationType: this.populationType,
        population: this.populationType === 'finite' ? this.population : undefined,
        confidence: this.confidence,
        proportion: this.proportion / 100,
        marginError: this.marginError / 100,
      });
      this.historyCreated.emit(
        this.calculator.createHistoryEntry(
          'simple',
          'Tamano de muestra',
          `${this.result.sampleSize} unidades con ${this.confidence}% de confianza`,
        ),
      );
    } catch (error) {
      this.result = null;
      this.errorMessage = error instanceof Error ? error.message : 'No se pudo calcular.';
    }
  }
}

