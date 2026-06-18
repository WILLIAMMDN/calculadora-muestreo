import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SampleSizeResult, SummaryItem } from '../../models/sampling.models';

@Component({
  selector: 'app-result-panel',
  imports: [CommonModule],
  templateUrl: './result-panel.component.html',
  styleUrl: './result-panel.component.scss',
})
export class ResultPanelComponent {
  @Input() result: SampleSizeResult | null = null;
  @Input() title = 'Resultado';
  @Input() extraSummary: SummaryItem[] = [];
}

