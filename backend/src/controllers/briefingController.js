const { getWeather, getNotams } = require('../services/aviationService');
const { analyzeChat } = require('../services/aiService');

const handleChat = async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    console.log(`[Chat] Incoming pilot request: "${message}"`);
    
    // 1. Buscamos códigos ICAO en el mensaje (letras mayúsculas de 4 dígitos)
    const regexIcao = /\b[A-Z]{4}\b/g;
    const foundIcaos = message.match(regexIcao) || [];
    
    // 2. Si encontramos códigos, extraemos los datos climáticos en tiempo real
    const contextData = [];
    if (foundIcaos.length > 0) {
      console.log(`[System] Interceptados ICAOs: ${foundIcaos.join(', ')}`);
      for (const icao of foundIcaos) {
        const weather = await getWeather(icao);
        const notams = await getNotams(icao);
        contextData.push({
          icao: icao,
          metar: weather.metar,
          taf: weather.taf,
          notams: notams
        });
      }
    }

    // 3. Enviamos a Gemini 3.1 el mensaje del usuario + la "inyección" de datos (RAG)
    const aiResponse = await analyzeChat(message, contextData);

    res.json({
      success: true,
      response: aiResponse,
      intercepted: foundIcaos
    });

  } catch (error) {
    console.error(`[Chat Error]`, error.message);
    res.status(500).json({ success: false, error: 'Houston, we have a problem. IA disconnected.' });
  }
};

module.exports = { handleChat };