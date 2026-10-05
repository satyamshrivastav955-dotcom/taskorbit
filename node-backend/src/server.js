const express = require('express');

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'taskorbit-backend', phase: 0 });
});

const port = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(port, () => {
    console.log(`TaskOrbit backend listening on ${port}`);
  });
}

module.exports = app;
