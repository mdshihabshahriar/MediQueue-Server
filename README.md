# 🚀 MediQueue Server

Backend API for the MediQueue Tutor Booking Platform.

## 🌐 Live API

https://your-server-url.onrender.com

---

## 📖 Project Overview

MediQueue Server provides secure RESTful APIs for managing tutors, tutor bookings, authentication verification, and user-specific resources. The server handles tutor management, session booking, slot tracking, booking cancellation, and JWT-protected routes.

---

## ✨ Features

* JWT Authentication & Authorization
* Google Authentication Support
* Tutor CRUD Operations
* Session Booking System
* Automatic Slot Management
* Booking Cancellation with Slot Restoration
* User-Specific Tutor Management
* User-Specific Booking Management
* MongoDB Atlas Integration
* CORS Configuration
* Protected Routes using JOSE JWT Verification
* RESTful API Architecture

---

## 🛠️ Technologies Used

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* JOSE (JWT Verification)
* dotenv
* cors

---

## 📂 API Endpoints

### Public Routes

#### Get All Tutors

```http
GET /tutors
```

Supports:

* Tutor name search using regex
* Date range filtering

#### Get Featured Tutors

```http
GET /featured
```

Returns 6 featured tutors.

---

### Protected Routes

#### Get Tutor Details

```http
GET /tutors/:id
```

#### Create Tutor

```http
POST /tutors
```

#### Get My Tutors

```http
GET /my-tutors
```

#### Update Tutor

```http
PATCH /tutors/:id
```

#### Delete Tutor

```http
DELETE /tutors/:id
```

#### Create Booking

```http
POST /bookings
```

#### Get My Bookings

```http
GET /my-bookings
```

#### Cancel Booking

```http
DELETE /bookings/:id
```

---

## 🎯 Business Logic

### Tutor Booking Rules

* A student cannot book the same tutor twice.
* Booking is blocked if total slots are unavailable.
* Successful booking automatically decreases available slots.
* Cancelling a booking automatically restores one slot.

### Tutor Management

* Users can create tutors.
* Users can update their tutor information.
* Users can delete tutor profiles.

---

## 🔐 Authentication

Protected routes require:

```http
Authorization: Bearer <token>
```

JWT tokens are verified using JOSE and Better Auth public JWKS endpoint.

---

## 🗄️ Database Collections

### tutors

Stores tutor information:

* tutorName
* subjects
* availability
* totalSlot
* hourlyFee
* sessionDate
* createdBy
* createdAt

### bookings

Stores booking information:

* tutorId
* tutorName
* userId
* studentName
* studentEmail
* phone
* status

---

## ⚙️ Environment Variables

Create a `.env` file and configure the following variables:

```env
PORT=5001

MONGODB_URI=your_mongodb_connection_string

BETTER_AUTH_SECRET=your_secret

BETTER_AUTH_URL=https://your-client-url.vercel.app

CLIENT_URL=https://your-client-url.vercel.app

GOOGLE_CLIENTID=your_google_client_id

GOOGLE_SECRET=your_google_client_secret
```

---

## 🚀 Installation

### Clone Repository

```bash
git clone https://github.com/your-username/mediqueue-server.git
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

### Start Production Server

```bash
npm start
```

---

## 📌 Core Functionalities

* Tutor Management
* Booking Management
* JWT Authentication
* Protected API Routes
* Search & Filtering
* Slot Availability Tracking
* Booking Cancellation Workflow

---

## 👨‍💻 Developer

**MD. Shihab Shahriar**

BSc in Computer Science & Engineering

Passionate about Full Stack Web Development, Software Engineering, and Building Scalable Applications.

---

⭐ If you find this project useful, consider giving it a star on GitHub.
