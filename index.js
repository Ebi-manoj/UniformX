import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Admin } from './model/admin_model.js';
dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Hello');
});

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
