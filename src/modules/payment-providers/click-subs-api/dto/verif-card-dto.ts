import {IsNotEmpty} from "class-validator";

export class VerifyCardTokenDto {

    @IsNotEmpty()
    card_token: string;

    @IsNotEmpty()
    sms_code: number;

    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    expireDate: string;

    planId: string;

    selectedService: string;


}