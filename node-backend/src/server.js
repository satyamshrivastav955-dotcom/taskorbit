const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'taskorbit-backend' });
});

// Public routes (no ID token yet): registration. Everything else is behind verifyToken.
// eslint-disable-next-line global-require
app.post('/api/auth/register', require('./controllers/auth').register);

// eslint-disable-next-line global-require
app.use('/api', require('./routes/api'));

// Consistent error shape
// eslint-disable-next-line no-unused-vars
app.use((e, req, res, next) => res.status(500).json({ error: { code: 'internal', message: 'Unexpected error' } }));

const port = process.env.PORT || 4000;
if (require.main === module) {
  // eslint-disable-next-line no-console
  app.listen(port, () => console.log(`TaskOrbit backend listening on ${port}`));
}

module.exports = app;
