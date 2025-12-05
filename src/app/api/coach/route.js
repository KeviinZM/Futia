// src/app/api/coach/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  console.log("🤖 COACH: Tentative avec Gemini 2.5 Flash...");

  try {
    const body = await req.json();
    const { squad } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Clé API manquante" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // --- MISE À JOUR : Utilisation du modèle que tu as trouvé ---
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const playersList = squad
      .filter((slot) => slot.player)
      .map((slot) => `- ${slot.player.name} (${slot.player.rating}) au poste ${slot.position}`)
      .join("\n");

    const prompt = `
      Tu es un coach expert e-sport sur FC 25.
      Voici mon équipe :
      ${playersList}

      Analyse-la et donne-moi 3 conseils stratégiques précis (Points forts, Faiblesses, Joueur à changer).
      Sois direct, concis et utilise des emojis.
    `;

    console.log("📤 Envoi à l'IA...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("📥 Réponse reçue !");

    return NextResponse.json({ advice: text });

  } catch (error) {
    console.error("❌ ERREUR GEMINI :", error);
    return NextResponse.json({ 
      error: `Erreur IA : ${error.message}` 
    }, { status: 500 });
  }
}