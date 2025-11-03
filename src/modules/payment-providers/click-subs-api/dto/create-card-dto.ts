import {IsNotEmpty} from "class-validator";

export class CreateCardTokenDto {

    @IsNotEmpty()
    card_number: string;

    @IsNotEmpty()
    expire_date: string;

    @IsNotEmpty()
    temporary: boolean;

    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    planId: string;

    @IsNotEmpty()
    telegramId: number;


}