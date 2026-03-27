const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Importamos tu scraper (el archivo que pegaste)
const cinecalidad = require('./cinecalidad-scraper');
const getStreams = cinecalidad.getStreams;

const manifest = {
  id: "com.cinecalidad.stremio",
  version: "1.0.0",
  name: "CineCalidad",
  description: "Películas en español/latino desde CineCalidad.vg (calidad 1080p y enlaces directos)",
  resources: ["stream"],
  types: ["movie"],
  idPrefixes: ["tmdb:"],
  logo: "https://www.cinecalidad.vg/favicon.ico",
  behaviorHints: {
    adult: false,
    configurable: false
  }
};

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(manifest));
});

// Endpoint principal de Stremio
app.get('/stream/:type/:id.json', async (req, res) => {
  const { type, id: fullId } = req.params;

  // Solo soportamos películas por ahora (el scraper original dice que series no están listas)
  if (type !== 'movie') {
    return res.json({ streams: [] });
  }

  // Stremio envía "tmdb:12345" → extraemos solo el número
  let tmdbId = fullId.startsWith('tmdb:') ? fullId.slice(5) : fullId;

  try {
    console.log(`[Stremio] Solicitud para TMDB: ${tmdbId}`);
    
    // Llamamos a tu función De(e, t, n, s)
    const streams = await getStreams(tmdbId, type);

    res.json({
      streams: streams || []
    });
  } catch (err) {
    console.error('[Stremio] Error:', err.message);
    res.json({ streams: [] });
  }
});

app.listen(port, () => {
  console.log(`\n✅ CineCalidad Addon corriendo en: http://localhost:${port}`);
  console.log(`📋 Manifest (para instalar en Stremio): http://localhost:${port}/manifest.json\n`);
});