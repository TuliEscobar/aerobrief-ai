const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = process.env.GEMINI_API_KEY;

const analyzeChat = async (userMessage, contextData) => {
  if (!apiKey) throw new Error('No Gemini API Key defined in .env');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

  let systemContext = `Eres AeroBrief AI, un Despachador de Vuelo Senior y un Copiloto inteligente para pilotos profesionales.
  El usuario te hará preguntas de aviación. A veces, el sistema interceptará aeropuertos (ICAO codes) y te inyectará datos meteorológicos reales de la NOAA en este momento.
  
  TUS REGLAS:
  1. Eres conciso, usas jerga aeronáutica profesional pero fácil de leer (no bloques de texto, usa viñetas o emojis claros como 🔴🟡🟢 para riesgos).
  2. Si te pasan datos meteorológicos (METAR/TAF) o NOTAMs crudos, tradúcelos a lenguaje natural para que el piloto no tenga que descifrarlos de memoria.
  3. Si hay tormentas (TSRA), ráfagas cruzadas altas (Gusts), visibilidad baja (FG, BR) o pistas cerradas, resáltalo en ROJO o indica "PELIGRO".
  4. Si no te pasan datos, responde de forma educada y pide que te den códigos ICAO (ej: "Dime el código de tu destino, como LEMD").
  `;

  if (contextData && contextData.length > 0) {
    systemContext += `\n\n--- DATOS DE VUELO INYECTADOS EN TIEMPO REAL (NOAA/FAA) ---\n`;
    contextData.forEach(d => {
      systemContext += `Aeropuerto: ${d.icao}\nMETAR: ${d.metar}\nTAF: ${d.taf}\nNOTAMs: ${d.notams}\n\n`;
    });
  }

  const prompt = `${systemContext}\n\nPiloto: "${userMessage}"\nAeroBrief AI:`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw new Error("Failed to generate AI response.");
  }
};

module.exports = { analyzeChat };