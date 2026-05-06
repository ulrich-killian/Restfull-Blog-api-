import * as commentService from '../services/commentService.js';

export const getCommentsByPostId = async (req, res) => {
  try {
    const comments = await commentService.getCommentsByPostId(req.params.id);
    res.status(200).json({ success: true, data: comments, count: comments.length });
  } catch (error) {
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Content is required' });
    }
    const comment = await commentService.createComment({
      content,
      post_id: req.params.id,
      author_id: req.user.id
    });
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Error creating comment', error: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    await commentService.deleteComment(req.params.commentId, req.user.id);
    res.status(200).json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    if (error.message === 'COMMENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
};