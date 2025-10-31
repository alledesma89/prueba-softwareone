
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable, Subject, merge } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';

export class TaskListDataSource implements DataSource<Task> {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private destroy$ = new Subject<void>();

  public loading$ = this.loadingSubject.asObservable();
  public totalTasks = 0;

  private _paginator!: MatPaginator;
  private _sort!: MatSort;
  private _filter = '';

  constructor(private taskService: TaskService) {}

  set paginator(paginator: MatPaginator) {
    this._paginator = paginator;
  }

  get paginator(): MatPaginator {
    return this._paginator;
  }

  set sort(sort: MatSort) {
    this._sort = sort;
  }

  get sort(): MatSort {
    return this._sort;
  }



  connect(): Observable<Task[]> {
    const dataMutations: Observable<any>[] = [];
    if (this.paginator && this.paginator.page) {
      dataMutations.push(this.paginator.page);
    }
    if (this.sort && this.sort.sortChange) {
      dataMutations.push(this.sort.sortChange);
    }

    if (dataMutations.length > 0) {
      merge(...dataMutations)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => this.loadTasks(this._filter));
    } else {
      // No paginator/sort available (e.g. during server prerender) — load once with defaults
      this.loadTasks(this._filter);
    }

    return this.tasksSubject.asObservable();
  }

  disconnect(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.tasksSubject.complete();
    this.loadingSubject.complete();
  }

  loadTasks(filter: string = this._filter, status: string = '', priority: string = '', dueDate: string | null = null): void {
    this.loadingSubject.next(true);

    const pageIndex = this._paginator?.pageIndex ?? 0;
    const pageSize = this._paginator?.pageSize ?? 10;
    const sortActive = this._sort?.active;
    const sortDirection = this._sort?.direction;

    const filters: any = {
      _page: pageIndex + 1,
      _limit: pageSize,
      _sort: sortActive as keyof Task,
      _order: sortDirection || undefined,
      q: filter,
    };

    if (status) {
      filters.status = status;
    }
    if (priority) {
      filters.priority = priority;
    }
    if (dueDate) {
      filters.dueDate_like = dueDate.split('T')[0]; // Assuming date format for filtering
    }

    this.taskService
      .getTasks(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ tasks, totalCount }) => {
          this.tasksSubject.next(tasks);
          this.totalTasks = totalCount;
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        },
      });
  }
}
