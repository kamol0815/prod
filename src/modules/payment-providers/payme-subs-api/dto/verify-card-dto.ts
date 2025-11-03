import {IsNotEmpty} from "class-validator";

export class VerifyCardTokenPaymeDtoDto {

    @IsNotEmpty()
    token: string;

    @IsNotEmpty()
    code: string;

    @IsNotEmpty()
    userId: string;

    planId: string

    selectedService: string

}