import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { FARES } from "@/lib/product-config";

// Requires STRIPE_SECRET_KEY in .env.local — use a TEST MODE key (sk_test_...)
// while building. Never commit real keys to the repo.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-06-20",
});

const FARE_LOOKUP: Record<string, { price: number; label: string }> = {
  singleRide: FARES.singleRide,
  dayPass: FARES.dayPass,
  tenRidePass: FARES.tenRidePass,
  eventBundle: FARES.eventBundle,
};

export async function POST(req: NextRequest) {
  const { fareKey } = await req.json();
  const fare = FARE_LOOKUP[fareKey];

  if (!fare) {
    return NextResponse.json({ error: "Unknown fare" }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY not set — add a test-mode key to .env.local" },
      { status: 500 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: fare.label },
          unit_amount: Math.round(fare.price * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${req.nextUrl.origin}/pricing?status=success`,
    cancel_url: `${req.nextUrl.origin}/pricing?status=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
