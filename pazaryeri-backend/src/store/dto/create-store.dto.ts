import {IsEmail, IsNotEmpty, MinLength, IsIBAN, IsPhoneNumber, IsInt, IsOptional,} from 'class-validator';
export class CreateStoreDto {
    @IsEmail({}, {message:'Geçerli bir email adresi giriniz.'})
    email: string;

    @IsNotEmpty()
    password: string;
    
    @IsNotEmpty()
    name: string;

    @IsEmail({}, {message:'Geçerli bir email adresi giriniz.'})
    ownerEmail: string;

    @IsPhoneNumber('TR', {message:'Geçerli bir telefon numarası giriniz.'})
    ownerPhone: string;

    @IsNotEmpty()
    ownerFirstName: string;

    @IsNotEmpty()
    ownerLastName: string;

    @IsInt()
    companyTypeId: number;

    @IsNotEmpty()
    @MinLength(10, {message:'TCKN veya Vergi Numarası en az 10 karakter olmalıdır.'})
    taxNumber: string;

    @IsOptional()
    companyName: string;

    @IsNotEmpty()
    taxOffice: string;

    @IsIBAN({'message':'Geçerli bir IBAN numarası giriniz.'})
    iban: string;

    @IsNotEmpty()
    address: string;

    @IsPhoneNumber('TR', {message:'Geçerli bir telefon numarası giriniz.'})
    phone: string;
}
