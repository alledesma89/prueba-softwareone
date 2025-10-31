import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { TaskService } from '../../../../core/services/task.service';
import { TaskListDataSource } from './task-list.datasource';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    AlertComponent,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="task-list-container">
      <mat-card-header>
        <mat-card-title>Tareas</mat-card-title>
      </mat-card-header>

      <mat-card-content>
        <div class="filters-container">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Estado</mat-label>
            <mat-select [(ngModel)]="selectedStatus" (selectionChange)="applyFilters()">
              <mat-option value="">-- Todos --</mat-option>
              <mat-option value="pending">Pendiente</mat-option>
              <mat-option value="in-progress">En progreso</mat-option>
              <mat-option value="completed">Completada</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Prioridad</mat-label>
            <mat-select [(ngModel)]="selectedPriority" (selectionChange)="applyFilters()">
              <mat-option value="">-- Todas --</mat-option>
              <mat-option value="low">Baja</mat-option>
              <mat-option value="medium">Media</mat-option>
              <mat-option value="high">Alta</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Fecha límite</mat-label>
            <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDueDate" (dateChange)="applyFilters()">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Buscar tarea</mat-label>
          <input matInput #search placeholder="Título o descripción">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <div class="table-container">
          <table mat-table [dataSource]="dataSource" matSort class="task-table">
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Título</th>
              <td mat-cell *matCellDef="let task">{{task.title}}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Estado</th>
              <td mat-cell *matCellDef="let task">
                <mat-chip-set>
                  <mat-chip [color]="getStatusColor(task.status)" selected>
                    {{task.status | titlecase}}
                  </mat-chip>
                </mat-chip-set>
              </td>
            </ng-container>

            <ng-container matColumnDef="priority">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Prioridad</th>
              <td mat-cell *matCellDef="let task">{{task.priority | titlecase}}</td>
            </ng-container>

            <ng-container matColumnDef="dueDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Fecha límite</th>
              <td mat-cell *matCellDef="let task">{{task.dueDate | date}}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef aria-label="Acciones"></th>
              <td mat-cell *matCellDef="let task">
                <div class="action-buttons">
                  <button mat-icon-button (click)="editTask(task); $event.stopPropagation()" color="primary">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="deleteTask(task); $event.stopPropagation()" color="warn">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let task; columns: displayedColumns"
                (click)="editTask(task)"
                class="task-row">
            </tr>
          </table>

          <div class="loading-shade" *ngIf="isLoading">
            <mat-spinner></mat-spinner>
          </div>

          <app-alert *ngIf="alertMessage"
                    [message]="alertMessage"
                    [type]="alertType"
                    (close)="clearAlert()">
          </app-alert>
        </div>

        <mat-paginator [length]="dataSource.totalTasks"
                      [pageSize]="10"
                      [pageSizeOptions]="[5, 10, 25, 100]">
        </mat-paginator>
      </mat-card-content>

      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="createTask()">
          <mat-icon>add</mat-icon>
          Crear tarea
        </button>

        <div style="margin-left:16px;display:flex;gap:8px;align-items:center;">
          <button mat-stroked-button color="primary" (click)="exportTasks('json')" title="Exportar tareas en JSON">
            <mat-icon>download</mat-icon>
            Exportar JSON
          </button>
          <button mat-stroked-button color="primary" (click)="exportTasks('csv')" title="Exportar tareas en CSV">
            <mat-icon>download</mat-icon>
            Exportar CSV
          </button>
        </div>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .task-list-container {
      margin: 16px;
      max-width: 100%;
      overflow: hidden;
    }

    @media (max-width: 600px) {
      .task-list-container {
        margin: 8px;
      }
    }

    .search-field {
      width: 100%;
      max-width: 500px;
      margin-bottom: 16px;
    }

    .table-container {
      position: relative;
      min-height: 200px;
      overflow-x: auto;
      margin: -16px;
      padding: 16px;
    }

    .task-table {
      width: 100%;
      min-width: 600px;
      background: transparent;
    }

    @media (max-width: 960px) {
      .task-table {
        min-width: 500px;
      }
    }

    .task-row {
      cursor: pointer;
    }

    .task-row:hover {
      background: rgba(0, 0, 0, 0.04);
    }

    @media (max-width: 600px) {
      mat-card-content {
        padding: 8px !important;
      }
      
      .mat-column-actions {
        width: 48px;
      }

      .mat-column-title {
        min-width: 120px;
      }

      .mat-column-status {
        min-width: 100px;
      }
    }

    .loading-shade {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.15);
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    th.mat-sort-header-sorted {
      color: black;
    }

    .filters-container {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .filter-field {
      width: 200px;
    }

    @media (max-width: 768px) {
      .filters-container {
        flex-direction: row;
        align-items: stretch;
      }

      .filter-field {
        width: 100%;
      }
    }

    /* Menu button styling */
    .mat-column-actions {
      width: 100px !important;
      padding: 0 8px !important;
      text-align: center;
      vertical-align: middle;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: center;
      align-items: center;
      
      button {
        opacity: 0.8;
        transition: opacity 0.2s;

        &:hover {
          opacity: 1;
        }
      }
    }

    ::ng-deep {
      .mat-mdc-menu-panel {
        min-width: 144px !important;
      }

      .mat-mdc-menu-content {
        padding: 0 !important;
      }

      .mat-mdc-menu-item {
        min-height: 40px;
        line-height: 40px;
        
        .mat-icon {
          margin-right: 8px;
        }
      }
    }

    /* Ensure menu is above other elements */
    ::ng-deep .cdk-overlay-container {
      z-index: 1000;
    }
  `]
})
export class TaskListComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns: string[] = ['title', 'status', 'priority', 'dueDate', 'actions'];
  
  // Ensure menu items are shown on top of other elements
  menuZIndex = 1000;
  dataSource: TaskListDataSource;
  destroy$ = new Subject<void>();
  isLoading = false;
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';

  selectedStatus: string = '';
  selectedPriority: string = '';
  selectedDueDate: Date | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('search') searchInput: any;

  constructor(
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.dataSource = new TaskListDataSource(this.taskService);
  }

  ngOnInit() {
    // Don't call applyFilters() here because ViewChild elements such as
    // `searchInput` are not available until after view init. Initial data
    // load is performed in ngAfterViewInit once paginator/sort/search are set.
  }

  ngAfterViewInit() {
    // Configure sorting
    this.dataSource.sort = this.sort;
    
    // Configure pagination
    this.dataSource.paginator = this.paginator;
    // Load tasks once after paginator and sort are configured to avoid duplicate requests
    this.dataSource.loadTasks();

    // Configure search
    if (this.searchInput) {
      fromEvent(this.searchInput.nativeElement, 'keyup')
        .pipe(
          debounceTime(150),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.applyFilters();
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByTaskId(index: number, task: Task): number {
    return task.id;
  }

  createTask() {
    this.router.navigate(['/tasks/new']);
  }

  editTask(task: Task) {
    this.router.navigate(['/tasks', task.id, 'edit']);
  }

  deleteTask(task: Task) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      this.isLoading = true;
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.alertMessage = 'Tarea eliminada con éxito';
          this.alertType = 'success';
          this.dataSource.loadTasks();
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Error deleting task:', err);
          this.alertMessage = 'Error al eliminar la tarea';
          this.alertType = 'error';
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    }
  }

  clearAlert() {
    this.alertMessage = '';
    this.cdr.markForCheck();
  }

  applyFilters() {
    const searchValue = (this.searchInput && this.searchInput.nativeElement && this.searchInput.nativeElement.value)
      ? this.searchInput.nativeElement.value.trim().toLowerCase()
      : '';

    this.dataSource.loadTasks(
      searchValue,
      this.selectedStatus,
      this.selectedPriority,
      this.selectedDueDate ? this.selectedDueDate.toISOString() : null
    );
  }

  /** Export tasks as CSV or JSON. Fetches all tasks matching current filters (no pagination). */
  exportTasks(format: 'csv' | 'json') {
    const searchValue = (this.searchInput && this.searchInput.nativeElement && this.searchInput.nativeElement.value)
      ? this.searchInput.nativeElement.value.trim().toLowerCase()
      : '';

    // Build filters similar to data source but request many items
    const filters: any = {
      q: searchValue,
      status: this.selectedStatus || undefined,
      priority: this.selectedPriority || undefined,
      _limit: 10000 // large limit to fetch all
    };

    if (this.selectedDueDate) {
      filters.dueDate_like = this.selectedDueDate.toISOString().split('T')[0];
    }

    this.isLoading = true;
    this.taskService.getTasks(filters).subscribe({
      next: ({ tasks }) => {
        this.isLoading = false;
        if (format === 'json') {
          this.downloadFile(JSON.stringify(tasks, null, 2), 'tasks.json', 'application/json');
        } else {
          const csv = this.convertTasksToCSV(tasks);
          this.downloadFile(csv, 'tasks.csv', 'text/csv');
        }
      },
      error: (err: any) => {
        console.error('Error exporting tasks:', err);
        this.alertMessage = 'Error al exportar tareas';
        this.alertType = 'error';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private convertTasksToCSV(tasks: Task[]): string {
    if (!tasks || tasks.length === 0) return '';

    const columns = ['id', 'title', 'body', 'status', 'priority', 'dueDate', 'userId'];
    const header = columns.join(',');

    const rows = tasks.map(t => {
      return columns.map(col => {
        const val = (t as any)[col] ?? '';
        // escape double quotes
        const escaped = String(val).replace(/"/g, '""');
        // wrap in quotes if contains comma or newline
        if (/[,\n\r"]/g.test(escaped)) {
          return `"${escaped}"`;
        }
        return escaped;
      }).join(',');
    });

    return [header, ...rows].join('\r\n');
  }

  private downloadFile(content: string, filename: string, mime: string) {
    const blob = new Blob([content], { type: mime + ';charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  getStatusColor(status: string | undefined): 'primary' | 'accent' | 'warn' {
    if (!status) return 'warn';
    
    switch (status.toLowerCase()) {
      case 'completed':
        return 'primary';
      case 'in-progress':
        return 'accent';
      default:
        return 'warn';
    }
  }
}