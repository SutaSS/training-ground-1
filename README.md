# 📚 Library Management System

A modern, full-stack library management system with real-time notifications, comprehensive loan tracking, fine management, and role-based access control.

---

## 🛠️ Tech Stack

### **Backend**
- **Runtime**: Node.js with Express.js 5.x
- **Database**: PostgreSQL(Supabase) with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.IO
- **Password Hashing**: bcrypt
- **Database Adapter**: `@prisma/adapter-pg`

### **Frontend**
- **Framework**: React 19.x
- **Build Tool**: Vite 7.x
- **Routing**: React Router DOM v7
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Notifications**: React Hot Toast
- **Real-time**: Socket.IO Client

### **Development Tools**
- **Linting**: ESLint 9.x
- **CSS Processing**: PostCSS & Autoprefixer
- **Dev Server**: Nodemon (backend), Vite (frontend)

### **Deployment**
- **Platform**: Render.com
- **Database Hosting**: Supabase (PostgreSQL)

---

## ✨ Key Features

### **User Features**
- 🔐 **Authentication & Authorization**: User registration, login with JWT, and role-based access control
- 📖 **Book Browsing**: Search and filter books by category, author, and availability
- 📚 **Loan Management**: Borrow books, track due dates, renew loans, and view history
- 💰 **Fine Tracking**: View unpaid fines, make payments, and track penalty history
- 🔔 **Real-time Notifications**: WebSocket-based instant notifications for loans, due dates, and fines
- 👤 **Profile Management**: Update personal information and view account activity

### **Admin Features**
- 📊 **Dashboard**: System statistics, analytics, and activity monitoring
- 📕 **Book Management**: Add, edit, delete books and manage inventory
- 📋 **Loan Administration**: View all loans, process returns, extend periods, and mark lost items
- 💵 **Fine Administration**: Generate fines, process payments, and waive penalties
- 👥 **User Management**: View users, block/unblock accounts, and monitor activity

---

## 🏗️ Project Structure

```
library-management/
├── client/                     # React frontend application
│   ├── src/
│   │   ├── api/               # Axios HTTP client configuration
│   │   ├── components/        # Reusable React components
│   │   │   ├── book/         # Book-related components
│   │   │   ├── common/       # Common UI components (Button, Input, Modal)
│   │   │   └── layout/       # Layout components (Navbar, Footer, Sidebar)
│   │   ├── pages/            # Page components
│   │   │   ├── admin/        # Admin pages (Dashboard, ManageBooks, etc.)
│   │   │   ├── auth/         # Auth pages (Login, Register)
│   │   │   └── user/         # User pages (Books, MyLoans, Profile)
│   │   ├── store/            # Zustand state management stores
│   │   └── utils/            # Utility functions (Socket.IO manager)
│   └── dist/                 # Production build output
│
├── server/                    # Express backend application
│   ├── src/
│   │   ├── config/           # Configuration (environment, Prisma)
│   │   ├── controllers/      # Route controllers
│   │   ├── middlewares/      # Authentication & error handling
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Business logic layer
│   │   └── utils/            # Socket.IO manager
│   └── prisma/
│       ├── schema.prisma     # Database schema definition
│       ├── migrations/       # Database migration files
│       └── seed.js           # Database seeding script
│
├── DEPLOYMENT.md             # Deployment guide
├── ERD.MD                    # Entity Relationship Diagram
├── DBdiagram.MD              # Database diagram documentation
├── System.MD                 # System documentation
└── render.yaml               # Render.com configuration
```

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd library-management
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment Variables**
   
   Create `server/.env`:
   ```env
   NODE_ENV=development
   PORT=4000
   DATABASE_URL=postgresql://user:password@localhost:5432/library_db
   DIRECT_URL=postgresql://user:password@localhost:5432/library_db
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   npx prisma migrate dev
   
   # Seed database with sample data
   npm run seed
   ```

5. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

6. **Configure Client Environment**
   
   Create `client/.env.development`:
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```

### **Running the Application**

1. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:4000`

2. **Start Frontend Development Server**
   ```bash
   cd client
   npm run dev
   ```
   Client runs on `http://localhost:5173`

### **Default Credentials**
After seeding the database:
```
Admin Account:
Email: admin@library.com
Password: admin123

Test User:
Email: user@library.com
Password: user123
```

---

## 📡 API Endpoints

### **Authentication** (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |

### **Books** (`/api/books`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all books | Required |
| GET | `/:id` | Get book details | Required |
| POST | `/` | Add new book | Admin |
| PUT | `/:id` | Update book | Admin |
| DELETE | `/:id` | Delete book | Admin |

### **Loans** (`/api/loans`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/borrow` | Borrow a book | Required |
| POST | `/:id/return` | Return a book | Required |
| POST | `/:id/renew` | Renew loan | Required |
| GET | `/my-loans` | Get user's loans | Required |
| GET | `/:id` | Get loan details | Required |
| GET | `/` | Get all loans | Admin |

### **Fines** (`/api/fines`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/my-fines` | Get user's fines | Required |
| POST | `/:id/pay` | Pay a fine | Required |
| GET | `/:id` | Get fine details | Required |
| GET | `/` | Get all fines | Admin |

