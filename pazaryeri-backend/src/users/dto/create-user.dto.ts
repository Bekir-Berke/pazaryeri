import {IsEmail, IsNotEmpty, MinLength} from 'class-validator';
export class CreateUserDto {
    @IsNotEmpty()
    firstName: string;

    @IsNotEmpty()
    lastName: string;

    @IsEmail({}, {message:'Geçerli bir email adresi giriniz.'})
    email: string;

    @MinLength(6, {message:'Şifre en az 6 karakter olmalıdır.'})
    passwordHash: string;
}
