// routes/agentRoutes.js

const express = require('express');
const router = express.Router();

const supportAgent = require('../agents/supportAgent');
const dashboardAgent = require('../agents/dashboardAgent');

// 🔹 POST /api/support
router.post('/support', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required.' });

    const response = await supportAgent.handleQuery(query);
    res.json({ agent: 'SupportAgent', response });
  } catch (err) {
    console.error('❌ Support Agent Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🔹 POST /api/dashboard
router.post('/dashboard', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required.' });

    const response = await dashboardAgent.handleQuery(query);
    res.json({ agent: 'DashboardAgent', response });
  } catch (err) {
    console.error('❌ Dashboard Agent Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const geminiSupportAgent = require('../agents/geminiSupportAgent');

router.post('/gemini-support', async (req, res) => {
  try {
    const { query, sessionId = 'default' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const response = await geminiSupportAgent(query, sessionId);
    res.json({ agent: 'Gemini SupportAgent', sessionId, response });
  } catch (err) {
    console.error('❌ Gemini Support Agent Error:', err);
    res.status(500).json({ error: 'Gemini agent failed' });
  }
});


module.exports = router;
