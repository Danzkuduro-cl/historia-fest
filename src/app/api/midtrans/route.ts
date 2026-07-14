import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { verifyMidtransSignature, mapMidtransStatus } from '@/lib/midtrans';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      order_id,
      transaction_status,
      fraud_status,
      gross_amount,
      signature_key,
      status_code,
      payment_type,
    } = body;

    // Verify signature
    const isValid = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );

    if (!isValid) {
      console.error('Invalid Midtrans signature for order:', order_id);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const newStatus = mapMidtransStatus(transaction_status, fraud_status);
    const supabase = createServerSupabase();

    // Update payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status: newStatus,
        payment_method: payment_type,
      })
      .eq('transaction_id', order_id)
      .select('team_id')
      .single();

    if (paymentError || !payment) {
      console.error('Payment update error:', paymentError);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update team payment status
    await supabase
      .from('teams')
      .update({ payment_status: newStatus })
      .eq('id', payment.team_id);

    console.log(`Payment ${order_id} updated to ${newStatus}`);
    return NextResponse.json({ status: 'OK' });
  } catch (error) {
    console.error('Midtrans webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
