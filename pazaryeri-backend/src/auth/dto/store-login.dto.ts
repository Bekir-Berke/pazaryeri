import { IsNotEmpty, IsEmail } from "class-validator";

export class StoreLoginDto {
    @IsEmail()
    email: string;
    
    @IsNotEmpty()
    password: string;
}   