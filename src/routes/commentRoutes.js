import express from 'express';
import {
  getCommentsByPostId,
  createComment,
  deleteComment
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', getCommentsByPostId);
router.post('/', protect, createComment);
router.delete('/:commentId', protect, deleteComment);

export default router;