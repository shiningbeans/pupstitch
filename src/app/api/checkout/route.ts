import { NextRequest, NextResponse } from 'next/server';
import { BRAND } from '@/lib/brand';

export const dynamic = 'force-dynamic';

function getStripe() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY || '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, patternId, dogName, breedId } = body as {
      product: 'leashbuddy' | 'bundle' | 'crochet';
      patternId: string;
      dogName?: string;
      breedId?: string;
    };

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe is not configured yet. Check back soon!' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Build line items based on product selection
    type LineItem = {
      price_data: {
        currency: string;
        product_data: { name: string; description: string };
        unit_amount: number;
      };
      quantity: number;
    };
    const lineItems: LineItem[] = [];
    const breedDisplay = (breedId || 'custom')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c: string) => c.toUpperCase());
    const nameLabel = dogName ? `${dogName}'s` : breedDisplay;

    if (product === 'leashbuddy') {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${nameLabel} ${BRAND.catalog.leashBuddy.name}`,
            description: BRAND.catalog.leashBuddy.tagline,
          },
          unit_amount: BRAND.catalog.leashBuddy.price * 100,
        },
        quantity: 1,
      });
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${BRAND.catalog.crochetPdf.name} (Free with ${BRAND.catalog.leashBuddy.name})`,
            description: BRAND.catalog.crochetPdf.tagline,
          },
          unit_amount: 0,
        },
        quantity: 1,
      });
    } else if (product === 'bundle') {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${nameLabel} ${BRAND.catalog.bundle.name}`,
            description: BRAND.catalog.bundle.includes?.join(' + ') || BRAND.catalog.bundle.tagline,
          },
          unit_amount: BRAND.catalog.bundle.price * 100,
        },
        quantity: 1,
      });
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${BRAND.catalog.crochetPdf.name} (Included)`,
            description: BRAND.catalog.crochetPdf.tagline,
          },
          unit_amount: 0,
        },
        quantity: 1,
      });
    } else if (product === 'crochet') {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${nameLabel} ${BRAND.catalog.crochetPdf.name}`,
            description: BRAND.catalog.crochetPdf.tagline,
          },
          unit_amount: BRAND.catalog.crochetPdf.price * 100,
        },
        quantity: 1,
      });
    } else {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/editor/${patternId}?checkout=success`,
      cancel_url: `${origin}/editor/${patternId}?checkout=cancel`,
      metadata: {
        patternId,
        product,
        dogName: dogName || '',
        breedId: breedId || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Checkout] Error creating session:', error);
    const message = error instanceof Error ? error.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
