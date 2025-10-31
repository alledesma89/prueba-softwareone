import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material modules used by the template
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, of, timer, Subject } from 'rxjs';
import { switchMap, map, catchError, takeUntil } from 'rxjs/operators';
import { TaskService } from '../../../../core/services/task.service';
import { titleUniqueValidator } from '../../../../shared/validators/title-unique.validator';
import { CreateTaskDTO } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>{{ taskForm.get('id')?.value ? 'Editar Tarea' : 'Nueva Tarea' }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Título</mat-label>
            <input matInput formControlName="title" placeholder="Introduce el título de la tarea">
            <mat-error *ngIf="taskForm.get('title')?.errors?.['required']">
              El título es obligatorio
            </mat-error>
            <mat-error *ngIf="taskForm.get('title')?.errors?.['minlength']">
              El título debe tener al menos 3 caracteres
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Descripción</mat-label>
            <textarea matInput formControlName="description" rows="4" 
                      placeholder="Describe la tarea"></textarea>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Estado</mat-label>
            <mat-select formControlName="status">
              <mat-option value="pending">Pendiente</mat-option>
              <mat-option value="in-progress">En Progreso</mat-option>
              <mat-option value="completed">Completada</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Prioridad</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="low">Baja</mat-option>
              <mat-option value="medium">Media</mat-option>
              <mat-option value="high">Alta</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Fecha límite</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="dueDate">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <div class="form-actions">
            <button mat-button type="button" (click)="goBack()">Cancelar</button>
            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="taskForm.invalid || submitting">
              {{ submitting ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
      max-width: 100%;
    }

    @media (max-width: 600px) {
      :host {
        padding: 8px;
      }
    }

    .task-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      max-width: 600px;
      margin: 0 auto;
    }

    @media (max-width: 600px) {
      .task-form {
        padding: 8px;
      }
    }

    .full-width {
      width: 100%;
    }

    .form-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-top: 16px;
    }

    @media (max-width: 400px) {
      .form-actions {
        flex-direction: column;
        gap: 8px;
      }
      
      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class TaskFormComponent implements OnInit, OnDestroy {
  public taskForm: FormGroup;
  public submitting = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService
  ) {
    this.taskForm = this.fb.group({
      id: [null],
      title: ['', {
        validators: [Validators.required, Validators.minLength(3)],
        asyncValidators: [titleUniqueValidator(this.taskService)],
        updateOn: 'blur'
      }],
      description: [''],
      status: ['pending', Validators.required],
      priority: ['medium', Validators.required],
      dueDate: [new Date(), Validators.required]
    });
  }

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskService.getTaskById(+id).subscribe(task => {
        if (task) {
          this.taskForm.patchValue(task);
        }
      });
    }
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public onSubmit(): void {
    if (this.taskForm.valid) {
      this.submitting = true;
      const taskData = this.taskForm.value;
      const payload: CreateTaskDTO = {
        title: taskData.title,
        body: taskData.description || '',
        userId: 1,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: new Date(taskData.dueDate).toISOString().split('T')[0]
      };

      let save$: any;
      if (taskData.id) {
        save$ = this.taskService.updateTask({ id: taskData.id, ...payload });
      } else {
        save$ = this.taskService.createTask(payload);
      }

      save$.pipe(
        takeUntil(this.destroy$),
        catchError(err => {
          console.error('Failed to save task', err);
          return of(null);
        })
      ).subscribe((result: any) => {
        this.submitting = false;
        if (result) {
          this.router.navigate(['/tasks']);
        }
      });
    } else {
      this.taskForm.markAllAsTouched();
    }
  }



  public goBack(): void {
    this.router.navigate(['/tasks']);
  }
}