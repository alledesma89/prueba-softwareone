import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="alert" [ngClass]="type" role="alert">
      <div class="alert-content">
        <mat-icon>{{ iconName }}</mat-icon>
        <span class="message">{{ message }}</span>
      </div>
      <button mat-icon-button (click)="close.emit()" aria-label="Close alert">
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .alert {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-radius: 4px;
      margin: 8px 0;
      gap: 12px;

      .alert-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      mat-icon {
        font-size: 20px;
        height: 20px;
        width: 20px;
      }

      &.success {
        background-color: var(--mat-sys-color-success-container, #dcf7dc);
        color: var(--mat-sys-color-on-success-container, #003d00);
        
        mat-icon {
          color: var(--mat-sys-color-success, #4caf50);
        }
      }

      &.error {
        background-color: var(--mat-sys-color-error-container, #ffedea);
        color: var(--mat-sys-color-on-error-container, #410002);
        
        mat-icon {
          color: var(--mat-sys-color-error, #f44336);
        }
      }

      &.warning {
        background-color: var(--mat-sys-color-warning-container, #fff4e5);
        color: var(--mat-sys-color-on-warning-container, #412d00);
        
        mat-icon {
          color: var(--mat-sys-color-warning, #ff9800);
        }
      }

      &.info {
        background-color: var(--mat-sys-color-tertiary-container, #e8f0fe);
        color: var(--mat-sys-color-on-tertiary-container, #001d35);
        
        mat-icon {
          color: var(--mat-sys-color-tertiary, #2196f3);
        }
      }

      .message {
        font-size: 14px;
        line-height: 20px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent {
  @Input({ required: true }) message!: string;
  @Input({ required: true }) type: AlertType = 'info';
  @Output() close = new EventEmitter<void>();

  get iconName(): string {
    switch (this.type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
    }
  }
}