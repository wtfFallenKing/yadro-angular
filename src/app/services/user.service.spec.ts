import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { NzMessageService } from 'ng-zorro-antd/message';

class MockNzMessageService {
  success = jasmine.createSpy('success');
  error = jasmine.createSpy('error');
  warning = jasmine.createSpy('warning');
  info = jasmine.createSpy('info');
}

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let mockMessageService: MockNzMessageService;
  const apiUrl = 'https://jsonplaceholder.typicode.com/users';

  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Leanne Graham',
      username: 'Bret',
      email: 'Sincere@april.biz',
      address: {} as any,
      phone: '123',
      website: 'hildegard.org',
      company: {} as any,
    },
    {
      id: 2,
      name: 'Ervin Howell',
      username: 'Antonette',
      email: 'Shanna@melissa.tv',
      address: {} as any,
      phone: '456',
      website: 'anastasia.net',
      company: {} as any,
    },
  ];
  const mockUser: User = mockUsers[0];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: NzMessageService, useClass: MockNzMessageService },
      ],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
    mockMessageService = TestBed.inject(
      NzMessageService
    ) as unknown as MockNzMessageService;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve users from the API via GET', () => {
    service.getUsers().subscribe((users) => {
      expect(users.length).toBe(2);
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should retrieve a single user by ID via GET', () => {
    const userId = 1;
    service.getUser(userId).subscribe((user) => {
      expect(user).toEqual(mockUser);
      expect(user.id).toBe(userId);
    });

    const req = httpMock.expectOne(`${apiUrl}/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should create a user via POST', () => {
    const newUser: Omit<User, 'id'> = {
      name: 'New User',
      username: 'newbie',
      email: 'new@user.com',
      address: {} as any,
      phone: '789',
      website: 'new.com',
      company: {} as any,
    };
    const createdUser: User = { ...newUser, id: 3 };

    service.createUser(newUser).subscribe((user) => {
      expect(user).toEqual(createdUser);
      expect(user.id).toBeDefined();
      expect(mockMessageService.success).toHaveBeenCalledWith(
        'User created successfully!'
      );
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(createdUser);
  });

  it('should update a user via PUT', () => {
    const userId = 1;
    const updatedUserData: User = { ...mockUser, name: 'Updated Name' };

    service.updateUser(userId, updatedUserData).subscribe((user) => {
      expect(user.name).toBe('Updated Name');
      expect(mockMessageService.success).toHaveBeenCalledWith(
        `User ${userId} updated successfully!`
      );
    });

    const req = httpMock.expectOne(`${apiUrl}/${userId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedUserData);
    req.flush(updatedUserData);
  });

  it('should delete a user via DELETE', () => {
    const userId = 1;
    service.deleteUser(userId).subscribe((response) => {
      expect(response).toEqual({});
      expect(mockMessageService.success).toHaveBeenCalledWith(
        `User ${userId} deleted successfully!`
      );
    });

    const req = httpMock.expectOne(`${apiUrl}/${userId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should handle HTTP errors for getUsers', () => {
    const errorMessage =
      'Http failure response for https://jsonplaceholder.typicode.com/users: 500 Internal Server Error';
    service.getUsers().subscribe({
      next: () => fail('should have failed with 500 error'),
      error: (error: Error) => {
        expect(error.message).toContain('Error Code: 500');
        expect(mockMessageService.error).toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne(apiUrl);
    req.flush('Something went wrong', {
      status: 500,
      statusText: 'Internal Server Error',
    });
  });
});
