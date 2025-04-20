import {IsNotEmpty} from 'class-validator';
export class CreateCardDto {
    @IsNotEmpty({message:'Kart Sahibi boş olamaz.'})
    cardHolderName: string;

    @IsNotEmpty({message:'Kart Numarası boş olamaz.'})
    cardNumber: string;

    @IsNotEmpty({message:'Ay boş olamaz.'})
    expiryMonth: number;

    @IsNotEmpty({message:'Yıl boş olamaz.'})
    expiryYear: number;

    @IsNotEmpty({message:'CVV boş olamaz.'})
    cvv: string;

    @IsNotEmpty({message:'Kart tipi boş olamaz.'})
    cardType: string;

    @IsNotEmpty({message: 'Varsayılan kart boş olamaz.'})
    isDefault: boolean;
}