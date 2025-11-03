import axios from 'axios';
import logger from './logger';
import {
  FiscalDto,
  UzcardGetFiscalDto,
} from '../../modules/payment-providers/uzcard/dto/uzcard-payment.dto';
import { uzcardAuthHash } from './hashing/uzcard-auth-hash';

// Define the return type
interface FiscalResult {
  success: boolean;
  QRCodeURL?: string;
  receiptId?: number;
  fiscalSign?: string;
  terminalId?: string;
  dateTime?: string;
  error?: string;
}

export async function getFiscal(data: FiscalDto): Promise<FiscalResult> {
  const receiptIdNumber = Number(data.receiptId);
  const transactionId = data.transactionId;

  const date = new Date();

  const pad = (n: number) => n.toString().padStart(2, '0');

  const formattedTime =
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

  const payload: UzcardGetFiscalDto = {
    ReceiptId: receiptIdNumber,
    ReceivedCash: 0,
    ReceivedCard: 555500,
    Time: formattedTime,
    TotalVAT: (555500 / 1.12) * 0.12,
    IsRefund: 0,
    ReceiptType: 0,
    Items: [
      {
        Name: 'Render Systems',
        Barcode: '',
        Label: '',
        SPIC: '10304003008000000',
        OwnerType: 2,
        PackageCode: '1500572',
        GoodPrice: 555500,
        Price: 555500,
        Amount: 1000,
        VAT: (555500 / 1.12) * 0.12,
        VATPercent: 12,
        Discount: 0,
        Other: 0,
        CommissionInfo: {
          TIN: '304628203',
        },
      },
    ],
    Location: {
      Latitude: 41.31770145,
      Longitude: 69.28064123,
    },
    ExtraInfo: {
      PhoneNumber: '',
    },
  };

  // (Amount / 1.12)*0.12

  logger.error(`Request body is ${JSON.stringify(payload)}`);

  try {
    const authHeader = uzcardAuthHash();

    const response = await axios.post(
      `https://pay.myuzcard.uz/api/Fiscal/GetFiscalSign?transactionId=${transactionId}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
          Authorization: authHeader,
          Language: 'uz',
        },
      },
    );

    // Based on your actual response structure
    const responseData = response.data;
    const ofdModel = responseData?.result?.ofdModel;

    if (ofdModel?.Message === 'accepted') {
      console.log('Fiscal data accepted:', ofdModel);
      return {
        success: true,
        QRCodeURL: ofdModel.QRCodeURL,
        receiptId: ofdModel.ReceiptId,
        fiscalSign: ofdModel.FiscalSign,
        terminalId: ofdModel.TerminalID,
        dateTime: ofdModel.DateTime,
      };
    } else {
      const errorMessage =
        ofdModel?.Message || responseData?.error || 'Unknown error';
      console.error('Fiscal request failed:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error sending fiscal request:', errorMessage);
    return {
      success: false,
      error: errorMessage,
    };
  }
}
