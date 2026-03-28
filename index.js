const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Importamos el scraper
const cinecalidad = require('./cinecalidad-scraper');
const getStreams = cinecalidad.getStreams;

const manifest = {
  id: "com.cinecalidad.stremio",
  version: "1.0.1",
  name: "CineCalidad",
  description: "Películas en español y latino desde CineCalidad.vg",
  resources: ["stream"],
  types: ["movie"],
  idPrefixes: ["tmdb:"],
  logo: "https://www.cinecalidad.vg/favicon.ico",
  behaviorHints: {
    adult: false,
    configurable: false
  }
};

// CORS headers (importante para Stremio)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.get('/', (req, res) => {
  res.send(`
    <h1>✅ CineCalidad Stremio Addon está activo</h1>
    <p>Instala este addon en Stremio usando la siguiente URL:</p>
    <strong>https://${req.get('host')}/manifest.json</strong>
  `);
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(manifest));
});

app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id: fullId } = req.params;

  if (type !== 'movie') {
    return res.json({ streams: [] });
  }

  const tmdbId = fullId.startsWith('tmdb:') ? fullId.slice(5) : fullId;

  try {
    const streams = await getStreams(tmdbId, type);
    res.json({ streams: streams || [] });
  } catch (err) {
    console.error('Error:', err.message);
    res.json({ streams: [] });
  }
});

app.listen(port, () => {
  console.log(`✅ CineCalidad Addon corriendo en puerto ${port}`);
});