const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const memberRoutes = require('./routes/member');
dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use('/api/members', memberRoutes);
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || '', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log('Server running on port', PORT));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    // still start server for local development without DB
    app.listen(PORT, () => console.log('Server running on port', PORT, '(no DB connected)'));
  });