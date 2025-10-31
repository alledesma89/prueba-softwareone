
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable, Subject, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';

export class TaskListDataSource extends DataSource<Task> {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private destroy$ = new Subject<void>();

  public loading$ = this.loadingSubject.asObservable();
  public totalTasks = 0;

  private _paginator!: MatPaginator;
  private _sort!: MatSort;
  private _filter = '';

  constructor(private taskService: TaskService) {
    super();
  }

  set paginator(paginator: MatPaginator) {
    this._paginator = paginator;
    this.loadTasks();
  }

  get paginator(): MatPaginator {
    return this._paginator;
  }

  set sort(sort: MatSort) {
    this._sort = sort;
    this.loadTasks();
  }

  get sort(): MatSort {
    return this._sort;
  }

  set filter(filter: string) {
    this._filter = filter;
    this.loadTasks();
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
        .subscribe(() => this.loadTasks());
    } else {
      // No paginator/sort available (e.g. during server prerender) — load once with defaults
      this.loadTasks();
    }

    return this.tasksSubject.asObservable();
  }

  disconnect(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.tasksSubject.complete();
    this.loadingSubject.complete();
  }

  loadTasks(): void {
    this.loadingSubject.next(true);

    const pageIndex = this._paginator?.pageIndex ?? 0;
    const pageSize = this._paginator?.pageSize ?? 10;
    const sortActive = this._sort?.active;
    const sortDirection = this._sort?.direction;

    const filters = {
      _page: pageIndex + 1,
      _limit: pageSize,
      _sort: sortActive as keyof Task,
      _order: sortDirection || undefined,
      q: this._filter,
    };

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
