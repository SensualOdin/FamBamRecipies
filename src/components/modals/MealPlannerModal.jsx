import React, { useState, useEffect } from 'react';

const MealPlannerModal = ({ onClose, recipes, mealPlan, setMealPlan }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showRecipePicker, setShowRecipePicker] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setShowRecipePicker(true);
  };

  const handleAddMeal = (recipe) => {
    setMealPlan(prev => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), recipe]
    }));
    setShowRecipePicker(false);
  };

  const handleRemoveMeal = (date, index) => {
    setMealPlan(prev => ({
      ...prev,
      [date]: prev[date].filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className={`bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Meal Planner
          </h2>
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-5rem)]">
          {/* Calendar Section */}
          <div className="flex-1 p-6 flex flex-col border-r border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-xl font-bold text-gray-800">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm font-medium text-gray-500">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
              {padding.map(i => <div key={`pad-${i}`} />)}
              {days.map(day => {
                const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                const meals = mealPlan[dateStr] || [];
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                return (
                  <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                      border rounded-xl p-2 cursor-pointer transition-all hover:border-amber-400 hover:shadow-md
                      flex flex-col gap-1 overflow-hidden min-h-[80px]
                      ${isToday ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100'}
                    `}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-amber-600' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1">
                      {meals.map((meal, i) => (
                        <div key={i} className="text-xs bg-white border border-gray-100 rounded px-1 py-0.5 truncate shadow-sm flex items-center gap-1">
                          <span>{meal.image}</span>
                          <span>{meal.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar / Recipe Picker */}
          <div className="w-80 p-6 bg-gray-50 overflow-y-auto border-l border-gray-200">
            {showRecipePicker ? (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">Add Meal</h3>
                  <button onClick={() => setShowRecipePicker(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  For {new Date(selectedDate).toLocaleDateString()}
                </p>
                <div className="space-y-3">
                  {recipes.map(recipe => (
                    <button
                      key={recipe.id}
                      onClick={() => handleAddMeal(recipe)}
                      className="w-full p-3 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all text-left flex items-center gap-3 group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform">{recipe.image}</span>
                      <div>
                        <div className="font-medium text-gray-800 text-sm">{recipe.title}</div>
                        <div className="text-xs text-gray-500">{recipe.category} • {recipe.cookTime}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p>Select a date to plan meals</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlannerModal;

