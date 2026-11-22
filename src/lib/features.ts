/**
 * Online ordering is switched off: every product is made after a consultation and
 * prices aren't shown. The old cart/checkout/Razorpay code is kept but disabled.
 * Set ONLINE_ORDERS_ENABLED=true (and give products real prices) to turn it back on.
 */
export const ONLINE_ORDERS_ENABLED = process.env.ONLINE_ORDERS_ENABLED === "true";
