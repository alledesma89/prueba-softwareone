import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { DashboardComponent } from '../dashboard/components/dashboard/dashboard.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, RouterLink, DashboardComponent],
  template: `
    <div class="home-container" style="display:flex;flex-direction:column;gap:16px;">
      <div style="display:flex;gap:12px;align-items:center;">
        <mat-card style="flex:1;">
          <mat-card-title>Bienvenido</mat-card-title>
          <mat-card-content>
            <p>Panel principal con métricas de tareas y accesos rápidos.</p>
            <div style="display:flex;gap:8px;margin-top:8px;">
              <a mat-flat-button color="primary" routerLink="/tasks">Ver Tareas</a>
              <a mat-flat-button color="accent" routerLink="/tasks/new">Crear Tarea</a>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <app-dashboard></app-dashboard>
    </div>
  `
})
export class HomeComponent {}
