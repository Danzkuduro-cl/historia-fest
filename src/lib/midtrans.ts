import crypto from 'crypto';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

const BASE_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1'
  : 'https://app.sandbox.midtrans.com/snap/v1';

const API_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://api.midtrans.com/v2'
  : 'https://api.sandbox.midtrans.com/v2';

export interface MidtransCreateTransactionParams {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  itemName: string;
}

export interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

export async function createMidtransTransaction(
  params: MidtransCreateTransactionParams
): Promise<MidtransSnapResponse> {
  const { orderId, amount, customerName, customerPhone, itemName } = params;

  const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');

  const body = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    item_details: [
      {
        id: 'TOURNAMENT_FEE',
        price: amount,
        quantity: 1,
        name: itemName,
      },
    ],
    customer_details: {
      first_name: customerName,
      phone: customerPhone,
    },
    enabled_payments: ['qris', 'gopay', 'dana', 'bank_transfer', 'bca_va', 'bni_va', 'bri_va'],
    callbacks: {
      finish: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?order_id=${orderId}`,
      error: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending?order_id=${orderId}`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/payment/pending?order_id=${orderId}`,
    },
    expiry: {
      duration: 24,
      unit: 'hours',
    },
  };

  const response = await fetch(`${BASE_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authString}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_messages?.[0] || 'Failed to create transaction');
  }

  return response.json();
}

export async function getMidtransTransactionStatus(orderId: string) {
  const authString = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');

  const response = await fetch(`${API_URL}/${orderId}/status`, {
    headers: {
      Authorization: `Basic ${authString}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get transaction status');
  }

  return response.json();
}

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string
): boolean {
  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${MIDTRANS_SERVER_KEY}`)
    .digest('hex');

  return hash === signatureKey;
}

export function mapMidtransStatus(
  transactionStatus: string,
  fraudStatus?: string
): 'paid' | 'pending' | 'failed' | 'expired' {
  if (transactionStatus === 'capture') {
    return fraudStatus === 'accept' ? 'paid' : 'failed';
  }
  if (transactionStatus === 'settlement') return 'paid';
  if (transactionStatus === 'pending') return 'pending';
  if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'failure') return 'failed';
  if (transactionStatus === 'expire') return 'expired';
  return 'pending';
}
