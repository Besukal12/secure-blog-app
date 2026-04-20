# 🚀 Secured Blog System

Welcome to the **Secured Blog System** – your robust backend powerhouse for authentication and blog management! This isn't just another API; it's a fortress of security wrapped in a user-friendly package, designed to handle user authentication, content creation, and more with elegance and reliability.

## 🌟 App Overview

Imagine a digital sanctuary where users can securely register, log in, and manage their accounts, while admins effortlessly create and share captivating blog posts. That's what this system delivers! Built with modern web standards, it ensures every interaction is safe, fast, and scalable. Whether you're building a personal blog platform or a community-driven app, this backend has your back.

Key highlights:
- **Bulletproof Authentication**: Multi-layered security with JWT tokens, password hashing, and email verification.
- **Seamless Blog Management**: Admins can upload stunning images and craft engaging content.
- **Google OAuth Integration**: One-click sign-ins for the modern user.
- **Role-Based Access Control**: Keep things organized with user and admin roles.
- **Cloud-Powered Media**: Store images effortlessly on Cloudinary.

## 🛠️ Tech Stack

We've handpicked the best tools to make this system lightning-fast and developer-friendly. Here's the arsenal:

| Category          | Technologies                                                                 | Icons |
|-------------------|------------------------------------------------------------------------------|-------|
| **Runtime**      | Node.js                                                                     | 🟢   |
| **Framework**    | Express.js                                                                  | 🚀   |
| **Language**     | TypeScript                                                                  | 🔷   |
| **Database**     | MongoDB (with Mongoose ODM)                                                 | 🍃   |
| **Authentication**| JWT (JSON Web Tokens), bcryptjs                                             | 🔐   |
| **Validation**   | Zod                                                                         | ✅   |
| **File Upload**  | Multer, Cloudinary                                                          | ☁️   |
| **Email**        | Nodemailer                                                                  | 📧   |
| **OAuth**        | Google Auth Library                                                         | 🔵   |
| **Security**     | Helmet, CORS, Express Rate Limit, Express Mongo Sanitize                    | 🛡️   |
| **Development**  | Nodemon, ts-node-dev                                                        | 🔄   |

## ✨ Features

Dive into the features that make this system shine! Each one is crafted with care to provide a smooth, secure experience.

### 🔐 Authentication & User Management
- **User Registration**: Sign up with email, name, and password – all validated and hashed for safety.
- **Email Verification**: Confirm your account with a secure email link to keep things legit.
- **Login & Logout**: Seamless sessions with JWT access and refresh tokens.
- **Password Reset**: Forgot your password? No worries – reset it securely via email.
- **Google OAuth**: Log in with your Google account in a flash.
- **Profile Access**: Fetch your user details anytime.
- **Role-Based Permissions**: Admins get extra powers, users stay in their lane.

### 📝 Blog Management
- **Create Blogs**: Admins can post blogs with titles, descriptions, and images uploaded to the cloud.
- **Image Handling**: Automatic validation, secure uploads to Cloudinary, and public access.
- **Fetch Blogs**: Users can browse all published blogs with ease.
- **Admin Controls**: Only admins can create or delete blogs – keeping content quality high.

### 🛡️ Security & Performance
- **Rate Limiting**: Protect against abuse with smart request throttling.
- **Input Sanitization**: MongoDB injection? Not on our watch!
- **CORS & Helmet**: Secure headers and cross-origin requests handled properly.
- **Token Management**: Refresh tokens for long-lasting sessions without compromising security.

## ⚙️ Configuration

To get this beast running, you'll need to set up some environment variables. Think of it as feeding the system its secret sauce. Create a `.env` file in the root directory and add these:

