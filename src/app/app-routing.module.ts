import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserDetailComponent } from './components/user-detail/user-detail.component';
import { UserFormComponent } from './components/user-form/user-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/users', pathMatch: 'full' },
  { path: 'users', component: UserListComponent, title: 'Список пользователей' },
  { path: 'users/new', component: UserFormComponent, title: 'Создать пользователя' },
  { path: 'users/:id', component: UserDetailComponent, title: 'Детали пользователя' },
  { path: 'users/:id/edit', component: UserFormComponent, title: 'Редактировать пользователя' },
  { path: '**', redirectTo: '/users' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
