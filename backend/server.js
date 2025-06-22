require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  }).then(() => {
    console.log('✅ MongoDB connected');
    app.listen(3000, () => console.log('🚀 Server running on port 3000'));
  }).catch(err => console.log('❌ MongoDB Error:', err));
  
  app.use('/api', require('./routes/agentRoutes'));
