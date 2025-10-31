import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="task-detail-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            {{ isEditMode ? 'Edit Task' : 'Task Details' }}
          </mat-card-title>
          <div class="header-actions">
            <button mat-icon-button (click)="goBack()">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <ng-container *ngIf="!isEditMode">
              <button mat-raised-button color="primary" (click)="toggleEditMode()">
                <mat-icon>edit</mat-icon>
                Edit Task
              </button>
            </ng-container>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="isLoading" class="loading-spinner">
            <mat-progress-spinner mode="indeterminate"></mat-progress-spinner>
          </div>

          <ng-container *ngIf="task && !isLoading">
            <div class="task-content" [ngClass]="{'edit-mode': isEditMode}">
              <!-- View Mode -->
              <ng-container *ngIf="!isEditMode">
                <div class="task-header">
                  <h2>{{task.title}}</h2>
                  <div class="task-meta">
                    <mat-chip [color]="getStatusColor(task.status)" selected>
                      {{task.status | titlecase}}
                    </mat-chip>
                    <mat-chip [color]="getPriorityColor(task.priority)" selected>
                      {{task.priority | titlecase}}
                    </mat-chip>
                    <span class="due-date">
                      Due: {{task.dueDate | date:'mediumDate'}}
                    </span>
                  </div>
                </div>
                <div class="task-description">
                  <p>{{task.body}}</p>
                </div>
              </ng-container>

              <!-- Edit Mode -->
              <ng-container *ngIf="isEditMode">
                <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
                  <mat-form-field appearance="outline">
                    <mat-label>Title</mat-label>
                    <input matInput formControlName="title" required>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" rows="4"></textarea>
                  </mat-form-field>

                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Status</mat-label>
                      <mat-select formControlName="status" required>
                        <mat-option value="pending">Pending</mat-option>
                        <mat-option value="in-progress">In Progress</mat-option>
                        <mat-option value="completed">Completed</mat-option>
                        <mat-option value="overdue">Overdue</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Priority</mat-label>
                      <mat-select formControlName="priority" required>
                        <mat-option value="low">Low</mat-option>
                        <mat-option value="medium">Medium</mat-option>
                        <mat-option value="high">High</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Due Date</mat-label>
                      <input matInput [matDatepicker]="picker" formControlName="dueDate" required>
                      <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                      <mat-datepicker #picker></mat-datepicker>
                    </mat-form-field>
                  </div>

                  <div class="form-actions">
                    <button mat-button type="button" (click)="cancelEdit()">Cancel</button>
                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="taskForm.invalid || taskForm.pristine">
                      Save Changes
                    </button>
                  </div>
                </form>
              </ng-container>
            </div>
          </ng-container>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .task-detail-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .header-actions {
      margin-left: auto;
      display: flex;
      gap: 8px;
    }

    .task-content {
      margin-top: 20px;
    }

    .task-header {
      margin-bottom: 24px;

      h2 {
        margin: 0 0 16px 0;
        font-size: 24px;
      }
    }

    .task-meta {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .task-description {
      margin-top: 24px;
      line-height: 1.6;
    }

    .due-date {
      margin-left: 16px;
      color: rgba(0, 0, 0, 0.6);
    }

    .edit-mode {
      form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;

        mat-form-field {
          flex: 1;
          min-width: 200px;
        }
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
  `]
})
export class TaskDetailComponent implements OnInit {
  public task: Task | null = null;
  public isEditMode = false;
  public isLoading = false;
  public taskForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private taskService: TaskService
  ) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status: ['', Validators.required],
      priority: ['', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  public ngOnInit(): void {
    // Check if we're in edit mode
    this.route.data.subscribe(data => {
      this.isEditMode = data['mode'] === 'edit';
    });

    // Get task ID from route params
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadTask(Number(id));
      }
    });
  }

  private loadTask(id: number): void {
    this.isLoading = true;
    this.taskService.getTaskById(id).subscribe({
      next: (task) => {
        this.task = task;
        if (this.isEditMode) {
          this.taskForm.patchValue({
            title: task.title,
            description: task.body,
            status: task.status || 'pending',
            priority: task.priority || 'medium',
            dueDate: task.dueDate ? new Date(task.dueDate) : new Date()
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading task:', error);
        this.isLoading = false;
        this.router.navigate(['/tasks']);
      }
    });
  }

  public toggleEditMode(): void {
    this.isEditMode = true;
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.body,
        status: this.task.status || 'pending',
        priority: this.task.priority || 'medium',
        dueDate: this.task.dueDate ? new Date(this.task.dueDate) : new Date()
      });
    }
  }

  public cancelEdit(): void {
    this.isEditMode = false;
    this.taskForm.reset();
  }

  public onSubmit(): void {
    if (this.taskForm.valid && this.task) {
      this.isLoading = true;
      const updatedTask = {
        id: this.task.id,
        title: this.taskForm.value.title,
        body: this.taskForm.value.description,
        status: this.taskForm.value.status,
        priority: this.taskForm.value.priority,
        dueDate: this.taskForm.value.dueDate.toISOString().split('T')[0],
        userId: this.task.userId
      };

      this.taskService.updateTask(updatedTask).subscribe({
        next: () => {
          this.isEditMode = false;
          this.isLoading = false;
          this.loadTask(this.task!.id); // Reload task to show updated data
        },
        error: (error) => {
          console.error('Error updating task:', error);
          this.isLoading = false;
        }
      });
    }
  }

  public goBack(): void {
    this.router.navigate(['/tasks']);
  }

  public getStatusColor(status: string | undefined): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'completed':
        return 'primary';
      case 'in-progress':
        return 'accent';
      default:
        return 'warn';
    }
  }

  public getPriorityColor(priority: string | undefined): 'primary' | 'accent' | 'warn' {
    switch (priority) {
      case 'low':
        return 'primary';
      case 'medium':
        return 'accent';
      case 'high':
        return 'warn';
      default:
        return 'primary';
    }
  }
}
