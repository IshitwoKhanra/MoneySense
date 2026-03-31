// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement, Filler } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Bell } from 'lucide-react';
import { generateDefaultData } from '../utils/data';
import '../dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement, Filler);
const formatCurrency = (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);

export default function Dashboard() {
  const navigate = useNavigate();
  
  // App State
  const [data, setData] = useState(() => JSON.parse(localStorage.getItem('moneySenseData')) || generateDefaultData());
  const [activeModal, setActiveModal] = useState(null);
  
  // Notifications State
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const hasTriggeredToasts = useRef(false);
  
  // Form States
  const [txForm, setTxForm] = useState({ title: '', amount: '', type: 'expense', category: 'Food' });
  const [transferForm, setTransferForm] = useState({ recipient: '', amount: '' });
  const [budgetsForm, setBudgetsForm] = useState(data.budgets);
  const [reportFilter, setReportFilter] = useState('thisMonth');

  const currentDate = new Date();
  const currentMonthStr = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const userName = localStorage.getItem('userName') || "User";
  const initials = userName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('moneySenseData', JSON.stringify(data));
    generateNotifications();
  }, [data]);

  // --- NEW: POP-UP NOTIFICATIONS ENGINE ---
  const generateNotifications = () => {
    const alerts = [];
    
    // 1. Net Worth Dip Check
    const nw = data.netWorthHistory;
    if (nw.length >= 2) {
      const currentNW = nw[nw.length - 1];
      const prevNW = nw[nw.length - 2];
      if (currentNW < prevNW) {
        alerts.push({ id: Date.now(), type: 'danger', msg: `Warning: Your net worth dropped by ${formatCurrency(prevNW - currentNW)} since last month.` });
      }
    }

    // 2. Budget Overflow Check
    const currentExpenses = data.transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonthKey));
    const spentMap = {};
    currentExpenses.forEach(t => spentMap[t.category] = (spentMap[t.category] || 0) + t.amount);
    
    Object.entries(data.budgets).forEach(([cat, limit]) => {
      if ((spentMap[cat] || 0) > limit) {
        alerts.push({ id: Date.now() + Math.random(), type: 'warning', msg: `Budget Exceeded: You've spent over your ${formatCurrency(limit)} limit for ${cat}.` });
      }
    });

    setNotifications(alerts);

    // Trigger Pop-up Toast only once per session/reload
    if (alerts.length > 0 && !hasTriggeredToasts.current) {
      setToasts(alerts);
      hasTriggeredToasts.current = true;
      // Auto-hide toasts after 6 seconds
      setTimeout(() => setToasts([]), 6000);
    }
  };

  // --- KPI Calculations ---
  const kpis = useMemo(() => {
    const currentTrans = data.transactions.filter(t => t.date.startsWith(currentMonthKey));
    const income = currentTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = currentTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savings = income - expenses;
    
    const currentNW = data.netWorthHistory[data.netWorthHistory.length - 1];
    const prevNW = data.netWorthHistory.length > 1 ? data.netWorthHistory[data.netWorthHistory.length - 2] : currentNW;
    const nwChange = prevNW !== 0 ? ((currentNW - prevNW) / prevNW) * 100 : 0;
    
    return { income, expenses, savings, currentNW, nwChange, savingsRate: income > 0 ? ((savings/income)*100).toFixed(1) : 0 };
  }, [data, currentMonthKey]);

  // --- Handlers ---
  const handleLogout = () => {
    if(window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('isLoggedIn');
      navigate('/login');
    }
  };

  const handleAddTransaction = () => {
    if (!txForm.title || !txForm.amount) return alert("Enter valid details");
    const amount = parseFloat(txForm.amount);
    const newTx = { ...txForm, amount, id: Date.now(), date: currentDate.toISOString().split('T')[0] };
    
    const newHistory = [...data.netWorthHistory];
    newHistory[newHistory.length - 1] += (newTx.type === 'income' ? amount : -amount);

    setData({ ...data, transactions: [...data.transactions, newTx], netWorthHistory: newHistory });
    setTxForm({ title: '', amount: '', type: 'expense', category: 'Food' });
    setActiveModal(null);
  };

  const handleTransfer = () => {
    if (!transferForm.recipient || !transferForm.amount) return alert("Enter valid details");
    const amount = parseFloat(transferForm.amount);
    
    const newTx = { id: Date.now(), title: `Transfer to ${transferForm.recipient}`, amount, type: 'expense', category: 'Transfers', date: currentDate.toISOString().split('T')[0] };
    const newHistory = [...data.netWorthHistory];
    newHistory[newHistory.length - 1] -= amount;

    setData({ ...data, transactions: [...data.transactions, newTx], netWorthHistory: newHistory });
    setTransferForm({ recipient: '', amount: '' });
    setActiveModal(null);
  };

  const handleSaveBudgets = () => {
    setData({ ...data, budgets: budgetsForm });
    setActiveModal(null);
  };

  const handleDownloadReport = () => {
    let filteredData = data.transactions;
    const now = new Date();

    if (reportFilter === 'thisMonth') {
      filteredData = data.transactions.filter(t => t.date.startsWith(currentMonthKey));
    } else if (reportFilter === 'lastMonth') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lmKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
      filteredData = data.transactions.filter(t => t.date.startsWith(lmKey));
    } else if (reportFilter === 'last30') {
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
      filteredData = data.transactions.filter(t => t.date >= thirtyDaysAgo);
    } else if (reportFilter === 'lastYear') {
      const lastYearStr = String(now.getFullYear() - 1);
      filteredData = data.transactions.filter(t => t.date.startsWith(lastYearStr));
    }

    if (filteredData.length === 0) return alert("No transactions found for this period.");

    let csv = "Date,Description,Category,Type,Amount\n";
    filteredData.forEach(row => { csv += `${row.date},"${row.title}",${row.category},${row.type},${row.amount}\n`; });

    const link = document.createElement("a");
    link.href = encodeURI("data:text/csv;charset=utf-8," + csv);
    link.download = `MoneySense_Report_${reportFilter}.csv`;
    link.click();
    setActiveModal(null);
  };

  // --- Chart Setup ---
  const balanceChartData = {
    labels: data.months,
    datasets: [{
      label: 'Net Worth', data: data.netWorthHistory, borderColor: '#00e0a4',
      backgroundColor: 'rgba(0, 224, 164, 0.1)', borderWidth: 3, fill: true, tension: 0.4
    }]
  };

  const currentExpenses = data.transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonthKey));
  const expMap = {};
  currentExpenses.forEach(t => expMap[t.category] = (expMap[t.category] || 0) + t.amount);
  
  const expenseChartData = {
    labels: Object.keys(expMap).length ? Object.keys(expMap) : ['No Data'],
    datasets: [{
      data: Object.values(expMap).length ? Object.values(expMap) : [1],
      backgroundColor: Object.values(expMap).length ? ['#16c79a', '#3c82f6', '#ff4757', '#ffa502', '#a55eea'] : ['#1f3b52'],
      borderWidth: 0, cutout: '70%'
    }]
  };

  // Analytics Modal Chart Data
  const totalAllIncome = data.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalAllExpense = data.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  
  const analyticsBarData = {
    labels: ['Income', 'Expenses', 'Net Savings'],
    datasets: [{
      label: 'All Time Summary',
      data: [totalAllIncome, totalAllExpense, totalAllIncome - totalAllExpense],
      backgroundColor: ['#00e0a4', '#ff4d4d', '#3c82f6'],
      borderRadius: 5
    }]
  };

  return (
    <div className="dashboard-wrapper">
      <div className="container">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <h1>Good evening, <span>{userName}</span></h1>
            <p>Here's your financial overview for <span>{currentMonthStr}</span></p>
          </div>
          
          <div className="header-right">
            <div className="notification-container">
              <div className="bell-icon" onClick={() => setShowNotifs(!showNotifs)}>
                <Bell size={20} />
                {notifications.length > 0 && <span className="bell-badge">{notifications.length}</span>}
              </div>
              {showNotifs && (
                <div className="notifications-dropdown active">
                  {notifications.length === 0 ? <p className="notif-item">All good! No new alerts.</p> :
                    notifications.map((n, i) => (
                      <div key={i} className={`notif-item ${n.type}`}>{n.msg}</div>
                    ))
                  }
                </div>
              )}
            </div>
            <div className="profile-pill">
              <div className="avatar">{initials}</div>
              <span className="profile-name">{userName}</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>

        {/* KPIs */}
        <div className="kpis">
          <div className="kpi">
            <p>Net Worth</p>
            <h2>{formatCurrency(kpis.currentNW)}</h2>
            <span className={kpis.nwChange >= 0 ? 'positive' : 'negative'}>
              {kpis.nwChange >= 0 ? '+' : ''}{kpis.nwChange.toFixed(1)}% from last month
            </span>
          </div>
          <div className="kpi"><p>Total Income</p><h2>{formatCurrency(kpis.income)}</h2><span className="positive">This Month</span></div>
          <div className="kpi"><p>Monthly Savings</p><h2>{formatCurrency(kpis.savings)}</h2><span className="positive">{kpis.savingsRate}% savings rate</span></div>
          <div className="kpi"><p>Monthly Expenses</p><h2>{formatCurrency(kpis.expenses)}</h2><span className="negative">This Month</span></div>
        </div>

        {/* Quick Actions */}
        <div className="card quick-actions">
          <h3>Quick Actions</h3>
          <div className="quick-grid">
            <div className="quick-item primary" onClick={() => setActiveModal('transaction')}><div className="quick-icon">+</div><p>Add Transaction</p></div>
            <div className="quick-item" onClick={() => setActiveModal('transfer')}><div className="quick-icon">➤</div><p>Transfer</p></div>
            <div className="quick-item" onClick={() => setActiveModal('download')}><div className="quick-icon">⬇</div><p>Download Report</p></div>
            <div className="quick-item" onClick={() => setActiveModal('analytics')}><div className="quick-icon">📊</div><p>Analytics</p></div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts">
          <div className="card large">
            <div className="card-header"><div><h3>Balance Trend</h3><p>Your net worth over time</p></div></div>
            <div className="chart-wrapper"><Line data={balanceChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
          </div>
          <div className="card">
            <h3>Spending by Category</h3><p>This month's breakdown</p>
            <div className="donut-wrapper"><Doughnut data={expenseChartData} options={{ maintainAspectRatio: false }} /></div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <div className="card">
            <div className="card-header">
              <div><h3>Recent Transactions</h3><p>Your latest activity</p></div>
              <button className="edit-btn" onClick={() => setActiveModal('allTransactions')}>View All</button>
            </div>
            <div>
              {[...data.transactions].reverse().slice(0, 5).map(t => (
                <div key={t.id} className={`transaction ${t.type}`}>
                  <span>{t.title} <small>{t.category} • {t.date}</small></span>
                  <span>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div><h3>Budget Progress</h3><p>Monthly spending limits</p></div>
              <button className="edit-btn" onClick={() => { setBudgetsForm(data.budgets); setActiveModal('budget'); }}>✎ Edit</button>
            </div>
            <div>
              {Object.entries(data.budgets).map(([cat, limit]) => {
                const spent = expMap[cat] || 0;
                const pct = Math.min((spent / limit) * 100, 100);
                const isOver = spent > limit;
                return (
                  <div key={cat} className="progress-group">
                    <label>{cat} <span className={isOver ? 'danger-text' : ''}>{formatCurrency(spent)} / {formatCurrency(limit)}</span></label>
                    <div className="progress-bar"><div className={`progress ${isOver ? 'danger' : ''}`} style={{ width: `${pct}%` }}></div></div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ================= MODALS ================= */}
        
        {/* 1. Add Transaction */}
        <div className={`modal-overlay ${activeModal === 'transaction' ? 'active' : ''}`}>
          <div className="modal-card">
            <div className="modal-header"><h3>Add Transaction</h3><button onClick={() => setActiveModal(null)} className="close-btn">&times;</button></div>
            <div className="form-group"><label>Description</label><input type="text" value={txForm.title} onChange={e => setTxForm({...txForm, title: e.target.value})} placeholder="e.g. Netflix" /></div>
            <div className="form-group"><label>Amount</label><input type="number" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} placeholder="0.00" /></div>
            <div className="form-row">
              <div className="form-group"><label>Type</label><select value={txForm.type} onChange={e => setTxForm({...txForm, type: e.target.value})}><option value="expense">Expense</option><option value="income">Income</option></select></div>
              <div className="form-group">
                <label>Category</label>
                <select value={txForm.category} onChange={e => setTxForm({...txForm, category: e.target.value})}>
                  <option value="Food">Food</option>
                  <option value="Housing">Housing</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Salary">Salary</option>
                </select>
              </div>
            </div>
            <button onClick={handleAddTransaction} className="btn-submit">Add Transaction</button>
          </div>
        </div>

        {/* 2. Transfer Money */}
        <div className={`modal-overlay ${activeModal === 'transfer' ? 'active' : ''}`}>
          <div className="modal-card">
            <div className="modal-header"><h3>Transfer Money</h3><button onClick={() => setActiveModal(null)} className="close-btn">&times;</button></div>
            <div className="form-group"><label>To (Recipient)</label><input type="text" value={transferForm.recipient} onChange={e => setTransferForm({...transferForm, recipient: e.target.value})} placeholder="e.g. John Doe" /></div>
            <div className="form-group"><label>Amount</label><input type="number" value={transferForm.amount} onChange={e => setTransferForm({...transferForm, amount: e.target.value})} placeholder="0.00" /></div>
            <button onClick={handleTransfer} className="btn-submit">Send Transfer</button>
          </div>
        </div>

        {/* 3. Download Report */}
        <div className={`modal-overlay ${activeModal === 'download' ? 'active' : ''}`}>
          <div className="modal-card">
            <div className="modal-header"><h3>Download CSV Report</h3><button onClick={() => setActiveModal(null)} className="close-btn">&times;</button></div>
            <div className="form-group">
              <label>Select Date Range</label>
              <select value={reportFilter} onChange={(e) => setReportFilter(e.target.value)}>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="last30">Last 30 Days</option>
                <option value="lastYear">Last Year</option>
                <option value="allTime">All Time</option>
              </select>
            </div>
            <button onClick={handleDownloadReport} className="btn-submit">Download CSV</button>
          </div>
        </div>

        {/* 4. Analytics */}
        <div className={`modal-overlay ${activeModal === 'analytics' ? 'active' : ''}`}>
          <div className="modal-card large-modal">
            <div className="modal-header"><h3>Financial Analytics</h3><button onClick={() => setActiveModal(null)} className="close-btn">&times;</button></div>
            <div className="analytics-grid">
              <div className="chart-box">
                <h4 style={{marginBottom:'20px', color:'#8fa3b8'}}>Income vs Expenses (All Time)</h4>
                <div className="chart-container-large">
                  <Bar data={analyticsBarData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
              </div>
              <div className="stats-box">
                <h4>Summary</h4>
                <div className="stat-row"><span>Total Income</span><span className="val-pos">{formatCurrency(totalAllIncome)}</span></div>
                <div className="stat-row"><span>Total Expense</span><span className="val-neg">{formatCurrency(totalAllExpense)}</span></div>
                <div className="stat-row"><span>Net Savings</span><span className="val-neu">{formatCurrency(totalAllIncome - totalAllExpense)}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Edit Budgets */}
        <div className={`modal-overlay ${activeModal === 'budget' ? 'active' : ''}`}>
          <div className="modal-card">
            <div className="modal-header"><h3>Set Monthly Limits</h3><button onClick={() => setActiveModal(null)} className="close-btn">&times;</button></div>
            <div className="scrollable-list" style={{maxHeight: '400px'}}>
              {Object.entries(budgetsForm).map(([cat, limit]) => (
                <div className="form-group" key={cat}>
                  <label>{cat} Limit</label>
                  <input type="number" value={limit} onChange={e => setBudgetsForm({...budgetsForm, [cat]: parseFloat(e.target.value) || 0})} />
                </div>
              ))}
            </div>
            <button onClick={handleSaveBudgets} className="btn-submit">Save Limits</button>
          </div>
        </div>

        {/* 6. View All Transactions */}
        <div className={`modal-overlay ${activeModal === 'allTransactions' ? 'active' : ''}`}>
          <div className="modal-card">
            <div className="modal-header"><h3>Transaction History</h3><button onClick={() => setActiveModal(null)} className="close-btn">&times;</button></div>
            <div className="scrollable-list">
              {[...data.transactions].reverse().map(t => (
                <div key={t.id} className={`transaction ${t.type}`}>
                  <span>{t.title} <small>{t.category} • {t.date}</small></span>
                  <span>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= FLOATING TOAST NOTIFICATIONS ================= */}
        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className={`toast ${toast.type}`}>
              <span>⚠️</span>
              <p>{toast.msg}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}