### **Notifications** (`/api/notifications`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get notifications | Required |
| POST | `/:id/read` | Mark as read | Required |
| DELETE | `/:id` | Delete notification | Required |

### **Profile** (`/api/profile`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get user profile | Required |
| PUT | `/` | Update profile | Required |

---

## 🔐 Security Features

1. **Authentication**
   - JWT token-based authentication
   - Token expiration (configurable, default: 7 days)
   - Secure password hashing with bcrypt (10 rounds)

2. **Authorization**
   - Role-based access control (USER/ADMIN)
   - Protected routes with middleware
   - User-specific data access control

3. **Data Protection**
   - Environment variables for sensitive data
   - CORS configuration
   - SQL injection prevention via Prisma ORM
   - XSS protection

---

## 🔄 Real-time Features

### **WebSocket Implementation**
- Socket.IO for bidirectional communication
- Token-based socket authentication
- Automatic reconnection on auth state changes

### **Real-time Notifications**
- New loan created
- Loan due date reminders (24 hours before)
- Overdue loan alerts
- New fine notifications
- Fine payment confirmations

---

## 📊 Database Schema

### **Core Entities**
- **User**: User accounts with authentication
- **Profile**: User profile information
- **Book**: Book catalog with ISBN, title, author, etc.
- **BookCopy**: Physical book copies with availability status
- **Loan**: Borrowing records with due dates
- **Fine**: Penalty records for overdue/lost books
- **Notification**: User notifications with read status

### **Relationships**
- User → Profile (One-to-One)
- User → Loans (One-to-Many)
- User → Fines (One-to-Many)
- User → Notifications (One-to-Many)
- Book → BookCopies (One-to-Many)
- BookCopy → Loans (One-to-Many)
- Loan → Fines (One-to-Many)

For detailed schema, see `prisma/schema.prisma`

---

## 🧪 Development Scripts

### **Backend**
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run seed         # Seed database with sample data
npx prisma studio    # Open Prisma Studio GUI
npx prisma migrate dev  # Run database migrations
```

### **Frontend**
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 📦 Production Deployment

### **Build for Production**

1. **Build Frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Copy Build to Server**
   ```bash
   cp -r client/dist server/
   ```

3. **Generate Prisma Client**
   ```bash
   cd server
   npx prisma generate
   ```

4. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

5. **Start Server**
   ```bash
   npm start
   ```

### **Render.com Deployment**
The project includes `render.yaml` for easy deployment:
- Automatic build script
- Environment variable configuration
- PostgreSQL database setup
- Static file serving

See `DEPLOYMENT.md` for detailed instructions.

---

## 🎯 Business Rules

### **Loan Rules**
- Users cannot borrow if they have unpaid fines
- Books must be available (status: AVAILABLE)
- Default loan period: 14 days (configurable)
- Users can renew loans if no overdue penalties exist

### **Fine Calculation**
- Overdue fines: Calculated per day late
- Lost book fines: Book replacement cost
- Fines must be paid before new loans allowed

### **Notification Triggers**
- Loan created/returned
- Due date reminder (24 hours before)
- Overdue notification (daily)
- Fine created/paid

---

## 👥 User Roles & Permissions

| Feature | User | Admin |
|---------|------|-------|
| Browse Books | ✅ | ✅ |
| Borrow/Return Books | ✅ | ✅ |
| View Own Loans/Fines | ✅ | ✅ |
| Pay Fines | ✅ | ✅ |
| View All Loans/Fines | ❌ | ✅ |
| Manage Books | ❌ | ✅ |
| Manage Users | ❌ | ✅ |
| Waive Fines | ❌ | ✅ |
| System Dashboard | ❌ | ✅ |

---

## 🔧 Configuration

### **Environment Variables**

**Server** (`.env`):
```env
# Server Configuration
NODE_ENV=production|development
PORT=4000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_URL=postgresql://user:pass@host:5432/db

# Authentication
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:5173
```

**Client** (`.env.development`, `.env.production`):
```env
VITE_API_URL=http://localhost:4000/api
```

---

## 🐛 Troubleshooting

### **Common Issues**

1. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

2. **JWT Authentication Fails**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Clear browser local storage

3. **Socket.IO Not Connecting**
   - Verify CLIENT_URL in server .env
   - Check CORS configuration
   - Ensure both servers are running

4. **Prisma Migration Issues**
   ```bash
   npx prisma migrate reset  # Reset database
   npx prisma generate       # Regenerate client
   ```

---

## 📝 Code Style

### **Conventions**
- ESLint for code linting
- Camel case for variables and functions
- Pascal case for React components
- Descriptive naming conventions
- Comments for complex logic

### **Project Guidelines**
- Component-based architecture
- Service layer for business logic
- Separation of concerns
- RESTful API design
- Error handling at all levels

---

## 📄 Additional Documentation

- **System Architecture**: See `System.MD`
- **Database Design**: See `ERD.MD` and `DBdiagram.MD`
- **Deployment Guide**: See `DEPLOYMENT.md`
---
