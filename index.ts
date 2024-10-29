import { serve } from 'bun';
import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? '';

// Initialize Stripe with your secret key
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

serve({
  fetch: async (req) => {
    // Allow CORS for all requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight (OPTIONS) request
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    if (req.method === 'POST') {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: 2000,
          currency: 'usd',
        });

        return new Response(
          JSON.stringify({ clientSecret: paymentIntent.client_secret }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        );
      } catch (error) {
        return new Response(JSON.stringify({ error: error?.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    } else {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: corsHeaders,
      });
    }
  },
});

console.log('API is running on http://localhost:3000');
