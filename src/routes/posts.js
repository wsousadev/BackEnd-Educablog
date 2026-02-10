import { Router } from 'express';
import { authenticateToken , checkRole } from '../middleware/auth.middleware.js';
import {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    searchPosts,
    deletePost
} from '../controllers/posts.controller.js';

const router = Router();

router.get('/', getAllPosts);
router.get('/search', searchPosts);
router.get('/:id', getPostById);

router.post("/", authenticateToken, checkRole(['PROFESSOR']), createPost);
router.put("/:id", authenticateToken, checkRole(['PROFESSOR']), updatePost);
router.delete("/:id", authenticateToken, checkRole(['PROFESSOR']), deletePost);

export default router;
