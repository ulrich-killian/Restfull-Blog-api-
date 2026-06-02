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
import commentRoutes from './src/routes/commentRoutes.js';
import deleteCommentRoute from './src/routes/deleteCommentRoute.js';
import { fileURLToPath } from 'url';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.3/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.3/swagger-ui-bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.3/swagger-ui-standalone-preset.min.js'
  ]
}));


app.get('/api-docs-json', (req, res) => {
  res.json(swaggerSpec);
});

app.use(generalLimiter);
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.get('/search', getAllPosts);
app.use('/posts/:id/comments', commentRoutes);
app.use('/comments', deleteCommentRoute);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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