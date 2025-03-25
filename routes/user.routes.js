import express from 'express';
import { getHome } from '../controllers/user_controllers/auth_user.controller.js';

const router = express.Router();

router.get('', getHome);

export default router;
