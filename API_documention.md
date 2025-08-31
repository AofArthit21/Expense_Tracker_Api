# 📚 Expense Tracker API Documentation

Comprehensive API documentation for the Expense Tracker RESTful API built with TypeScript, Express.js, and MongoDB.


## 🌐 API Overview

The Expense Tracker API provides endpoints for:
- **User Management**: Registration, authentication, and profile management
- **Expense Management**: Full CRUD operations for expenses
- **Reporting**: Advanced analytics and reporting features
- **Health Monitoring**: System status and health checks

**Version**: 1.0.0  
**Protocol**: HTTP/HTTPS  
**Format**: JSON  
**Authentication**: JWT Bearer Token

## 🔐 Authentication

The API uses **JWT (JSON Web Token)** for authentication. Include the token in the Authorization header:


Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...


### Token Lifecycle
- **Expires**: 7 days (configurable)
- **Refresh**: Re-login required after expiration
- **Storage**: Store securely on client-side

## 🌍 Base URL

Local Development: http://localhost:3000/api
Production: https://your-domain.com/api


## 📄 Response Format

### Successful Response

{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}


### Error Response

{
  "success": false,
  "message": "Error description",
  "errors": [
    "Detailed error message 1",
    "Detailed error message 2"
  ]
}


### Paginated Response

{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}


## ⚠️ Error Handling

### Common Error Types

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request data or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Validation Errors

{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Name is required",
    "Email must be a valid email address",
    "Password must be at least 6 characters long"
  ]
}


## 🚫 Rate Limiting

- **Limit**: 100 requests per 15-minute window per IP
- **Headers**: 
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time (Unix timestamp)

---

# 🔐 Authentication Endpoints

## Register User

Create a new user account.

**Endpoint**: `POST /auth/register`  
**Authentication**: Not required

### Request Body

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}


### Validation Rules
- **name**: Required, 2-50 characters
- **email**: Required, valid email format, unique
- **password**: Required, minimum 6 characters, must contain uppercase, lowercase, and number

### Response `201 Created`

{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64a7b8c9d1e2f3g4h5i6j7k8",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2024-08-28T10:30:00.000Z"
    }
  }
}


### Error Responses

// 400 - Email already exists
{
  "success": false,
  "message": "User with this email already exists"
}

// 400 - Validation error
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  ]
}


---

## Login User

Authenticate user and receive JWT token.

**Endpoint**: `POST /auth/login`  
**Authentication**: Not required

### Request Body

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}


### Response `200 OK`

{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64a7b8c9d1e2f3g4h5i6j7k8",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2024-08-28T10:30:00.000Z"
    }
  }
}


### Error Responses

// 401 - Invalid credentials
{
  "success": false,
  "message": "Invalid email or password"
}


---

## Get User Profile

Retrieve current user's profile information.

**Endpoint**: `GET /auth/profile`  
**Authentication**: Required

### Headers

Authorization: Bearer <jwt_token>


### Response `200 OK`

{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "64a7b8c9d1e2f3g4h5i6j7k8",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "createdAt": "2024-08-28T10:30:00.000Z",
      "updatedAt": "2024-08-28T10:30:00.000Z"
    }
  }
}


---

## Update User Profile

Update user's profile information.

**Endpoint**: `PUT /auth/profile`  
**Authentication**: Required

### Request Body

{
  "name": "John Doe Updated"
}


### Response `200 OK`

{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "64a7b8c9d1e2f3g4h5i6j7k8",
      "name": "John Doe Updated",
      "email": "john.doe@example.com",
      "updatedAt": "2024-08-28T11:30:00.000Z"
    }
  }
}


---

# 💸 Expense Endpoints

## Create Expense

Create a new expense record.

**Endpoint**: `POST /expenses`  
**Authentication**: Required

### Request Body

{
  "title": "Grocery Shopping",
  "amount": 150.75,
  "date": "2024-08-28",
  "category": "Food",
  "notes": "Weekly grocery shopping at SuperMart"
}


