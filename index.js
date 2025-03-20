import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import nocache from 'nocache';
import session from 'express-session';
import flash from 'connect-flash';
import methodOverride from 'method-override';
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

// flash
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 600000,
      secure: false,
      httpOnly: true,
    },
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  next();
});

//common middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  methodOverride((req, res) => {
    if (req.body && '_method' in req.body) {
      const method = req.body._method.toUpperCase();
      delete req.body._method;
      return method;
    }
    return req.method;
  })
);
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(nocache());

//set view engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/admin_main');
// routes
app.get('/spinner', (req, res) => {
  res.render('partials/spinner', { cssFile: null, js_file: null });
});
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
        full_name: 'David Smith',
        email: 'david@example.com',
        phone: '9876543213',
        password: 'password101',
      },
      {
        full_name: 'Emma Davis',
        email: 'emma@example.com',
        phone: '9876543214',
        password: 'password202',
      },
      {
        full_name: 'Frank Miller',
        email: 'frank@example.com',
        phone: '9876543215',
        password: 'password303',
      },
      {
        full_name: 'Grace Wilson',
        email: 'grace@example.com',
        phone: '9876543216',
        password: 'password404',
      },
      {
        full_name: 'Henry Martinez',
        email: 'henry@example.com',
        phone: '9876543217',
        password: 'password505',
      },
      {
        full_name: 'Isabella Anderson',
        email: 'isabella@example.com',
        phone: '9876543218',
        password: 'password606',
      },
      {
        full_name: 'Jack Thomas',
        email: 'jack@example.com',
        phone: '9876543219',
        password: 'password707',
      },
      {
        full_name: 'Karen Harris',
        email: 'karen@example.com',
        phone: '9876543220',
        password: 'password808',
      },
      {
        full_name: 'Liam White',
        email: 'liam@example.com',
        phone: '9876543221',
        password: 'password909',
      },
      {
        full_name: 'Mia Hall',
        email: 'mia@example.com',
        phone: '9876543222',
        password: 'password000',
      },
    ];

    const savedUser = await User.create(users);
    console.log('User created successfully:', savedUser);
  } catch (error) {
    console.error('Error creating user:', error.message);
  }
};
