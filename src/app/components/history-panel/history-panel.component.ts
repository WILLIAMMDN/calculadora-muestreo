import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SamplingHistoryEntry } from '../../models/sampling.models';

@Component({
  selector: 'app-history-panel',
  imports: [CommonModule, DatePipe],
  templateUrl: './history-panel.component.html',
  styleUrl: './history-panel.component.scss',
})
export class HistoryPanelComponent {
  @Input() entries: SamplingHistoryEntry[] = [];
  @Output() cleared = new EventEmitter<void>();
}

