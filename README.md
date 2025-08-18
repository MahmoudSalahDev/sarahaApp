# 📩 Saraha App API

A backend service inspired by **Sarahah** that allows users to send and receive anonymous messages.  
Built with **Node.js, Express, MongoDB**, and integrations like **Cloudinary** and **Nodemailer**.

---

## 🚀 Features

### 👤 User Management
- **Signup & Verification**
  - Register new users with email confirmation.
  - Resend verification code if needed.
- **Authentication**
  - Login with email/password or Gmail.
  - Refresh tokens for continued access.
  - Secure logout functionality.
- **Profile Management**
  - View own profile or any public user’s profile.
  - Update profile details and profile image.
  - Freeze or unfreeze account.
- **Password Management**
  - Update password securely.
  - Forget/Reset password flow with token support.

### 💬 Messaging
- **Send Messages**
  - Create anonymous messages to other users.
- **View Messages**
  - Retrieve all received messages.
  - Get a specific message by ID.

---

## 🛠 Tech Stack

- **Backend Framework:** Express.js  
- **Database:** MongoDB with Mongoose  

**Authentication & Security:**  
- bcrypt – password hashing  
- jsonwebtoken – token-based authentication  
- helmet – secure HTTP headers  
- express-rate-limit – request rate limiting  

**Utilities & Tools:**  
- multer – file uploads  
- cloudinary – media storage  
- nodemailer – email service  
- node-cron – task scheduling  
- joi – input validation  
- dotenv – environment variables  
- chalk, morgan – logging/debugging  

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/MahmoudSalahDev/sarahaApp.git
cd sarahaApp

### 2. Install dependencies:

npm install

### 3. Create a .env file in the root directory with the following variables:

PORT=
DB_URL ="mongodb://127.0.0.1:27017/sarahaApp"
SALT_ROUNDS = "12"
SECRET_KEY = 
SIGNATURE = 
ACCESS_TOKEN_USER = 
ACCESS_TOKEN_ADMIN = 
REFRESH_TOKEN_USER = 
REFRESH_TOKEN_ADMIN = 
EMAIL = 
PASS = 
WEB_CLIENT_ID = 
FRONT_ORIGIN=
API_KEY= 
api_secret= 
cloud_name= 

put a value to each one of them


### 4. Run the development server:
npm run dev


-------------------------------------------------------
📖 API Reference

Full API documentation is available here:
👉 https://documenter.getpostman.com/view/39713502/2sB34kEegL

--------------------------------------------------------
