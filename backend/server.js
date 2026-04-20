const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

const donorRoutes = require('./routes/donors');
const hospitalRoutes = require('./routes/hospitals');
const inventoryRoutes = require('./routes/inventory');
const requestRoutes = require('./routes/requests');
const chatbotRoutes = require('./routes/chatbot');
const idcheckRoutes = require('./routes/idcheck');

app.use('/api/idcheck', idcheckRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Blood Bank API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});