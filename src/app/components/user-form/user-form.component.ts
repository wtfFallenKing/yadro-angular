import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-form',
  standalone: false,
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  isLoading = false;
  pageTitle = 'Создать пользователя';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private message: NzMessageService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.userId = +id;
        this.pageTitle = 'Редактировать пользователя';
        this.loadUserData(this.userId);
      } else {
        this.isEditMode = false;
        this.pageTitle = 'Создать пользователя';
      }
    });
  }

  initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      website: [
        '',
        [
          Validators.pattern(
            /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/
          ),
        ],
      ],
      address: this.fb.group({
        street: ['', [Validators.required]],
        suite: [''],
        city: ['', [Validators.required]],
        zipcode: [
          '',
          [Validators.required, Validators.pattern(/^\d{5}(?:[-\s]\d{4})?$/)],
        ],
        geo: this.fb.group({
          lat: [
            '',
            [
              Validators.required,
              Validators.pattern(/^-?([1-8]?[0-9]|[1-9]0)\.{1}\d{1,6}/),
            ],
          ],
          lng: [
            '',
            [
              Validators.required,
              Validators.pattern(
                /^-?((([1-9]?[0-9])|([1][0-7][0-9]))\.{1}\d{1,6}|180\.{1}0{1,6})$/
              ),
            ],
          ],
        }),
      }),
      company: this.fb.group({
        name: ['', [Validators.required]],
        catchPhrase: [''],
        bs: [''],
      }),
    });
  }

  loadUserData(id: number): void {
    this.isLoading = true;
    this.userService
      .getUser(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (user) => {
          this.userForm.patchValue(user);
        },
        error: (err) => {
          console.error(
            `Ошибка загрузки пользователя ${id} для редактирования:`,
            err
          );
          this.router.navigate(['/users']);
        },
      });
  }

  fc(controlName: string, groupName?: string): AbstractControl | null {
    if (groupName) {
      const group = this.userForm.get(groupName) as FormGroup;
      return group ? group.get(controlName) : null;
    }
    return this.userForm.get(controlName);
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.message.error('Пожалуйста, исправьте ошибки в форме.');
      Object.values(this.userForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach((nestedControl) => {
            if (nestedControl.invalid) {
              nestedControl.markAsDirty();
              nestedControl.updateValueAndValidity({ onlySelf: true });
            }
            if (nestedControl instanceof FormGroup) {
              Object.values(nestedControl.controls).forEach(
                (deepNestedControl) => {
                  if (deepNestedControl.invalid) {
                    deepNestedControl.markAsDirty();
                    deepNestedControl.updateValueAndValidity({
                      onlySelf: true,
                    });
                  }
                }
              );
            }
          });
        }
      });
      return;
    }

    this.isLoading = true;
    const userData = this.userForm.value as User;

    if (this.isEditMode && this.userId) {
      this.userService
        .updateUser(this.userId, { ...userData, id: this.userId })
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.isLoading = false))
        )
        .subscribe({
          next: (updatedUser) => {
            this.router.navigate(['/users', updatedUser.id]);
          },
          error: (err) => console.error('Ошибка обновления пользователя:', err),
        });
    } else {
      const { id, ...newUserPayload } = userData;
      this.userService
        .createUser(newUserPayload as Omit<User, 'id'>)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.isLoading = false))
        )
        .subscribe({
          next: (createdUser) => {
            this.router.navigate(['/users', createdUser.id]);
          },
          error: (err) => console.error('Ошибка создания пользователя:', err),
        });
    }
  }

  cancel(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
