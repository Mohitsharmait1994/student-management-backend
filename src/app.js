const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.json({ message: 'API Running' }));
app.use('/api/admin', adminRoutes);

// Start server after DB connection
const PORT = process.env.PORT || 5000;
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected.');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Models synchronized.');
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => console.error('❌ Startup error:', err));
