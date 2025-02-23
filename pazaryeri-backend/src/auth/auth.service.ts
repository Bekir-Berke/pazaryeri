import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService:JwtService) {}
    async login(loginDto: LoginDto) {
        try {
            const user = await this.usersService.findOneByEmail(loginDto.email);

            if (!user) {
                throw new NotFoundException('Kullanıcı bulunamadı');
            }
            const isMatch = bcrypt.compareSync(loginDto.passwordHash, user.passwordHash);
            if(!isMatch) {
                throw new UnauthorizedException('Kullanıcı adı veya şifre hatalı');
            }
            const payload = {sub: user.id, role: user.role};
            return {
                access_token: this.jwtService.sign({...payload, type: 'access'}, { expiresIn: '1d' }),
                refresh_token: this.jwtService.sign({...payload, type: 'refresh'}, { expiresIn: '30d' }),
            };

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException('Bir hata oluştu');
        }
    }
    async register(registerDto: RegisterDto) {
        try {
            const salt = bcrypt.genSaltSync(10);
            registerDto.passwordHash = bcrypt.hashSync(registerDto.passwordHash, salt);
            const user = await this.usersService.create(registerDto);
            return user;
        } catch (error) {
            throw new BadRequestException('Bir hata oluştu');
        }
    }
}