| Variable              | Description                                      | Example |
|-----------------------|--------------------------------------------------|---------|
| `PORT`               | Server port (defaults to 5000)                   | 5000 |
| `MONGODB_URI`        | Your MongoDB connection string                   | mongodb://localhost:27017/secured-blog-system |
| `JWT_SECRET`         | Secret key for JWT signing                       | your-super-secret-jwt-key |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens                        | your-refresh-secret |
| `FRONTEND_URL`       | Your frontend app URL for CORS                   | http://localhost:3000 |
| `APP_URL`            | Base URL for email links                         | http://localhost:5000 |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                        | your-cloud-name |
| `CLOUDINARY_API_KEY` | Cloudinary API key                               | your-api-key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                       | your-api-secret |
| `EMAIL_HOST`         | SMTP host for emails                             | smtp.gmail.com |
| `EMAIL_PORT`         | SMTP port                                        | 587 |
| `EMAIL_USER`         | Email username                                   | your-email@gmail.com |
| `EMAIL_PASS`         | Email password                                   | your-app-password |
| `GOOGLE_CLIENT_ID`   | Google OAuth client ID                           | your-google-client-id |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret                   | your-google-client-secret |
| `GOOGLE_REDIRECT_URL` | Google OAuth redirect URL                       | http://localhost:5000/auth/google/callback |

**Pro Tip**: Never commit your `.env` file to version control. Keep those secrets safe!

## 🚀 Installation & Setup

Ready to launch? Let's get you up and running in no time. Follow these steps, and you'll be authenticated and blogging in minutes!

### Prerequisites
- **Node.js** (v16 or higher) – Grab it from [nodejs.org](https://nodejs.org/)
- **MongoDB** – Local install or use [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud goodness
- **Git** – For cloning this repo

### Step-by-Step Installation
1. **Clone the Repository**  
   Open your terminal and run:
   ```
   git clone https://github.com/your-username/secured-blog-system.git
   cd secured-blog-system
   ```

2. **Install Dependencies**  
   Let npm work its magic:
   ```
   npm install
   ```

3. **Set Up Environment**  
   Copy the `.env` template and fill in your values:
   ```
   cp .env.example .env  # If you have an example file
   # Or create .env manually with the variables above
   ```

4. **Build the Project**  
   Compile TypeScript to JavaScript:
   ```
   npm run build
   ```

5. **Start the Server**  
   For development (with hot reload):
   ```
   npm run dev
   ```
   For production:
   ```
   npm start
   ```

6. **Verify It's Working**  
   Hit `http://localhost:5000` (or your configured port) and check the logs. You should see "Server is listening to port 5000" – success! 🎉

### API Endpoints Overview
Here's a quick peek at the main routes:

| Method | Endpoint              | Description                  | Access |
|--------|-----------------------|------------------------------|--------|
| POST   | `/auth/register`     | Register a new user          | Public |
| POST   | `/auth/login`        | Log in user                  | Public |
| GET    | `/auth/verify-email` | Verify email                 | Public |
| POST   | `/auth/logout`       | Log out user                 | Auth   |
| POST   | `/auth/refresh`      | Refresh access token         | Auth   |
| POST   | `/auth/forgot-password` | Request password reset    | Public |
| POST   | `/auth/reset-password` | Reset password             | Public |
| GET    | `/auth/google`       | Start Google OAuth           | Public |
| GET    | `/auth/google/callback` | Google OAuth callback     | Public |
| GET    | `/user/profile`      | Get user profile             | Auth   |
| GET    | `/user/blogs`        | Fetch all blogs              | Auth   |
| POST   | `/admin/post`        | Create a blog post           | Admin  |
| DELETE | `/admin/delete/:id`  | Delete a blog post           | Admin  |

**Note**: Auth-required endpoints need a valid JWT token in the Authorization header.

## 🤝 Contributing

Love this project? Want to make it even better? We'd love your help! Fork the repo, create a feature branch, and submit a pull request. Let's build something amazing together.

## 📄 License

This project is licensed under the ISC License – feel free to use it for your own adventures!

---

Built with ❤️ and a lot of ☕. Happy coding!
