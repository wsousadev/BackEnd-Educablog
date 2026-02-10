import { Router } from 'express';
import { authenticateToken /*, checkRole*/ } from '../middleware/auth.middleware.js';
import {
    registerUser,
    listAllUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/users.controller.js';

const router = Router();

router.post('/register', registerUser);

router.get('/', authenticateToken, listAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, deleteUser);

export default router;
