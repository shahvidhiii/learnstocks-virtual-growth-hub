import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import yahooFinance from "npm:yahoo-finance2";

// Add CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { symbol, days } = await req.json();

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Stock symbol is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // ✅ Fetch current quote
    const quote = await yahooFinance.quote(symbol);

    const currentPrice = {
      price: quote.regularMarketPrice,
      diff: quote.regularMarketChange,
    };

    let historicalData: { date: string; close: number }[] = [];

    // ✅ Fetch historical data if days is provided
    if (days) {
      const result = await yahooFinance.historical(symbol, {
        period1: new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000),
        period2: new Date(),
        interval: "1d",
      });

      historicalData = result.map((item: any) => ({
        date: item.date,
        close: item.close,
      }));
    }

    const data = {
      symbol,
      currentPrice,
      historicalData,
    };

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
