import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import passport from 'passport';
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
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import { Product } from './model/product_model.js';
import { User } from './model/user_model.js';

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
      maxAge: 24 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
    },
  })
);
// passport config
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success');
  res.locals.error_msg = req.flash('error');
  res.locals.searchQuery = req.query.search || '';
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

app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);

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

const createProducts = async () => {
  try {
    const products = [
      {
        title: 'Classic Black T-Shirt',
        price: 499,
        description: 'A premium quality cotton t-shirt in black.',
        color: ['Black'],
        sizes: [
          { size: 'S', stock_quantity: 20 },
          { size: 'M', stock_quantity: 15 },
          { size: 'L', stock_quantity: 10 },
        ],
        category_id: '65f123abcde4567890f12345',
        club_id: '65f9876def0123456a789bcd',
        type: 'Clothing',
        image_url: [
          'https://images.unsplash.com/photo-1602810319425-3b1910f7c9c4',
          'https://images.unsplash.com/photo-1556909211-36967c31c180',
        ],
        is_deleted: false,
      },
      {
        title: 'Running Shoes',
        price: 2999,
        description:
          'Lightweight and comfortable running shoes for everyday use.',
        color: ['Red', 'Black'],
        sizes: [
          { size: '8', stock_quantity: 12 },
          { size: '9', stock_quantity: 8 },
          { size: '10', stock_quantity: 5 },
        ],
        category_id: '65f223abcde4567890f22345',
        club_id: '65f9876def0123456a789bce',
        type: 'Footwear',
        image_url: [
          'https://images.unsplash.com/photo-1598550476431-42c679d374a8',
          'https://images.unsplash.com/photo-1580910051070-3e8f92f82f66',
        ],
        is_deleted: false,
      },
    ];

    const savedProducts = await Product.create(products);
    console.log('Product created successfully:', savedProducts);
  } catch (error) {
    console.error('Error creating user:', error.message);
  }
};
