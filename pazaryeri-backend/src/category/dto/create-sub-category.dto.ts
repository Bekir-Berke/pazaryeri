import { IsEmpty } from "class-validator";
export class CreateSubCategoryDto{
    @IsEmpty()
    name:string;

    @IsEmpty()
    description:string;
    
    @IsEmpty()
    level:number;

    @IsEmpty()
    parentCategoryId:string;
}