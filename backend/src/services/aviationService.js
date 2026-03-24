const axios = require('axios');

const BASE_URL = 'https://aviationweather.gov/api/data';

const getWeather = async (icao) => {
  try {
    const metarRes = await axios.get(`${BASE_URL}/metar?ids=${icao}&format=raw`);
    const tafRes = await axios.get(`${BASE_URL}/taf?ids=${icao}&format=raw`);
    
    return {
      icao: icao,
      metar: metarRes.data || 'N/A',
      taf: tafRes.data || 'N/A'
    };
  } catch (error) {
    console.error(`Error fetching weather for ${icao}:`, error.message);
    return { icao, metar: 'Error fetching', taf: 'Error fetching' };
  }
};

// Simulando NOTAMs (hasta que consigamos el scraper de pago o token FAA)
const getNotams = async (icao) => {
  return `
    A0001/26 NOTAMN
    Q) LECM/QMRLC/IV/NBO/A/000/999/
    A) ${icao} B) 2603241200 C) 2603251200
    E) RWY 36R/18L CLOSED DUE TO WIP.
  `;
};

module.exports = { getWeather, getNotams };