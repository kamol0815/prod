
export interface CardGetVerifyCodeResponse {
    jsonrpc: '2.0';
    id: number;
    result: {
        sent: boolean;
        phone: string;
        wait: number;
    };
}

export interface CardCreateRequest {
    id: number;
    method: 'cards.create';
    params: {
        card: {
            number: string;
            expire: string;
        };
        account?: Record<string, any>;
        save?: boolean;
        customer?: string;
    };
}

export interface CardGetVerifyCodeRequest {
    id: number;
    method: 'cards.get_verify_code';
    params: {
        token: string;
    };
}


export interface CardVerifyRequest {
    id: number;
    method: 'cards.verify';
    params: {
        token: string;
        code: string;
    };
}

export interface CardRemoveRequest {
    id: number;
    method: 'cards.remove';
    params: {
        token: string;
    };
}


export interface ReceiptPayRequest {
    id: number;
    method: 'receipts.pay';
    params: {
        id: string;
        token: string;
    };
}


export interface ReceiptCreateRequest {
    id: number;
    method: 'receipts.create';
    params: {
        amount: number;
        account: {
            user_id: string;
            plan_id: string;
        }
    };
}

export class PaymentCardTokenDto {


    userId: string;

    telegramId: number;

    planId: string;

}
