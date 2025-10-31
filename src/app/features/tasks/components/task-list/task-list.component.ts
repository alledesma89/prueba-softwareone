import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, fromEvent, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

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

import { TaskService } from '../../../../core/services/task.service';
import { TaskListDataSource } from './task-list.datasource';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
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
    MatPaginator,
    MatSort
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="task-list-container">
      <mat-card-header>
        <mat-card-title>Tareas</mat-card-title>
      </mat-card-header>

      <mat-card-content>
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
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let task">
                <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menu="matMenu">
                  <button mat-menu-item (click)="editTask(task); $event.stopPropagation();">
                    <mat-icon>edit</mat-icon>
                    <span>Editar</span>
                  </button>
                  <button mat-menu-item (click)="deleteTask(task); $event.stopPropagation();">
                    <mat-icon>delete</mat-icon>
                    <span>Eliminar</span>
                  </button>
                </mat-menu>
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

        <mat-paginator [length]="100"
                      [pageSize]="10"
                      [pageSizeOptions]="[5, 10, 25, 100]">
        </mat-paginator>
      </mat-card-content>

      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="createTask()">
          <mat-icon>add</mat-icon>
          Crear tarea
        </button>
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
  `]
})
export class TaskListComponent implements OnInit, OnDestroy, AfterViewInit {
  displayedColumns: string[] = ['title', 'status', 'priority', 'dueDate', 'actions'];
  dataSource: TaskListDataSource;
  destroy$ = new Subject<void>();
  isLoading = false;
  alertMessage = '';
  alertType: 'success' | 'error' = 'success';

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
    this.dataSource.loadTasks();
  }

  ngAfterViewInit() {
    // Configure sorting
    this.dataSource.sort = this.sort;
    
    // Configure pagination
    this.dataSource.paginator = this.paginator;

    // Configure search
    if (this.searchInput) {
      fromEvent(this.searchInput.nativeElement, 'keyup')
        .pipe(
          debounceTime(150),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          const filterValue = this.searchInput.nativeElement.value;
          this.dataSource.filter = filterValue.trim().toLowerCase();
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
        error: (error) => {
          console.error('Error deleting task:', error);
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

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
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