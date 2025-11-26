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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fadeIn">
      <div className={`bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-3xl lg:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'sm:scale-95 opacity-0 translate-y-4 sm:translate-y-0'}`}>
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-1" />
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 p-4 sm:p-6 text-white flex justify-between items-center">
          <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Meal Planner
          </h2>
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 active:bg-white/30 sm:hover:bg-white/30 rounded-full flex items-center justify-center transition-all active:scale-95 sm:hover:scale-110"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(95vh-7rem)] sm:h-[calc(90vh-5rem)]">
          {/* Calendar Section */}
          <div className="flex-1 p-3 sm:p-6 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-3 sm:mb-6">
              <button onClick={handlePrevMonth} className="p-1.5 sm:p-2 active:bg-gray-100 sm:hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-base sm:text-xl font-bold text-gray-800">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={handleNextMonth} className="p-1.5 sm:p-2 active:bg-gray-100 sm:hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2 text-center text-[10px] sm:text-sm font-medium text-gray-500">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="sm:hidden">{day}</div>
              ))}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="hidden sm:block">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 flex-1 auto-rows-fr overflow-y-auto">
              {padding.map(i => <div key={`pad-${i}`} />)}
              {days.map(day => {
                const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
                const meals = mealPlan[dateStr] || [];
                const isToday = new Date().toISOString().split('T')[0] === dateStr;
                const isSelected = selectedDate === dateStr;

                return (
                  <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                      border rounded-lg sm:rounded-xl p-1 sm:p-2 cursor-pointer transition-all active:scale-95 sm:hover:border-blue-400 sm:hover:shadow-md
                      flex flex-col gap-0.5 sm:gap-1 overflow-hidden min-h-[48px] sm:min-h-[80px]
                      ${isToday ? 'bg-blue-50 border-blue-200' : isSelected ? 'bg-cyan-50 border-cyan-300' : 'bg-white border-gray-100'}
                    `}
                  >
                    <div className={`text-xs sm:text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      {meals.length > 0 && (
                        <div className="hidden sm:flex flex-col gap-1">
                          {meals.slice(0, 2).map((meal, i) => (
                            <div key={i} className="text-xs bg-white border border-gray-100 rounded px-1 py-0.5 truncate shadow-sm flex items-center gap-1">
                              <span className="text-sm">{meal.image}</span>
                              <span className="truncate">{meal.title}</span>
                            </div>
                          ))}
                          {meals.length > 2 && (
                            <span className="text-[10px] text-gray-400">+{meals.length - 2} more</span>
                          )}
                        </div>
                      )}
                      {meals.length > 0 && (
                        <div className="sm:hidden flex items-center justify-center">
                          <span className="text-sm">{meals[0].image}</span>
                          {meals.length > 1 && <span className="text-[9px] text-gray-400 ml-0.5">+{meals.length - 1}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar / Recipe Picker */}
          <div className={`${showRecipePicker ? 'flex-1 lg:flex-none' : 'hidden lg:block'} lg:w-72 xl:w-80 p-3 sm:p-6 bg-gray-50 overflow-y-auto border-t lg:border-t-0 lg:border-l border-gray-200`}>
            {showRecipePicker ? (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">Add Meal</h3>
                  <button onClick={() => setShowRecipePicker(false)} className="text-xs sm:text-sm text-gray-500 active:text-gray-700 sm:hover:text-gray-700 px-2 py-1">Cancel</button>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  For {new Date(selectedDate).toLocaleDateString()}
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {recipes.map(recipe => (
                    <button
                      key={recipe.id}
                      onClick={() => handleAddMeal(recipe)}
                      className="w-full p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200 active:border-blue-300 active:scale-[0.98] sm:hover:border-blue-300 sm:hover:shadow-md transition-all text-left flex items-center gap-2 sm:gap-3 group"
                    >
                      <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">{recipe.image}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 text-xs sm:text-sm truncate">{recipe.title}</div>
                        <div className="text-[10px] sm:text-xs text-gray-500 truncate">{recipe.category} • {recipe.cookTime}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 text-gray-400">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-sm sm:text-base">Tap a date to plan meals</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlannerModal;

