import { Routes } from '@angular/router';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskDetailComponent } from './components/task-detail/task-detail.component';
import { TaskFormComponent } from './components/task-form/task-form.component';

export const tasksRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: TaskListComponent },
      { path: 'new', component: TaskFormComponent },
      { path: ':id', component: TaskDetailComponent },
      { path: ':id/edit', component: TaskFormComponent, data: { mode: 'edit' } }
    ]
  }
];