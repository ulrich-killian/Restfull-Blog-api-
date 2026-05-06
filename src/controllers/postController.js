import * as postService from '../services/postService.js';

export const getAllPosts = async (req, res) => {
  try {
    const { limit = 10, offset = 0, q } = req.query;
    const result = await postService.getAllPosts({
      limit: parseInt(limit),
      offset: parseInt(offset),
      search: q
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts', error: error.message });
  }
};

export const getPostById = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await postService.createPost({
      title,
      content,
      author_id: req.user.id
    });
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await postService.updatePost(
      req.params.id,
      req.user.id,
      { title, content }
    );
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ message: 'You can only update your own posts' });
    }
    res.status(500).json({ message: 'Error updating post', error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    await postService.deletePost(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    if (error.message === 'POST_NOT_FOUND') {
      return res.status(404).json({ message: 'Post not found' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }
    res.status(500).json({ message: 'Error deleting post', error: error.message });
  }
};