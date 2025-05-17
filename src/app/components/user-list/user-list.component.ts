import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  isLoading = false;
  searchTextName: string = '';
  searchTextEmail: string = '';

  currentPage = 1;
  pageSize = 5;
  totalUsers = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService
      .getUsers()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (data) => {
          this.users = data;
          this.totalUsers = this.users.length;
          this.applyFiltersAndPagination();
        },
        error: (err) => {
          console.error('Ошибка загрузки пользователей в компоненте:', err);
        },
      });
  }

  applyFiltersAndPagination(): void {
    let tempUsers = [...this.users];

    if (this.searchTextName.trim() !== '') {
      tempUsers = tempUsers.filter((user) =>
        user.name.toLowerCase().includes(this.searchTextName.toLowerCase())
      );
    }

    if (this.searchTextEmail.trim() !== '') {
      tempUsers = tempUsers.filter((user) =>
        user.email.toLowerCase().includes(this.searchTextEmail.toLowerCase())
      );
    }

    this.totalUsers = tempUsers.length;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredUsers = tempUsers.slice(startIndex, endIndex);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  clearFilters(): void {
    this.searchTextName = '';
    this.searchTextEmail = '';
    this.onSearch();
  }

  onPageIndexChange(pageIndex: number): void {
    this.currentPage = pageIndex;
    this.applyFiltersAndPagination();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  viewDetails(id?: number): void {
    if (id) {
      this.router.navigate(['/users', id]);
    }
  }

  editUser(id?: number): void {
    if (id) {
      this.router.navigate(['/users', id, 'edit']);
    }
  }

  deleteUser(id?: number): void {
    if (!id) return;

    this.modal.confirm({
      nzTitle: 'Вы уверены, что хотите удалить этого пользователя?',
      nzContent: '<b style="color: red;">Это действие необратимо.</b>',
      nzOkText: 'Да, удалить',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isLoading = true;
        this.userService
          .deleteUser(id)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => (this.isLoading = false))
          )
          .subscribe({
            next: () => {
              this.users = this.users.filter((u) => u.id !== id);
              this.applyFiltersAndPagination();
            },
            error: (err) => {
              console.error('Ошибка удаления пользователя в компоненте:', err);
            },
          });
      },
      nzCancelText: 'Отмена',
      nzOnCancel: () => console.log('Удаление отменено'),
    });
  }

  addNewUser(): void {
    this.router.navigate(['/users/new']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
