import {IsNotEmpty, IsPhoneNumber} from 'class-validator';
export class CreateAddressDto {
    @IsNotEmpty({message:'Adres başlığı boş olamaz.'})
    addressTitle: string;

    @IsNotEmpty({message:'Full ad boş olamaz.'})
    fullName: string;

    @IsPhoneNumber('TR', {message:'Geçerli bir telefon numarası giriniz.'})
    phone: string;

    @IsNotEmpty({message:'Şehir boş olamaz.'})
    city: string;

    @IsNotEmpty({message:'İlçe boş olamaz.'})
    district: string;

    @IsNotEmpty({message:'Mahalle boş olamaz.'})
    neighborhood: string;

    @IsNotEmpty({message:'Tam Adres boş olamaz.'})
    fullAddress: string;
}
