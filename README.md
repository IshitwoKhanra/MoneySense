# MoneySense 💸
**Ishitwo Khanra 24BCE2975 - Web Programming Project**

MoneySense is a modern, responsive personal finance dashboard built with React. It helps users track their net worth, monitor monthly budgets, visualize spending habits, and securely manage their financial data all in one elegant interface.

## ✨ Features

* **Secure Authentication:** Protected routes ensure only authenticated users can access the dashboard.
* **Comprehensive Dashboard:** Real-time KPIs for Net Worth, Total Income, Monthly Savings, and Expenses.
* **Interactive Data Visualization:**
  * Dynamic Line Charts tracking Net Worth over time.
  * Doughnut Charts breaking down monthly expenses by category.
  * Bar Charts for all-time income vs. expense analytics.
* **Transaction Management:** Add new income/expenses and instantly see the impact on your net worth and budget.
* **Smart Budgets:** Set custom monthly limits for categories (Food, Housing, Transport, etc.) and track progress visually.
* **Advanced Reporting:** Filter and download transaction history as CSV files (This Month, Last 30 Days, Last Year, All Time).
* **Smart Notifications:** Automated pop-up toast alerts and a notification bell if your net worth dips or if you exceed a budget category.

## 🛠️ Tech Stack

* **Frontend Framework:** React 18
* **Build Tool:** Vite
* **Routing:** React Router v6 (`react-router-dom`)
* **Charts:** Chart.js with `react-chartjs-2`
* **Icons:** Lucide React (`lucide-react`)
* **Styling:** Custom Vanilla CSS (Flexbox, CSS Grid, CSS Variables)
* **State Management:** React Hooks (`useState`, `useEffect`, `useMemo`) + Local Storage

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/moneysense.git](https://github.com/yourusername/moneysense.git)
   cd moneysense
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` (or the port Vite provides in your terminal).

## 🔐 Demo Access

The application currently uses a mocked authentication flow for demonstration purposes. Use the following credentials to log in to the dashboard:

* **Email:** `ishitwo@moneysense.com`
* **Password:** `demo123`

*(Note: Data is saved locally in your browser's `localStorage`. If you wish to reset the demo data, clear your browser's local storage for the site and refresh the page.)*

## 📁 Folder Structure

```text
moneysense/
├── public/                # Static assets
├── src/
│   ├── pages/
│   │   ├── Landing.jsx    # Hero section, stats, and features
│   │   ├── Login.jsx      # Authentication page
│   │   └── Dashboard.jsx  # Main application interface
│   ├── utils/
│   │   └── data.js        # Dynamic mock data generator
│   ├── App.jsx            # Main router and ProtectedRoute logic
│   ├── main.jsx           # React entry point
│   ├── index.css          # Global resets and root styles
│   ├── landing.css        # Styles scoped to the Landing page
│   ├── login.css          # Styles scoped to the Login wrapper
│   └── dashboard.css      # Styles scoped to the Dashboard wrapper
├── index.html
├── package.json
└── vite.config.js
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.