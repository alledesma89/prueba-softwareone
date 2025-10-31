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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

import { TaskFormComponent } from './task-form.component';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskFormComponent,
        RouterTestingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatButtonModule,
        MatIconModule
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.taskForm.get('status')?.value).toBe('pending');
    expect(component.taskForm.get('priority')?.value).toBe('medium');
    expect(component.taskForm.get('dueDate')?.value).toBeTruthy();
  });

  it('should mark form as invalid when required fields are empty', () => {
    component.taskForm.patchValue({
      title: '',
      status: '',
      priority: '',
      dueDate: null
    });

    expect(component.taskForm.valid).toBeFalse();
  });

  it('should mark form as valid when all required fields are filled', () => {
    component.taskForm.patchValue({
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date()
    });

    expect(component.taskForm.valid).toBeTrue();
  });

  it('should handle form submission', () => {
    spyOn(console, 'log');
    spyOn(router, 'navigate');

    component.taskForm.patchValue({
      title: 'Test Task',
      description: 'Test Description',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date()
    });

    component.onSubmit();

    expect(console.log).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('should navigate back when cancel is clicked', () => {
    spyOn(router, 'navigate');
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });
});