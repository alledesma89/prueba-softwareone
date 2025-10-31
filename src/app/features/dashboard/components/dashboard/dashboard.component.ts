import { Component, OnInit, inject, PLATFORM_ID, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { TaskService } from '../../../../core/services/task.service';
import { Task } from '../../../../core/models/task.model';

@Component({

  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  template: `
    <div class="dashboard-container">
      <div class="stats-grid">
        <!-- Summary Cards -->
        <mat-card class="stats-card">
          <mat-card-content>
            <div class="stat-value">{{ totalTasks }}</div>
            <div class="stat-label">Tareas totales</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stats-card">
          <mat-card-content>
            <div class="stat-value accent">{{ tasksInProgress }}</div>
            <div class="stat-label">En progreso</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stats-card">
          <mat-card-content>
            <div class="stat-value success">{{ completedTasks }}</div>
            <div class="stat-label">Completadas</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stats-card">
          <mat-card-content>
            <div class="stat-value warn">{{ overdueTasks }}</div>
            <div class="stat-label">Atrasadas</div>
          </mat-card-content>
        </mat-card>
      </div>

  <!-- Charts Grid -->
  <div class="charts-grid" *ngIf="isBrowser">
        <!-- Task Status Distribution -->
  <mat-card class="chart-card" [class.expanded]="expandedChart === 'status'">
          <mat-card-header>
            <mat-card-title>Distribución por estado</mat-card-title>
            <div class="card-actions">
              <button mat-icon-button aria-label="mostrar/ocultar" (click)="toggleShow('status')">
                <mat-icon>{{ showStatus ? 'visibility' : 'visibility_off' }}</mat-icon>
              </button>
              <button mat-icon-button aria-label="expandir" (click)="toggleExpand('status')">
                <mat-icon>{{ expandedChart === 'status' ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
              </button>
            </div>
          </mat-card-header>
          <mat-card-content *ngIf="showStatus" [class.hidden-content]="!showStatus">
            <canvas baseChart
              [data]="statusChartData"
              [options]="pieChartOptions"
              [type]="'pie'">
            </canvas>
          </mat-card-content>
        </mat-card>

        <!-- Task Priority Distribution -->
  <mat-card class="chart-card" [class.expanded]="expandedChart === 'priority'">
          <mat-card-header>
            <mat-card-title>Tareas por prioridad</mat-card-title>
            <div class="card-actions">
              <button mat-icon-button aria-label="mostrar/ocultar" (click)="toggleShow('priority')">
                <mat-icon>{{ showPriority ? 'visibility' : 'visibility_off' }}</mat-icon>
              </button>
              <button mat-icon-button aria-label="expandir" (click)="toggleExpand('priority')">
                <mat-icon>{{ expandedChart === 'priority' ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
              </button>
            </div>
          </mat-card-header>
          <mat-card-content *ngIf="showPriority">
            <canvas baseChart
              [data]="priorityChartData"
              [options]="barChartOptions"
              [type]="'bar'">
            </canvas>
          </mat-card-content>
        </mat-card>

        <!-- Tasks Trend -->
  <mat-card class="chart-card" [class.expanded]="expandedChart === 'trend'">
          <mat-card-header>
            <mat-card-title>Tendencia de tareas</mat-card-title>
            <div class="card-actions">
              <button mat-icon-button aria-label="mostrar/ocultar" (click)="toggleShow('trend')">
                <mat-icon>{{ showTrend ? 'visibility' : 'visibility_off' }}</mat-icon>
              </button>
              <button mat-icon-button aria-label="expandir" (click)="toggleExpand('trend')">
                <mat-icon>{{ expandedChart === 'trend' ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
              </button>
            </div>
          </mat-card-header>
          <mat-card-content *ngIf="showTrend">
            <canvas baseChart
              [data]="trendChartData"
              [options]="lineChartOptions"
              [type]="'line'">
            </canvas>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 2rem;
    }

    .stats-card {
      text-align: center;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 8px;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 500;
      color: var(--mat-sys-color-primary);
    }

    .stat-value.accent {
      color: var(--mat-sys-color-tertiary);
    }

    .stat-value.success {
      color: #4caf50;
    }

    .stat-value.warn {
      color: var(--mat-sys-color-error);
    }

    .stat-label {
      font-size: 1rem;
      color: var(--mat-sys-color-on-surface-variant);
      margin-top: 8px;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      padding: 1rem;
    }

    @media (max-width: 960px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }

    .chart-card {
      width: 100%;
      min-height: 400px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-radius: 12px;
      overflow: hidden;
    }

    /* When a chart is expanded, make it span the full width and be taller */
    .chart-card.expanded {
      grid-column: 1 / -1;
      min-height: 620px;
    }

    .card-actions {
      margin-left: auto;
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .chart-card mat-card-header {
      padding: 16px;
      background: rgba(0,0,0,0.02);
    }

    .chart-card mat-card-content {
      padding: 24px;
      height: calc(100% - 64px);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    canvas {
      width: 100% !important;
      max-width: 500px;
      margin: 0 auto;
    }

    /* When expanded make canvas full width */
    .chart-card.expanded canvas {
      max-width: none !important;
      width: 100% !important;
      height: 100% !important;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private taskService = inject(TaskService);

  // UI state for charts
  public expandedChart: string | null = null;
  public showStatus = true;
  public showPriority = true;
  public showTrend = true;

  constructor() {
    // Registrar componentes de Chart.js
    Chart.register(...registerables);
    afterNextRender(() => {
      // Esto se ejecutará solo en el navegador después de que el componente se haya renderizado
    });
  }

  public isBrowser = false;

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
  // Cargar tareas y calcular métricas
  this.loadMetrics();
  }  // Estadísticas resumen
  public totalTasks = 0;
  public tasksInProgress = 0;
  public completedTasks = 0;
  public overdueTasks = 0;

  // Configuración de gráficos
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5
        }
      }
    }
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false
    },
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { display: true, grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: { color: 'rgba(0,0,0,0.05)' }
      }
    },
    elements: {
      line: { tension: 0.3, borderWidth: 2 },
      point: { radius: 4, hoverRadius: 6 }
    }
  };

  // Datos iniciales de los gráficos (vacíos)
  public statusChartData: ChartData<'pie'> = {
    labels: ['Pendientes', 'En progreso', 'Completadas'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#ff9800', '#2196f3', '#4caf50'] }]
  };

  public priorityChartData: ChartData<'bar'> = {
    labels: ['Alta', 'Media', 'Baja'],
    datasets: [{ data: [0, 0, 0], backgroundColor: ['#f44336', '#ff9800', '#4caf50'], label: 'Tareas por prioridad' }]
  };

  public trendChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Tareas completadas', borderColor: '#4caf50', backgroundColor: 'rgba(76,175,80,0.12)', fill: 'origin' },
      { data: [], label: 'En progreso', borderColor: '#2196f3', backgroundColor: 'rgba(33,150,243,0.12)', fill: 'origin' }
    ]
  };

  private loadMetrics(): void {
    // Cargar un número razonable de tareas (json-server soporta _limit)
    this.taskService.getTasks({ _limit: 200 }).subscribe({
      next: ({ tasks }) => {
        this.totalTasks = tasks.length;
        this.tasksInProgress = tasks.filter(t => t.status === 'in-progress').length;
        this.completedTasks = tasks.filter(t => t.status === 'completed').length;
        this.overdueTasks = tasks.filter(t => t.status === 'overdue').length;

        // Status chart
        const pending = tasks.filter(t => t.status === 'pending').length;
        const inProgress = this.tasksInProgress;
        const completed = this.completedTasks;
        this.statusChartData = {
          labels: ['Pendientes', 'En progreso', 'Completadas'],
          datasets: [{ data: [pending, inProgress, completed], backgroundColor: ['#ff9800', '#2196f3', '#4caf50'] }]
        };

        // Gráfico de prioridad
        const high = tasks.filter(t => t.priority === 'high').length;
        const medium = tasks.filter(t => t.priority === 'medium').length;
        const low = tasks.filter(t => t.priority === 'low').length;
        this.priorityChartData = {
          labels: ['Alta', 'Media', 'Baja'],
          datasets: [{ data: [high, medium, low], backgroundColor: ['#f44336', '#ff9800', '#4caf50'], label: 'Tareas por prioridad' }]
        };

        // Nueva tendencia: mostrar últimos 7 días con área (completadas vs en progreso) usando dueDate
        const now = new Date();
        const last7: string[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(now.getDate() - i);
          last7.push(d.toISOString().split('T')[0]);
        }

        const completedByDay = last7.map(date =>
          tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === date && t.status === 'completed').length
        );

        const inProgressByDay = last7.map(date =>
          tasks.filter(t => t.dueDate && t.dueDate.split('T')[0] === date && t.status === 'in-progress').length
        );

        this.trendChartData = {
          labels: last7.map(d => {
            // friendly label like '30 Oct'
            const dd = new Date(d + 'T00:00:00');
            return `${dd.getDate()} ${dd.toLocaleString(undefined, { month: 'short' })}`;
          }),
          datasets: [
            { data: completedByDay, label: 'Tareas completadas', borderColor: '#4caf50', backgroundColor: 'rgba(76,175,80,0.12)', fill: 'origin' },
            { data: inProgressByDay, label: 'En progreso', borderColor: '#2196f3', backgroundColor: 'rgba(33,150,243,0.12)', fill: 'origin' }
          ]
        };
      },
      error: () => {
        // mantener valores por defecto
      }
    });
  }

  /** Toggle expand/restore for a chart */
  public toggleExpand(name: string): void {
    this.expandedChart = this.expandedChart === name ? null : name;
  }

  /** Toggle visibility for a chart */
  public toggleShow(name: string): void {
    switch (name) {
      case 'status': this.showStatus = !this.showStatus; break;
      case 'priority': this.showPriority = !this.showPriority; break;
      case 'trend': this.showTrend = !this.showTrend; break;
    }
  }

  // Nota: ngOnInit se usa arriba para establecer isBrowser y ejecutar inicialización solo en cliente
}