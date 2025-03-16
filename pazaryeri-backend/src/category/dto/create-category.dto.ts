import {IsEmpty,} from 'class-validator';
export class CreateCategoryDto {
    @IsEmpty()
    name:string;

    @IsEmpty()
    description:string;
    
    level:number = 0;
}
