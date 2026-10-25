/**
 * TableCraft Development Sandbox Payment Adapter
 * 
 * NOTICE: This is an isolated, simulated payment gateway for testing and demonstration.
 * In a production deployment, this adapter is backed by an audited merchant processor
 * (such as Stripe, Adyen, or a regulated escrow/custody partner) supporting delayed capture
 * or holding accounts for future release.
 */

export interface PaymentIntentRequest {
  amountCents: number; // 200 for $2.00
  currency: 'USD';
  idempotencyKey: string;
  customerEmail: string;
  customerName: string;
  metadata: {
    restaurantId: string;
    restaurantName: string;
    date: string;
    time: string;
    partySize: number;
  };
}

export interface PaymentResult {
  success: boolean;
  transactionReference?: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'requires_action';
  errorCode?: string;
  errorMessage?: string;
  isSimulated: true;
}

export class SandboxPaymentAdapter {
  /**
   * Process a simulated payment with intentional latency to mirror real tokenization and 3D Secure / authorization.
   * Can simulate failure when requested for testing recovery flows.
   */
  static async processPayment(
    request: PaymentIntentRequest,
    paymentMethod: string,
    options?: { shouldFail?: boolean; failureReason?: string }
  ): Promise<PaymentResult> {
    // Artificial 1000ms delay to simulate real card processing network handshake
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (options?.shouldFail) {
      return {
        success: false,
        status: 'failed',
        paymentMethod,
        amount: request.amountCents / 100,
        currency: request.currency,
        errorCode: 'card_declined_insufficient_funds',
        errorMessage:
          options.failureReason ||
          'Your simulated test card was declined (test simulation). Your card has not been charged.',
        isSimulated: true,
      };
    }

    const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      success: true,
      status: 'succeeded',
      transactionReference: `SANDBOX_TXN_${Date.now()}_${randomSuffix}`,
      paymentMethod,
      amount: request.amountCents / 100,
      currency: request.currency,
      isSimulated: true,
    };
  }
}