### Validation Rules
- **title**: Required, 1-100 characters
- **amount**: Required, positive number, max 1,000,000, up to 2 decimal places
- **date**: Required, valid date, cannot be in the future
- **category**: Required, must be one of predefined categories
- **notes**: Optional, max 500 characters

### Categories
`Food`, `Transportation`, `Entertainment`, `Healthcare`, `Shopping`, `Utilities`, `Education`, `Travel`, `Other`

### Response `201 Created`

{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "expense": {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
      "title": "Grocery Shopping",
      "amount": 150.75,
      "date": "2024-08-28T00:00:00.000Z",
      "category": "Food",
      "notes": "Weekly grocery shopping at SuperMart",
      "userId": "64a7b8c9d1e2f3g4h5i6j7k8",
      "createdAt": "2024-08-28T10:30:00.000Z",
      "updatedAt": "2024-08-28T10:30:00.000Z"
    }
  }
}


---

## Get All Expenses

Retrieve user's expenses with filtering and pagination.

**Endpoint**: `GET /expenses`  
**Authentication**: Required

### Query Parameters
| Parameter | Type | Description | Default | Example |
|-----------|------|-------------|---------|---------|
| `page` | integer | Page number (min: 1) | 1 | `?page=2` |
| `limit` | integer | Items per page (1-100) | 10 | `?limit=20` |
| `category` | string | Filter by category | - | `?category=Food` |
| `startDate` | date | Start date filter (YYYY-MM-DD) | - | `?startDate=2024-08-01` |
| `endDate` | date | End date filter (YYYY-MM-DD) | - | `?endDate=2024-08-31` |

### Example Requests

GET /expenses
GET /expenses?page=1&limit=10
GET /expenses?category=Food
GET /expenses?startDate=2024-08-01&endDate=2024-08-31
GET /expenses?category=Food&startDate=2024-08-01&limit=5


### Response `200 OK`

{
  "success": true,
  "message": "Expenses retrieved successfully",
  "data": {
    "expenses": [
      {
        "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
        "title": "Grocery Shopping",
        "amount": 150.75,
        "date": "2024-08-28T00:00:00.000Z",
        "category": "Food",
        "notes": "Weekly grocery shopping",
        "createdAt": "2024-08-28T10:30:00.000Z"
      },
      {
        "_id": "64a7b8c9d1e2f3g4h5i6j7ka",
        "title": "Gas Station",
        "amount": 45.00,
        "date": "2024-08-27T00:00:00.000Z",
        "category": "Transportation",
        "notes": "Fuel for car",
        "createdAt": "2024-08-27T15:20:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25,
      "limit": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}


---

## Get Expense by ID

Retrieve a specific expense by its ID.

**Endpoint**: `GET /expenses/:id`  
**Authentication**: Required

### Parameters
- `id`: MongoDB ObjectId of the expense

### Response `200 OK`

{
  "success": true,
  "message": "Expense retrieved successfully",
  "data": {
    "expense": {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
      "title": "Grocery Shopping",
      "amount": 150.75,
      "date": "2024-08-28T00:00:00.000Z",
      "category": "Food",
      "notes": "Weekly grocery shopping at SuperMart",
      "userId": "64a7b8c9d1e2f3g4h5i6j7k8",
      "createdAt": "2024-08-28T10:30:00.000Z",
      "updatedAt": "2024-08-28T10:30:00.000Z"
    }
  }
}


### Error Responses

// 404 - Expense not found
{
  "success": false,
  "message": "Expense not found"
}

// 404 - Invalid ID format
{
  "success": false,
  "message": "Invalid ID"
}


---

## Update Expense

Update an existing expense.

**Endpoint**: `PUT /expenses/:id`  
**Authentication**: Required

### Request Body

{
  "title": "Updated Grocery Shopping",
  "amount": 175.50,
  "notes": "Monthly grocery shopping at SuperMart"
}


### Notes
- All fields are optional
- At least one field must be provided
- Same validation rules as create expense apply

### Response `200 OK`

{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "expense": {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
      "title": "Updated Grocery Shopping",
      "amount": 175.50,
      "date": "2024-08-28T00:00:00.000Z",
      "category": "Food",
      "notes": "Monthly grocery shopping at SuperMart",
      "userId": "64a7b8c9d1e2f3g4h5i6j7k8",
      "createdAt": "2024-08-28T10:30:00.000Z",
      "updatedAt": "2024-08-28T12:30:00.000Z"
    }
  }
}


---

## Delete Expense

Delete an expense record.

**Endpoint**: `DELETE /expenses/:id`  
**Authentication**: Required

### Response `200 OK`

{
  "success": true,
  "message": "Expense deleted successfully",
  "data": {
    "expense": {
      "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
      "title": "Grocery Shopping",
      "amount": 150.75,
      "date": "2024-08-28T00:00:00.000Z",
      "category": "Food",
      "notes": "Weekly grocery shopping",
      "userId": "64a7b8c9d1e2f3g4h5i6j7k8"
    }
  }
}


---

## Get Expense Statistics

Retrieve expense statistics for current month and all-time.

**Endpoint**: `GET /expenses/stats`  
**Authentication**: Required

### Response `200 OK`

{
  "success": true,
  "message": "Expense statistics retrieved successfully",
  "data": {
    "currentMonth": {
      "totalAmount": 1250.75,
      "totalCount": 15,
      "avgAmount": 83.38
    },
    "allTime": {
      "totalAmount": 15680.50,
      "totalCount": 186,
      "avgAmount": 84.30
    }
  }
}


---

# 📊 Report Endpoints

## Category Report

Generate expense breakdown by category for a specific date range.

**Endpoint**: `GET /reports/category`  
**Authentication**: Required

### Query Parameters (Required)
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `startDate` | date | Start date (YYYY-MM-DD) | `2024-08-01` |
| `endDate` | date | End date (YYYY-MM-DD) | `2024-08-31` |

### Example Request

GET /reports/category?startDate=2024-08-01&endDate=2024-08-31


### Response `200 OK`

{
  "success": true,
  "message": "Category report generated successfully",
  "data": {
    "dateRange": {
      "startDate": "2024-08-01",
      "endDate": "2024-08-31"
    },
    "summary": {
      "grandTotal": 2450.75,
      "totalCount": 28,
      "avgExpense": 87.53,
      "categoriesCount": 6
    },
    "categoryBreakdown": [
      {
        "category": "Food",
        "totalAmount": 850.50,
        "count": 12,
        "avgAmount": 70.88,
        "percentage": 34.71
      },
      {
        "category": "Transportation",
        "totalAmount": 420.25,
        "count": 8,
        "avgAmount": 52.53,
        "percentage": 17.15
      },
      {
        "category": "Entertainment",
        "totalAmount": 350.00,
        "count": 5,
        "avgAmount": 70.00,
        "percentage": 14.28
      },
      {
        "category": "Shopping",
        "totalAmount": 530.00,
        "count": 2,
        "avgAmount": 265.00,
        "percentage": 21.63
      },
      {
        "category": "Healthcare",
        "totalAmount": 200.00,
        "count": 1,
        "avgAmount": 200.00,
        "percentage": 8.16
      },
      {
        "category": "Utilities",
        "totalAmount": 100.00,
        "count": 1,
        "avgAmount": 100.00,
        "percentage": 4.08
      }
    ]
  }
}


---

## Monthly Report

Generate monthly expense report for a specific year.

**Endpoint**: `GET /reports/monthly`  
**Authentication**: Required

### Query Parameters
| Parameter | Type | Description | Default | Example |
|-----------|------|-------------|---------|---------|
| `year` | integer | Year for report | Current year | `?year=2024` |

### Response `200 OK`

{
  "success": true,
  "message": "Monthly report generated successfully",
  "data": {
    "year": 2024,
    "summary": {
      "yearlyTotal": 18650.75,
      "yearlyCount": 180,
      "monthlyAverage": 1554.23,
      "activeMonths": 8
    },
    "monthlyBreakdown": [
      {
        "month": 1,
        "monthName": "January",
        "totalAmount": 1250.50,
        "count": 15,
        "avgAmount": 83.37
      },
      {
        "month": 2,
        "monthName": "February",
        "totalAmount": 1880.25,
        "count": 22,
        "avgAmount": 85.46
      },
      {
        "month": 3,
        "monthName": "March",
        "totalAmount": 0,
        "count": 0,
        "avgAmount": 0
      }
    ]
  }
}


---

## Expense Trends

Get expense trends over a specified time period.

**Endpoint**: `GET /reports/trends`  
**Authentication**: Required

### Query Parameters
| Parameter | Type | Description | Default | Example |
|-----------|------|-------------|---------|---------|
| `days` | integer | Number of days to analyze | 30 | `?days=60` |

### Response `200 OK`

{
  "success": true,
  "message": "Expense trends retrieved successfully",
  "data": {
    "period": {
      "days": 30,
      "startDate": "2024-07-29T00:00:00.000Z",
      "endDate": "2024-08-28T00:00:00.000Z"
    },
    "summary": {
      "periodTotal": 2450.75,
      "periodCount": 28,
      "dailyAverage": 81.69,
      "activeDays": 18
    },
    "dailyTrends": [
      {
        "date": "2024-08-01T00:00:00.000Z",
        "totalAmount": 125.50,
        "count": 2
      },
      {
        "date": "2024-08-02T00:00:00.000Z",
        "totalAmount": 85.25,
        "count": 1
      }
    ],
    "topCategories": [
      {
        "category": "Food",
        "totalAmount": 850.50,
        "count": 12
      },
      {
        "category": "Transportation",
        "totalAmount": 420.25,
        "count": 8
      }
    ]
  }
}


---

## Expense Summary

Get comprehensive expense summary and statistics.

**Endpoint**: `GET /reports/summary`  
**Authentication**: Required

### Response `200 OK`

{
  "success": true,
  "message": "Expense summary retrieved successfully",
  "data": {
    "overview": {
      "totalExpenses": 18650.75,
      "totalCount": 186,
      "averageExpense": 100.27,
      "minExpense": 5.50,
      "maxExpense": 1250.00
    },
    "currentMonth": {
      "totalAmount": 2450.75,
      "count": 28
    },
    "topCategories": [
      {
        "category": "Food",
        "totalAmount": 6850.50,
        "count": 85
      },
      {
        "category": "Transportation",
        "totalAmount": 4200.25,
        "count": 45
      },
      {
        "category": "Entertainment",
        "totalAmount": 3500.00,
        "count": 28
      }
    ],
    "recentExpenses": [
      {
        "_id": "64a7b8c9d1e2f3g4h5i6j7k9",
        "title": "Grocery Shopping",
        "amount": 150.75,
        "date": "2024-08-28T00:00:00.000Z",
        "category": "Food"
      }
    ]
  }
}


---

# 🏥 Health Check

## API Health Status

Check the health and status of the API.

**Endpoint**: `GET /health`  
**Authentication**: Not required

### Response `200 OK`

{
  "status": "OK",
  "timestamp": "2024-08-28T10:30:00.000Z",
  "uptime": 1234.56,
  "environment": "development"
}


---

# 📊 Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

# 📋 Data Models

## User Model


interface User {
  _id: ObjectId;
  name: string;        // 2-50 characters
  email: string;       // Valid email, unique
  password: string;    // Hashed with bcrypt
  createdAt: Date;
  updatedAt: Date;
}


## Expense Model

interface Expense {
  _id: ObjectId;
  title: string;       // 1-100 characters
  amount: number;      // 0.01 - 1,000,000, 2 decimal places
  date: Date;         // Cannot be in future
  category: ExpenseCategory;
  notes?: string;     // Optional, max 500 characters
  userId: ObjectId;   // Reference to User
  createdAt: Date;
  updatedAt: Date;
}

enum ExpenseCategory {
  FOOD = 'Food',
  TRANSPORTATION = 'Transportation',
  ENTERTAINMENT = 'Entertainment',
  HEALTHCARE = 'Healthcare',
  SHOPPING = 'Shopping',
  UTILITIES = 'Utilities',
  EDUCATION = 'Education',
  TRAVEL = 'Travel',
  OTHER = 'Other'
}


---
