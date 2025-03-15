import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import nocache from 'nocache';
import { fileURLToPath } from 'url';
import { errorhandling } from './middlewares/error_handling.js';
import { connectDB } from './config/db.js';
import { Admin } from './model/admin_model.js';
import { User } from './model/user_model.js';
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
app.use(nocache());

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

const createUser = async () => {
  try {
    const users = [
      {
        full_name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '9876543210',
        password: 'password123',
      },
      {
        full_name: 'Bob Williams',
        email: 'bob@example.com',
        phone: '9876543211',
        password: 'password456',
      },
      {
        full_name: 'Charlie Brown',
        email: 'charlie@example.com',
        phone: '9876543212',
        password: 'password789',
      },
    ];

    const savedUser = await User.create(users);
    console.log('User created successfully:', savedUser);
  } catch (error) {
    console.error('Error creating user:', error.message);
  }
};
