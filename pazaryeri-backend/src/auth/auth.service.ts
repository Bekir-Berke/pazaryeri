import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { StoreService } from 'src/store/store.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { StoreLoginDto } from './dto/store-login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService:JwtService, private storeService:StoreService, private redisService:RedisService) {}
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
            const access_token = this.jwtService.sign({...payload, type: 'access'}, { expiresIn: '1d' })
            const refresh_token = this.jwtService.sign({...payload, type: 'refresh'}, { expiresIn: '30d' })
            await this.redisService.set(`refresh_token_${user.id}`, refresh_token, 60 * 60 * 24 * 30).then(() => {
                console.log('Redis\'e refresh token kaydedildi');
            })
            return {
                access_token,
                refresh_token
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
    async refresh(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, { ignoreExpiration: true });
            if (payload.type !== 'refresh') {
                throw new UnauthorizedException('Geçersiz token');
            }
            const user = await this.usersService.findOne(payload.sub);
            if (!user) {
                throw new NotFoundException('Kullanıcı bulunamadı');
            }
            const redisToken = await this.redisService.get(`refresh_token_${user.id}`);
            if (refreshToken !== redisToken) {
                throw new UnauthorizedException('Geçersiz token');
            }
            const access_token = this.jwtService.sign({...payload, type: 'access'}, { expiresIn: '1d' });
            return {
                access_token
            };
        } catch (error) {
            throw new BadRequestException('Bir hata oluştu');
        }
    }

    async storeLogin(storeLoginDto:StoreLoginDto){
        try {
            const store = await this.storeService.findOneByEmail(storeLoginDto.email);
            if(!store){
                throw new NotFoundException('Mağaza bulunamadı');
            }
            const isMatch = bcrypt.compareSync(storeLoginDto.password, store.password);
            if(!isMatch){
                throw new UnauthorizedException('Kullanıcı adı veya şifre hatalı');
            }
            const payload = {sub: store.id, role: 'store'};
            return {
                access_token: this.jwtService.sign({...payload, type: 'access'}, {
                    expiresIn: '1d'
                }),
                refresh_token: this.jwtService.sign({...payload, type: 'refresh'}, {
                    expiresIn: '30d'
                })
            };
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException('Bir hata oluştu');
        }
    }
}
