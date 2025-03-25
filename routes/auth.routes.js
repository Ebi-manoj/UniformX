import express from 'express';
import {
  getLogin,
  getSignup,
} from '../controllers/user_controllers/auth_user.controller.js';

const router = express.Router();

router.get('/signup', getSignup);
router.get('/login', getLogin);

export default router;
