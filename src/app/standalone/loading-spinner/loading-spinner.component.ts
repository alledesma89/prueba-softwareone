import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="spinner-container" [class.overlay]="overlay">
      <mat-spinner
        [diameter]="diameter"
        [strokeWidth]="strokeWidth"
        [color]="color"
        [mode]="mode"
      ></mat-spinner>
      <span *ngIf="message" class="spinner-message">{{ message }}</span>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100px;
      gap: 1rem;
    }

    .spinner-message {
      margin-top: 0.5rem;
      color: var(--mat-sys-color-on-surface);
      font-size: 0.875rem;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.32);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;

      .mat-mdc-progress-spinner {
        ::ng-deep circle {
          stroke: var(--mat-sys-color-primary);
        }
      }

      .spinner-message {
        color: var(--mat-sys-color-on-surface-variant);
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  /**
   * Whether to show the spinner as an overlay on top of the entire viewport
   */
  @Input() public overlay = false;

  /**
   * The diameter of the spinner in pixels
   */
  @Input() public diameter = 40;

  /**
   * The stroke width of the spinner in pixels
   */
  @Input() public strokeWidth = 4;

  /**
   * The theme color palette to use for the spinner
   */
  @Input() public color: 'primary' | 'accent' | 'warn' = 'primary';

  /**
   * The mode of the spinner (determinate or indeterminate)
   */
  @Input() public mode: 'determinate' | 'indeterminate' = 'indeterminate';

  /**
   * Optional message to display below the spinner
   */
  @Input() public message?: string;
}