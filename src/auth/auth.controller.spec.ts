import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  me: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a user', async () => {
    const dto = { email: 'test@mail.com', password: 'password123' };
    const mockResponse = { email: dto.email };

    mockAuthService.register.mockResolvedValue(mockResponse);

    const result = await authController.register(dto);
    expect(result).toEqual(mockResponse);
    expect(mockAuthService.register).toHaveBeenCalledWith(dto);
  });

  it('should login a user', async () => {
    const dto = { email: 'test@mail.com', password: 'password123' };
    const mockResponse = { access_token: 'jwt_token' };

    mockAuthService.login.mockResolvedValue(mockResponse);

    const result = await authController.login(dto);
    expect(result).toEqual(mockResponse);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });

  it('should return the currently authenticated user', () => {
    const mockUser = { id: 'uuid-123', email: 'test@mail.com', role: 'USER' };

    const result = authController.getMe(mockUser);
    expect(result).toEqual(mockUser);
  });


});