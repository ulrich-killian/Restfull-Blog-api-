import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './src/config/database.config.js';
import { createTables } from './src/models/schema.model.js';
import authRoutes from './src/routes/authRoutes.js';
import { generalLimiter } from './src/middleware/rateLimit.js';
import postRoutes from './src/routes/postRoutes.js';
import { getAllPosts } from './src/controllers/postController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(generalLimiter);
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.get('/search', getAllPosts);

app.get('/', (req, res) => {
  res.send('Blog API is running');
});

const startServer = async () => {
  try {
    await testConnection();
    await createTables();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();