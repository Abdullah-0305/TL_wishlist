import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return new Response(
        JSON.stringify({ error: "eventId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const rh_api_key = Deno.env.get("RH_API_KEY");
    if (!rh_api_key) {
      throw new Error("RH API key not configured");
    }

    const response = await fetch(
      `https://raid-helper.xyz/api/v4/events/${eventId}`,
      {
        headers: {
          Authorization: rh_api_key,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Raid-Helper API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Filtrer et formater les inscrits valides
    const validSignups = data.signUps
      .filter((s: any) => s.className !== "Absence" && s.className !== "Tentative")
      .map((s: any) => ({
        userid: s.userId,
        name: s.name,
        className: s.className,
        specName: s.specName || "",
      }));

    return new Response(JSON.stringify({ signups: validSignups }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

