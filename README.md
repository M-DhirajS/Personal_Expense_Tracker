# Personal Expense Tracker — MERN Stack Web Application

> **MCA MERN Stack Development Case Study Assignment**  
> A full-stack, responsive, financial dashboard designed to record, categorize, manage, and analyze daily expenses.

---

## 1. Project Overview

**Personal Expense Tracker** is a modern SaaS-style financial web application built using the complete **MERN Stack** (MongoDB, Express.js, React.js, Node.js). It provides users with an intuitive, interactive platform to monitor personal finances, visualize spending distributions across various categories, analyze historical spending trends, and manage expense records.

### Key Highlights:
- **Responsive Financial Dashboard**: 4 key statistical metric cards, Recharts monthly spending bar chart, category doughnut chart, and recent transaction entries.
- **Full CRUD Capabilities**: Add, view details, edit, and delete expense records backed by MongoDB.
- **Advanced Filtering & Sorting**: Real-time title search, category filter, payment method filter, date range filter (from/to), and sorting by amount or date.
- **Dynamic Calculated Statistics**: Filtered total spend calculations, daily average spending, and month-over-month comparisons calculated directly via MongoDB aggregation pipelines.
- **Built-in Demo Seeder**: One-click seeding of realistic sample data to immediately demonstrate rich charts and analytics to faculty/evaluators.
- **Toast Notifications & Modals**: Smooth user interactions with animated feedback and delete confirmation dialogs.

---

## 2. Technology Stack

### Frontend:
- **React.js (v19)** with **Vite** bundler
- **Vanilla CSS3** Design System (custom SaaS-style theme, responsive grid, glassmorphism, color badges)
- **React Hooks**: `useState`, `useEffect`, `useCallback`, `useContext`, `useMemo`
- **Axios**: HTTP client with request/response interceptors
- **Recharts**: Responsive Bar Charts, Doughnut/Pie Charts, and Area Charts
- **React Router DOM (v7)**: Client-side routing and navigation
- **Lucide React**: Clean, modern iconography

### Backend:
- **Node.js** (v24 LTS)
- **Express.js (v4)**: Modular REST API architecture
- **Mongoose (v8)**: Schema modeling and aggregation pipelines
- **dotenv**: Environment variable isolation
- **CORS Middleware**: Cross-Origin Resource Sharing
- **Morgan**: HTTP request logging

### Database:
- **MongoDB**: Database name `personal_expense_tracker`

---

## 3. Database Schema Design

### Collection: `expenses`

| Field | Type | Required | Description / Rules |
| :--- | :--- | :--- | :--- |
| `_id` | ObjectId | Auto | Primary key |
| `title` | String | Yes | Expense title, trimmed, max 100 characters |
| `amount` | Number | Yes | Positive numeric value (min 0.01) |
| `category` | String | Yes | Enum: Food, Transportation, Shopping, Education, Healthcare, Entertainment, Bills and Utilities, Rent, Travel, Other |
| `date` | Date | Yes | Transaction date (defaults to current date) |
| `paymentMethod` | String | Yes | Enum: Cash, UPI, Debit Card, Credit Card, Net Banking, Other |
| `description` | String | No | Optional notes/memo, max 500 characters |
| `createdAt` | Date | Auto | Mongoose timestamp |
| `updatedAt` | Date | Auto | Mongoose timestamp |

**Indexes**:
- `{ date: -1 }` (fast date sorting and range queries)
- `{ category: 1 }` (category-based aggregation and filtering)
- `{ paymentMethod: 1 }` (payment channel analytics)

---

## 4. REST API Documentation

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/expenses` | Get expenses (supports `search`, `category`, `paymentMethod`, `startDate`, `endDate`, `sortBy`, `order`) |
| `POST` | `/expenses` | Create a new expense record |
| `GET` | `/expenses/:id` | Get details for a single expense by ID |
| `PUT` | `/expenses/:id` | Update an existing expense record |
| `DELETE` | `/expenses/:id` | Delete an expense by ID |
| `GET` | `/expenses/stats/summary` | Summary stats (total spend, total count, highest category, daily avg, monthly trend, recent) |
| `GET` | `/expenses/stats/analytics` | In-depth analytics (monthly bar chart, doughnut distribution, daily trend, month comparison) |
| `POST` | `/expenses/seed` | Reset & seed realistic sample data for instant demonstration |
| `GET` | `/info` | System metadata (DB host, port, record count, supported enums) |
| `GET` | `/health` | API health check status |

---

## 5. Application Pages & Navigation

1. **Dashboard (`/`)**
   - 4 Stat Cards: Total Spending, Total Expense Count, Highest Spending Category, Average Daily Spending.
   - Monthly Spending Bar Chart (6-month historical trajectory).
   - Category Expense Doughnut Chart.
   - Category-wise breakdown list with color progress bars and percentages.
   - Recent 5 transactions with category badges and amounts.
2. **All Expenses (`/expenses`)**
   - Responsive data table.
   - Live title search, category filter, payment method filter, date range filter.
   - Sort by date or amount (ascending / descending).
   - Dynamic filtered total spend display.
   - View details modal, Edit modal, and Delete confirmation dialog.
3. **Add Expense (`/add-expense`)**
   - Structured form with client-side validation and character counters.
   - Immediate feedback with toast notifications upon saving to MongoDB.
4. **Edit Expense (`/edit-expense/:id`)**
   - Preloads existing record from database.
   - Validates changes and updates MongoDB.
5. **Expense Analytics (`/analytics`)**
   - Year and Month dropdown filter.
   - Annual monthly comparison bar chart.
   - Category-wise spending doughnut chart with legends.
   - Daily spending trajectory area chart.
   - Top 5 highest spending categories with rankings.
   - Month-over-month comparison card (% change vs previous month).
6. **Settings & Info (`/settings`)**
   - Academic case study details and technologies.
   - Live MongoDB connection diagnostics (host, port, database name, document count).
   - Supported categories and payment methods list.
   - Currency selector (₹ INR default, $ USD, € EUR, £ GBP).
   - "Seed Demo Data" and "Clear All Data" tools.

---

## 6. How to Run the Project Locally

### Prerequisites
- Node.js (v18+)
- MongoDB installed and running locally on port 27017 (or MongoDB Atlas connection string)

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # (Optional) Seed initial demo records
npm run dev      # Runs with nodemon on http://localhost:5000
# or: npm start
```

### 2. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev      # Runs Vite dev server on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser.
