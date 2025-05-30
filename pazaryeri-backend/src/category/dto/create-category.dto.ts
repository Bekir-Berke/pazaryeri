import {IsNotEmpty,} from 'class-validator';
export class CreateCategoryDto {
    @IsNotEmpty()
    name:string;

    @IsNotEmpty()
    description:string;
    
    level:number = 0;
}
