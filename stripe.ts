import { supabase } from './supabase'

export type StripeProduct = 'featured_listing' | 'promoted_event' | 'creator_subscription'

const PRODUCT_PRICES: Record<StripeProduct, number> = {
  featured_listing: 4900,    // $49/month
  promoted_event: 2900,       // $29 one-time
  creator_subscription: 999,  // $9.99/month
}

/**
 * Create a Stripe PaymentSheet for a given product.
 * Calls the Supabase Edge Function which creates a PaymentIntent on the server.
 */
export async function createPaymentSheet(
  product: StripeProduct,
  metadata?: Record<string, string>,
): Promise<{ paymentIntent: string; ephemeralKey: string; customer: string } | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: {
        product,
        amount: PRODUCT_PRICES[product],
        currency: 'usd',
        metadata,
      },
    })

    if (error) throw error
    return data
  } catch (err) {
    console.error('createPaymentSheet error:', err)
    return null
  }
}

export const productLabels: Record<StripeProduct, string> = {
  featured_listing: 'Featured Listing',
  promoted_event: 'Promoted Event',
  creator_subscription: 'Creator Subscription',
}

export function formatProductPrice(product: StripeProduct): string {
  const cents = PRODUCT_PRICES[product]
  return `$${(cents / 100).toFixed(2)}`
}
