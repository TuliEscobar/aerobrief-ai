require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const briefingRoutes = require('./routes/briefingRoutes');
app.use('/api/v1/briefing', briefingRoutes);

const publicPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(publicPath));

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[AeroBrief] Servidor levantado en puerto ${PORT} ✈️`);
});