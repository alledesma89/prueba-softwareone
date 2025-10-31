import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'app-task-quick-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <mat-card *ngIf="task || isLoading || error" class="quick-view-card">
      <mat-card-header>
        <mat-card-title>Task Quick View</mat-card-title>
        <mat-card-subtitle *ngIf="task">ID: {{ task.id }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <div *ngIf="isLoading" class="loading">
          <mat-progress-spinner diameter="32" mode="indeterminate"></mat-progress-spinner>
          <span class="loading-text">Loading task...</span>
        </div>

        <div *ngIf="error && !isLoading" class="error">
          <p>Error loading task: {{ error }}</p>
        </div>

        <div *ngIf="task && !isLoading" class="details">
          <h3 class="title">{{ task.title }}</h3>
          <p class="body">{{ task.body }}</p>
          <p class="meta">User ID: {{ task.userId }}</p>
        </div>
      </mat-card-content>

      <mat-card-actions>
        <button mat-stroked-button color="primary" (click)="reload()">Reload</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [
    `
      .quick-view-card { max-width: 560px; margin: 8px; }
      .loading { display:flex; align-items:center; gap:8px; }
      .loading-text { font-size: 14px; }
      .details .title { margin: 0 0 8px 0; }
      .details .body { margin: 0 0 8px 0; color: rgba(0,0,0,0.87); }
      .meta { font-size: 12px; color: rgba(0,0,0,0.6); }
      .error { color: #b00020; }
    `
  ]
})
export class TaskQuickViewComponent implements OnChanges {
  @Input() taskId: number | null = null;

  public task: Task | null = null;
  public isLoading = false;
  public error: string | null = null;

  constructor(private taskService: TaskService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskId'] && this.taskId != null) {
      this.loadTask(this.taskId);
    }
  }

  public reload(): void {
    if (this.taskId != null) {
      this.loadTask(this.taskId);
    }
  }

  private loadTask(id: number): void {
    this.isLoading = true;
    this.error = null;
    this.task = null;

    this.taskService.getTaskById(id).subscribe({
      next: (t) => {
        this.task = t;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = (err instanceof Error) ? err.message : String(err);
        this.isLoading = false;
      }
    });
  }
}
