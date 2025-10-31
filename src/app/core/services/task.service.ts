import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskFilters } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // By default the app uses JSONPlaceholder (public test API).
  // For local development with persistence, run json-server and set
  // the API_URL to http://localhost:3000/posts. json-server will
  // persist changes to db.json.
  private readonly API_URL = ((): string => {
    // Use local json-server when available during development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      return 'http://localhost:3000/posts';
    }
    return 'https://jsonplaceholder.typicode.com/posts';
  })();

  constructor(private http: HttpClient) {}

  /**
   * Get all tasks with optional filters
   * @param filters Optional query parameters for filtering tasks
   */
  public getTasks(filters?: TaskFilters): Observable<{ tasks: Task[]; totalCount: number; }> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<Task[]>(this.API_URL, { params, observe: 'response' })
      .pipe(
        map(response => {
          const totalCount = Number(response.headers.get('X-Total-Count'));
          const tasks = response.body || [];
          return { tasks, totalCount };
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get a single task by ID
   * @param id Task ID
   */
  public getTaskById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Create a new task
   * @param task Task data without ID
   */
  public createTask(task: CreateTaskDTO): Observable<Task> {
    return this.http.post<Task>(this.API_URL, task)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing task
   * @param task Task data with ID and fields to update
   */
  public updateTask(task: UpdateTaskDTO): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/${task.id}`, task)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Partially update a task
   * @param taskId Task ID
   * @param changes Partial task data to update
   */
  public patchTask(taskId: number, changes: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.API_URL}/${taskId}`, changes)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Delete a task
   * @param id Task ID
   */
  public deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get tasks by user ID
   * @param userId User ID
   */
  public getTasksByUser(userId: number): Observable<Task[]> {
    return this.getTasks({ userId }).pipe(
      map(response => response.tasks)
    );
  }

  /**
   * Handle HTTP errors
   * @param error HTTP error response
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}