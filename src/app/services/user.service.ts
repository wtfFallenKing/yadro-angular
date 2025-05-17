import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://jsonplaceholder.typicode.com/users';

  constructor(private http: HttpClient, private message: NzMessageService) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Произошла неизвестная ошибка!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Ошибка: ${error.error.message}`;
    } else {
      errorMessage = `Код ошибки: ${error.status}\nСообщение: ${error.message}`;
    }
    this.message.error(errorMessage);
    console.error(error);
    return throwError(() => new Error(errorMessage));
  }

  getUsers(): Observable<User[]> {
    return this.http
      .get<User[]>(this.apiUrl)
      .pipe(catchError(this.handleError.bind(this)));
  }

  getUser(id: number): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError.bind(this)));
  }

  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(() => this.message.success('Пользователь успешно создан!')),
      catchError(this.handleError.bind(this))
    );
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user).pipe(
      tap(() => this.message.success(`Пользователь ${id} успешно обновлен!`)),
      catchError(this.handleError.bind(this))
    );
  }

  deleteUser(id: number): Observable<object> {
    return this.http.delete<object>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.message.success(`Пользователь ${id} успешно удален!`)),
      catchError(this.handleError.bind(this))
    );
  }
}
