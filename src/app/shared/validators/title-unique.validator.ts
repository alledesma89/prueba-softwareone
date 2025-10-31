import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { TaskService } from '../../core/services/task.service';

export function titleUniqueValidator(taskService: TaskService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = (control.value || '').toString().trim();
    if (!value || value.length < 3) {
      return of(null);
    }

    return timer(300).pipe(
      switchMap(() => taskService.getTasks({ title_like: value })),
      map(({ tasks }) => {
        const exists = Array.isArray(tasks) && tasks.some(t => t.title?.toLowerCase() === value.toLowerCase());
        return exists ? { titleTaken: true } : null;
      }),
      catchError(() => of(null))
    );
  };
}
