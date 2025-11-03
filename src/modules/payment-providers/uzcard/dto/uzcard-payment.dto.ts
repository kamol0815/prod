export class UzcardPaymentDto {
  cardNumber: string;
  expireDate: string;
  userId: string;
  telegramId?: number;
}

export class UzcardPaymentResponseDto {
  session: number;
  otpSentPhone: string;
  success: boolean;
}

export class UzcardPaymentConfirm {
  session: number;
  otp: string;

  userId?: string;
  telegramId: number;
  selectedService: string;
}
export class UzcardGetFiscalDto {
  ReceiptId: number;
  ReceivedCash: number;
  ReceivedCard: number;
  Time: string;
  TotalVAT: number;
  IsRefund: number;
  ReceiptType: number;
  Items: {
    Name: string;
    Barcode: string;
    Label: string;
    SPIC: string;
    OwnerType: number;
    PackageCode: string;
    GoodPrice: number;
    Price: number;
    Amount: number;
    VAT: number;
    VATPercent: number;
    Discount: number;
    Other: number;
    CommissionInfo: {
      TIN: string;
    };
  }[];
  Location: {
    Latitude: number;
    Longitude: number;
  };
  ExtraInfo: {
    PhoneNumber: string;
  };
}

export class FiscalDto {
  transactionId: number;
  receiptId: number;
}
