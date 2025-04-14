import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUserService = {
  createUser: jest.fn(),
  findByEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if email already exists', async () => {
    const dto = { email: 'test@mail.com', password: 'password123' };
    mockUserService.findByEmail.mockResolvedValue({ email: dto.email });

    await expect(authService.register(dto)).rejects.toThrow(ConflictException);
  });

  it('should register a user successfully with valid email and password', async () => {
    const dto = { email: 'test@mail.com', password: 'password123' };
    mockUserService.findByEmail.mockResolvedValue(null);
    mockUserService.createUser.mockResolvedValue({
      email: dto.email,
      password: 'hashedPassword',
    });

    const result = await authService.register(dto);
    expect(result).toHaveProperty('email', dto.email);
  });

  it('should throw an error if the email is not found during login', async () => {
    const dto = { email: 'notfound@mail.com', password: 'password123' };
    mockUserService.findByEmail.mockResolvedValue(null);

    await expect(authService.login(dto)).rejects.toThrow(ConflictException);
  });

  it('should throw an error if the password is incorrect', async () => {
    const dto = { email: 'test@mail.com', password: 'wrongPassword' };
    const mockUser = { email: dto.email, password: 'hashedPassword' };

    mockUserService.findByEmail.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

    await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should return a JWT token when login is successful', async () => {
    const dto = { email: 'test@mail.com', password: 'password123' };
    const mockUser = { email: dto.email, password: 'hashedPassword' };

    mockUserService.findByEmail.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
    mockJwtService.sign.mockReturnValue('jwt_token');

    const result = await authService.login(dto);
    expect(result).toHaveProperty('access_token', 'jwt_token');
  });
});
