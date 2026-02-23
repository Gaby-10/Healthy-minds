import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { usePartner } from "../context/PartnerContext";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import "../styles/HistoryCalendar.css";

function HistoryCalendar() {
  const { user } = useAuth();
  const { partner } = usePartner();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    total: 0,
    achieved: 0,
    partial: 0,
    missed: 0,
    streak: 0,
    longestStreak: 0
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateMeals, setSelectedDateMeals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('mine');
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedDateTotals, setSelectedDateTotals] = useState({ calories: 0, protein: 0 });

  // Load data when component mounts or view changes
  useEffect(() => {
    if (!user) return;
    
    const userId = view === 'mine' ? user.uid : partner?.id;
    if (view === 'partner' && !partner) return;
    
    setLoading(true);
    generateCalendar();
    fetchMonthData(userId);
  }, [currentMonth, view, user, partner]);

  // Generate calendar days
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startPadding = firstDay.getDay(); // 0 = Sunday
    
    // Add padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, day: null, status: 'empty' });
    }
    
    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateString = date.toISOString().split('T')[0];
      days.push({
        date: dateString,
        day: d,
        status: 'empty',
        meals: null,
        calories: 0,
        protein: 0,
        calorieGoal: 2000,
        proteinGoal: 100
      });
    }
    
    setCalendarDays(days);
  };

  // Fetch data for the month
  const fetchMonthData = async (userId) => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
      
      const logsRef = collection(db, "dailyLogs", userId, "logs");
      const querySnapshot = await getDocs(logsRef);
      
      let achieved = 0;
      let partial = 0;
      let missed = 0;
      let total = 0;
      const achievedDates = [];
      
      // Update calendar days with data
      setCalendarDays(prev => {
        const updated = [...prev];
        
        querySnapshot.forEach((doc) => {
          const dateStr = doc.id;
          if (dateStr.startsWith(monthStr)) {
            const data = doc.data();
            const totals = calculateTotals(data);
            const calorieGoal = data.calorieGoal || 2000;
            const proteinGoal = data.proteinGoal || 100;
            
            const calorieMet = totals.calories >= calorieGoal * 0.9;
            const proteinMet = totals.protein >= proteinGoal * 0.9;
            
            let status = 'missed';
            if (calorieMet && proteinMet) {
              status = 'achieved';
              achieved++;
              achievedDates.push(dateStr);
            } else if (calorieMet || proteinMet) {
              status = 'partial';
              partial++;
            } else {
              missed++;
            }
            total++;
            
            const dayIndex = updated.findIndex(d => d.date === dateStr);
            if (dayIndex !== -1) {
              updated[dayIndex] = {
                ...updated[dayIndex],
                status,
                calories: totals.calories,
                protein: totals.protein,
                meals: data.meals,
                calorieGoal,
                proteinGoal
              };
            }
          }
        });
        
        return updated;
      });
      
      // Calculate streak
      let streak = 0;
      let longestStreak = 0;
      const today = new Date();
      
      // Sort dates
      achievedDates.sort().reverse();
      
      // Calculate current streak
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        if (achievedDates.includes(dateStr)) {
          streak++;
          longestStreak = Math.max(longestStreak, streak);
        } else {
          break;
        }
      }
      
      setMonthlyStats({
        total,
        achieved,
        partial,
        missed,
        streak,
        longestStreak
      });
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate daily totals
  const calculateTotals = (data) => {
    if (!data?.meals) return { calories: 0, protein: 0 };
    
    let calories = 0;
    let protein = 0;
    
    Object.values(data.meals).forEach(mealArray => {
      if (Array.isArray(mealArray)) {
        mealArray.forEach(item => {
          calories += (item.food?.calories || 0) * (item.servings || 1);
          protein += (item.food?.protein || 0) * (item.servings || 1);
        });
      }
    });
    
    return { calories, protein };
  };

  // Handle date click
  const handleDateClick = async (day) => {
    if (!day.date || day.status === 'empty') return;
    
    if (day.meals) {
      setSelectedDate(day);
      setSelectedDateMeals(day.meals);
      setSelectedDateTotals({ calories: day.calories, protein: day.protein });
      setShowMealModal(true);
    } else {
      // Fetch fresh data
      const userId = view === 'mine' ? user.uid : partner?.id;
      const logRef = doc(db, "dailyLogs", userId, "logs", day.date);
      const logSnap = await getDoc(logRef);
      
      if (logSnap.exists()) {
        const data = logSnap.data();
        const totals = calculateTotals(data);
        setSelectedDate({
          ...day,
          meals: data.meals,
          calories: totals.calories,
          protein: totals.protein
        });
        setSelectedDateMeals(data.meals);
        setSelectedDateTotals(totals);
        setShowMealModal(true);
      }
    }
  };

  // Navigation
  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Check if date is today
  const isToday = (dateStr) => {
    return dateStr === new Date().toISOString().split('T')[0];
  };

  return (
    <div className="history-calendar-page">
      {/* Header */}
      <div className="calendar-header">
        <h1 className="calendar-title">Goal History</h1>
        
        {partner && (
          <div className="calendar-view-toggle">
            <button 
              className={`toggle-btn ${view === 'mine' ? 'active' : ''}`}
              onClick={() => setView('mine')}
            >
              My Calendar
            </button>
            <button 
              className={`toggle-btn ${view === 'partner' ? 'active' : ''}`}
              onClick={() => setView('partner')}
            >
              {partner?.displayName?.split('@')[0] || 'Partner'}'s Calendar
            </button>
          </div>
        )}
      </div>

      {/* Calendar Card */}
      <div className="calendar-card">
        {/* Month Navigation */}
        <div className="month-navigation">
          <button onClick={() => changeMonth(-1)} className="nav-btn">←</button>
          <h2 className="month-name">{monthName}</h2>
          <button onClick={() => changeMonth(1)} className="nav-btn">→</button>
          <button onClick={goToToday} className="today-btn">Today</button>
        </div>

        {/* Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot achieved"></span>
            <span>Met both goals</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot partial"></span>
            <span>Met one goal</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot missed"></span>
            <span>Met neither goal</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot empty"></span>
            <span>No data</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot today"></span>
            <span>Today</span>
          </div>
        </div>

        {/* Week Days */}
        <div className="week-days">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
          <div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="calendar-loading">Loading calendar...</div>
        ) : (
          <div className="calendar-grid">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`calendar-day ${day.status} ${isToday(day.date) ? 'today' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                {day.day && (
                  <>
                    <span className="day-number">{day.day}</span>
                    {day.status !== 'empty' && (
                      <div className="day-stats">
                        <span className="day-calories">{day.calories}</span>
                        <span className="day-protein">{day.protein}g</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="monthly-stats">
          <div className="stat-card">
            <span className="stat-label">THIS MONTH</span>
            <span className="stat-value">{monthlyStats.achieved} / {monthlyStats.total}</span>
            <span className="stat-sub">days achieved</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">PERFECT DAYS</span>
            <span className="stat-value">{monthlyStats.achieved}</span>
            <span className="stat-sub">both goals</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">PARTIAL DAYS</span>
            <span className="stat-value">{monthlyStats.partial}</span>
            <span className="stat-sub">one goal</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">CURRENT STREAK</span>
            <span className="stat-value">{monthlyStats.streak}</span>
            <span className="stat-sub">days 🔥</span>
          </div>
        </div>
      </div>

      {/* Meal Modal */}
      {showMealModal && selectedDate && (
        <div className="modal-overlay" onClick={() => setShowMealModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {new Date(selectedDate.date).toLocaleDateString('default', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <button className="close-btn" onClick={() => setShowMealModal(false)}>×</button>
            </div>

            {/* Day Summary */}
            <div className="day-summary">
              <div className="summary-item">
                <span className="summary-label">Calories</span>
                <span className="summary-value">{selectedDateTotals.calories}</span>
                <span className="summary-goal">/ {selectedDate.calorieGoal || 2000}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Protein</span>
                <span className="summary-value">{selectedDateTotals.protein}g</span>
                <span className="summary-goal">/ {selectedDate.proteinGoal || 100}g</span>
              </div>
            </div>

            {/* Meals */}
            <div className="modal-meals">
              {['breakfast', 'lunch', 'dinner', 'other'].map(mealType => (
                <div key={mealType} className="modal-meal-section">
                  <h3>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>
                  {selectedDateMeals?.[mealType]?.length > 0 ? (
                    <ul className="modal-food-list">
                      {selectedDateMeals[mealType].map((item, idx) => (
                        <li key={idx} className="modal-food-item">
                          <span className="modal-food-name">{item.food?.name}</span>
                          <span className="modal-food-servings">x{item.servings}</span>
                          <span className="modal-food-calories">
                            {item.food?.calories * item.servings} cal
                          </span>
                          <span className="modal-food-protein">
                            {item.food?.protein * item.servings}g
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="modal-no-food">No meals logged</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryCalendar;