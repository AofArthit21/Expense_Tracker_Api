# 💰 Expense Tracker API

A comprehensive RESTful API for expense tracking with user authentication, CRUD operations, and detailed reporting features built with TypeScript, Express.js, and MongoDB.


## 🚀 Features

### 👤 User Management
- ✅ User registration and authentication
- ✅ JWT-based secure authentication
- ✅ Password hashing with bcrypt
- ✅ User profile management
- ✅ Password change functionality

### 💸 Expense Management
- ✅ Create, read, update, delete expenses
- ✅ Expense categorization (Food, Transportation, Entertainment, etc.)
- ✅ Date-based filtering
- ✅ Pagination support
- ✅ User-specific expense isolation
- ✅ Search functionality

### 📊 Reporting & Analytics
- ✅ Expenses grouped by category
- ✅ Monthly and yearly reports
- ✅ Expense trends analysis
- ✅ Statistical summaries
- ✅ Date range filtering

### 🔧 Technical Features
- ✅ Input validation with Joi
- ✅ Error handling middleware
- ✅ Rate limiting
- ✅ CORS support
- ✅ Comprehensive logging
- ✅ Unit and integration tests
- ✅ Docker support
- ✅ Health check endpoint

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 18+ |
| **Language** | TypeScript |
| **Framework** | Express.js |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JWT + bcrypt |
| **Validation** | Joi |
| **Testing** | Jest + Supertest |
| **Containerization** | Docker |
| **Documentation** | Postman |

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)
- **Docker** (optional) - [Download here](https://www.docker.com/)

### Verify Installation


node --version    # Should show v18.x.x or higher
npm --version     # Should show 8.x.x or higher
mongod --version  # Should show v5.x.x or higher
git --version     # Should show git version


## 🚀 Quick Start

### 1. Clone the Repository

git clone https://github.com/AofArthit21/Expense_Tracker_Api
cd expense-tracker-api


### 2. Install Dependencies

npm install


### 3. Environment Setup

Create a `.env` file in the root directory:


cp .env.example .env


Update the `.env` file with your configurations:


# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/expense_tracker

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Test Database
MONGODB_TEST_URI=mongodb://localhost:27017/expense_tracker_test


### 4. Database Setup

#### Option A: Local MongoDB


# Start MongoDB service
# On macOS with Homebrew:
brew services start mongodb-community

# On Windows:
net start MongoDB



#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env` file

### 5. Build and Run

#### Development Mode


# Start development server with hot reload
npm run dev


The API will be available at: `http://localhost:3000`

#### Production Mode


# Build the project
npm run build

# Start production server
npm start


#### Using Docker


# Build and run with Docker Compose
docker-compose up --build

# Or run in detached mode
docker-compose up -d


## 🧪 Testing

### Run All Tests

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage



### Run Specific Tests

# Run only authentication tests
npm test -- --testPathPattern=auth.test.ts

# Run only expense tests
npm test -- --testPathPattern=expenses.test.ts


### Test Results

The test suite includes:
- ✅ Authentication endpoints (register, login, profile)
- ✅ Expense CRUD operations
- ✅ Report generation
- ✅ Input validation
- ✅ Error handling
- ✅ Authorization checks


## 🔗 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| PUT | `/api/auth/profile` | Update user profile | ✅ |

### Expenses

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/expenses` | Get all expenses (paginated) | ✅ |
| POST | `/api/expenses` | Create new expense | ✅ |
| GET | `/api/expenses/:id` | Get specific expense | ✅ |
| PUT | `/api/expenses/:id` | Update expense | ✅ |
| DELETE | `/api/expenses/:id` | Delete expense | ✅ |
| GET | `/api/expenses/stats` | Get expense statistics | ✅ |

### Reports

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reports/category` | Expenses by category | ✅ |
| GET | `/api/reports/monthly` | Monthly report | ✅ |
| GET | `/api/reports/trends` | Expense trends | ✅ |
| GET | `/api/reports/summary` | Comprehensive summary | ✅ |

### Health Check

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | API health status | ❌ |


## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run all tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |


## 🔒 Security Features

### Authentication & Authorization
- JWT-based authentication
- Password hashing with bcrypt (12 salt rounds)
- Protected routes with middleware
- User-specific data isolation

### Input Validation
- Joi schema validation for all inputs
- SQL injection prevention
- XSS protection with helmet
- Rate limiting (100 requests per 15 minutes)

### Data Security
- Environment variable protection
- Secure HTTP headers
- CORS configuration
- Error message sanitization

## 📊 Data Models

### User Model

{
  name: string;        // User's full name
  email: string;       // Unique email address
  password: string;    // Hashed password
  createdAt: Date;     // Registration date
  updatedAt: Date;     // Last update date
}


### Expense Model

{
  title: string;       // Expense description
  amount: number;      // Expense amount (max: 1,000,000)
  date: Date;         // Expense date (cannot be future)
  category: string;   // Expense category (enum)
  notes?: string;     // Optional notes (max: 500 chars)
  userId: ObjectId;   // Reference to user
  createdAt: Date;    // Creation timestamp
  updatedAt: Date;    // Last update timestamp
}

### Expense Categories
- Food
- Transportation
- Entertainment
- Healthcare
- Shopping
- Utilities
- Education
- Travel
- Other

## 🚨 Error Handling

The API provides consistent error responses:

### Error Response Format

{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

