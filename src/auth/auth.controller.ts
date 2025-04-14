import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { RegisterDto, RegisterSchema } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    register(
        @Body(new ZodValidationPipe(RegisterSchema)) dto: RegisterDto,
    ) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(
        @Body(new ZodValidationPipe(LoginDto)) loginDto: LoginDto,
    ) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@User() user) {
        return user;
    }

}
