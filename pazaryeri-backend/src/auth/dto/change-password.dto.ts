import {MinLength} from 'class-validator';
export class ChangePasswordDto {
    @MinLength(6, {message:'Şifre en az 6 karakter olmalıdır.'})
    oldPasswordHash: string;
    @MinLength(6, {message:'Şifre en az 6 karakter olmalıdır.'})
    newPasswordHash: string;
}        