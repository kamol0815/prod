import {IsNotEmpty} from "class-validator";

export class CreateCardTokenPaymeDto {

    @IsNotEmpty()
    number: string;

    @IsNotEmpty()
    expire: string;

    @IsNotEmpty()
    userId: string;

    planId: string;

    selectedService: string;
}