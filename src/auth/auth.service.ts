import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService) { }
    async register(dto: RegisterDto) {
        const existing = await this.userService.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Email already in use');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.userService.createUser(dto.email, hashedPassword);

        return user;
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new ConflictException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);

        return {
            access_token: accessToken,
        };

    }
}
