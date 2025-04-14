import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { User, Role } from '@prisma/client';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async createUser(email: string, password: string, role?: Role): Promise<User> {

        return this.prisma.user.create({
            data: {
                email,
                password,
                ...(role && { role }),
            },
        });
    }
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async updateUserRole(id: string, role: Role): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data: { role },
        });
    }
}
