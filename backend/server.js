require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import des routes
const authRoutes = require('./routes/auth');
const gymRoutes = require('./routes/gyms');
const auditRoutes = require('./routes/audits');
const marketRoutes = require('./routes/market');

const app = express();

// ============================================
// MIDDLEWARES DE SÉCURITÉ
// ============================================

// Helmet pour sécuriser les headers HTTP
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Trop de requêtes',
    message: 'Vous avez dépassé la limite de requêtes. Réessayez plus tard.'
  }
});
app.use('/api/', limiter);

// ============================================
// MIDDLEWARES DE PARSING
// ============================================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ============================================
// ROUTES
// ============================================

// Route de santé
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'CrossFit Audit API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/gyms', gymRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api', marketRoutes);

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    message: '🏋️ CrossFit Audit API - Tulip Conseil',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      gyms: '/api/gyms',
      audits: '/api/audits',
      competitors: '/api/competitors',
      marketZones: '/api/market-zones',
      gymOffers: '/api/gym-offers'
    }
  });
});

// ============================================
// GESTION DES ERREURS
// ============================================

// Route non trouvée
app.use(notFound);

// Error handler
app.use(errorHandler);

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = process.env.PORT || 5176;

const server = app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`✅ Serveur démarré en mode ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log('🏋️  CrossFit Audit API - Tulip Conseil');
  console.log('========================================\n');
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Gestion du signal d'arrêt
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM reçu. Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

module.exports = app;
