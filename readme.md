# 🛒 My First eCommerce Project

This is my first fully functional **eCommerce web application** built using **Node.js, Express, MongoDB, and EJS**. The platform allows users to browse products, manage their cart, place orders, and make payments through Razorpay. Admins can manage products and view customer orders.

---

## 🚀 Features

### ✅ User Side

- 🧾 User authentication (Login, Register, Logout)
- 🔐 Passwords secured with **bcrypt**
- 🛍️ Product browsing with categories and search
- 🛒 Add to Cart / Remove from Cart
- 💳 Razorpay payment gateway integration
- 📧 Order confirmation via email using **Nodemailer**
- 📄 Order history and invoice (PDF with Puppeteer)
- 🌐 Google Login with **passport-google-oauth20**
- 🧪 Server-side validation with Zod schemas (product, user, login forms)

### ⚙️ Admin Side

- 🔑 Admin authentication
- 📦 Product management (Add, Edit, Delete)
- 🧾 Order management and status updates
- 📊 Sales overview with **Moment.js** for date formatting
- 📤 Upload product images via **Cloudinary**
- 📎 Slug URLs for SEO using **slugify**

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, EJS, Express-EJS-Layouts
- **Database**: MongoDB + Mongoose
- **Authentication**: Passport.js (Google OAuth), express-session, bcrypt
- **File Uploads**: multer, multer-storage-cloudinary
- **Payments**: Razorpay
- **PDF Generation**: Puppeteer
- **Email**: Nodemailer
- **Others**: dotenv, method-override, cookie-parser, connect-flash, morgan, nocache

---

## 📦 Installation

### 1. Clone the repo

```bash
git clone https://github.com/Ebi-manoj/ecommerce-app.git
cd ecommerce-app

```

### 2. Install dependencies

npm install

### 3. Create a .env file

PORT=3000
MONGODB_URI=your_mongodb_uri
SESSION_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

### 4. Start the server

```bash
npm start
```

#### Visit http://localhost:3000 to view the app.

### 📁 Folder Structure (Simplified)

ecommerce-app/
├── public/
├── views/
├── routes/
├── controllers/
├── models/
├── middlewares/
├── utils/
├── config/
├── .env
├── app.js

### 👨‍💻 Author

**Ebi** – [LinkedIn](https://www.linkedin.com/in/ebi-manoj/) | [GitHub](https://github.com/ebi-manoj)
