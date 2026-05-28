import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

if (stripeSecretKey === "sk_test_placeholder") {
  console.warn("⚠️  Stripe Secret Key (STRIPE_SECRET_KEY) is not set in .env. Real Stripe requests will fail.");
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16" as any,
});
