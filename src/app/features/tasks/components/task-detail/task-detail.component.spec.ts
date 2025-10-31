import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { TaskDetailComponent } from './task-detail.component';

describe('TaskDetailComponent', () => {
  let component: TaskDetailComponent;
  let fixture: ComponentFixture<TaskDetailComponent>;

  const mockActivatedRoute = {
    paramMap: of({ get: () => '1' }),
    data: of({ mode: 'view' })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskDetailComponent,
        RouterTestingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatChipsModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load task on init', () => {
    component.ngOnInit();
    expect(component.task).toBeTruthy();
    expect(component.task?.id).toBe(1);
  });

  it('should toggle edit mode', () => {
    component.toggleEditMode();
    expect(component.isEditMode).toBeTrue();
    expect(component.taskForm.value).toBeTruthy();
  });

  it('should cancel edit mode', () => {
    component.isEditMode = true;
    component.cancelEdit();
    expect(component.isEditMode).toBeFalse();
  });

  it('should handle form submission', () => {
    spyOn(console, 'log');
    component.toggleEditMode();
    component.taskForm.patchValue({
      title: 'Updated Task',
      description: 'Updated Description',
      status: 'completed',
      priority: 'high',
      dueDate: new Date()
    });

    component.onSubmit();
    expect(console.log).toHaveBeenCalled();
    expect(component.isEditMode).toBeFalse();
  });
});