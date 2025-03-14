import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { errorhandling } from './middlewares/error_handling.js';
import { connectDB } from './config/db.js';
import { Admin } from './model/admin_model.js';
import adminRoutes from './routes/admin_routes.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

//common middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

//set view engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/admin_main');
// routes
app.use('/admin', adminRoutes);

// error Handling
app.use(errorhandling);
app.listen(PORT, () => console.log(`Server is running on the ${PORT}`));

// create admin
async function createAdmin() {
  try {
    const admin = new Admin({
      name: 'admin',
      email: 'admin123@gmail.com',
      password: 'admin1234',
    });
    await admin.save();
    console.log('Admin data inserted');
  } catch (error) {
    console.log(error);
  }
}

// createAdmin();
