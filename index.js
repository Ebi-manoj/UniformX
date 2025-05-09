import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import passport from 'passport';
import morgan from 'morgan';
import expressLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import nocache from 'nocache';
import session from 'express-session';
import flash from 'connect-flash';
import methodOverride from 'method-override';
import { fileURLToPath } from 'url';
import { errorhandling } from './middlewares/error_handling.js';
import { connectDB } from './config/db.js';
import adminRoutes from './routes/admin.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import { User } from './model/user_model.js';

dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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
app.use(morgan('dev'));
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
  res.locals.css_file = res.locals.css_file || null;
  res.locals.js_file = res.locals.js_file || null;
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
app.use((req, res, next) => {
  const layout = './layouts/user_main';

  res.render('user/404', { layout, cartLength: null });
});

// error Handling
app.use(errorhandling);
app.listen(PORT, () => console.log(`Server is running on the ${PORT}`));
