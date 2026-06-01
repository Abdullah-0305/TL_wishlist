import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rh_api_key = Deno.env.get("RH_API_KEY");
    if (!rh_api_key) {
      throw new Error("RH API key not configured");
    }

    const guild_id = Deno.env.get("GUILD_ID");
    if (!guild_id) {
      throw new Error("Guild ID not configured");
    }

    const response = await fetch(
      `https://raid-helper.xyz/api/v4/servers/${guild_id}/events`,
      {
        headers: {
          Authorization: rh_api_key,
        },
      }
    );

    if(!response.ok) {
        throw new Error(`Raid-Helper API error: ${response.statusText}`);
    }

    const data = await response.json();

    // 1. Timestamp actuel en secondes
    const now = Math.floor(Date.now() / 1000);
    const interval = 30 * 60; // 30 minutes en secondes

    const eventDuJour = data.postedEvents.find(event => {
        const startTime = event.startTime; // C'est déjà en secondes
        
        // On vérifie si l'event est dans un intervalle de 30 minutes autour de maintenant
        // (Soit il n'est pas encore passé, soit il est passé depuis moins de 30 min)
        return Math.abs(startTime - now) <= interval;
        });

        if (eventDuJour) {
        console.log("Événement trouvé :", eventDuJour.title);
        } else {
        console.log("Aucun événement dans l'intervalle de 30 minutes.");
    }

    const eventId = eventDuJour ? eventDuJour.id : "Aucun événement dans l'intervalle de 30 minutes.";

    
    return new Response(JSON.stringify(eventId), {
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