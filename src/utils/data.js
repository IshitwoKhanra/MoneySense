// src/utils/data.js

export const generateDefaultData = () => {
    const now = new Date();
    
    // Get YYYY-MM for this month
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Get YYYY-MM for last month
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    return {
        netWorthHistory: [45000, 48000, 52000, 49500, 68000, 72000, 71000], // Dip at the end triggers net worth alert
        months: ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"], 
        budgets: {
            "Food": 800, 
            "Housing": 2000,
            "Transport": 500,
            "Shopping": 400,
            "Entertainment": 300,
            "Utilities": 250
        },
        transactions: [
            // --- THIS MONTH ---
            { id: 1, title: "Current Salary", amount: 5200, type: "income", category: "Salary", date: `${thisMonth}-02` },
            { id: 2, title: "Groceries", amount: 450, type: "expense", category: "Food", date: `${thisMonth}-05` },
            { id: 3, title: "Dining Out", amount: 400, type: "expense", category: "Food", date: `${thisMonth}-10` }, // Total 850 > 800 limit (Triggers Alert)
            { id: 4, title: "Internet Bill", amount: 80, type: "expense", category: "Utilities", date: `${thisMonth}-15` },
            
            // --- LAST MONTH ---
            { id: 5, title: "Last Month Salary", amount: 5200, type: "income", category: "Salary", date: `${lastMonth}-02` },
            { id: 6, title: "Rent", amount: 2000, type: "expense", category: "Housing", date: `${lastMonth}-01` },
            { id: 7, title: "New Shoes", amount: 120, type: "expense", category: "Shopping", date: `${lastMonth}-18` }
        ]
    };
};