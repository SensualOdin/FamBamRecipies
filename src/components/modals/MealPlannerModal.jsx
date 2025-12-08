import React, { useState, useEffect } from 'react';

const MealPlannerModal = ({ onClose, recipes, mealPlan, setMealPlan }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [showCalendarExport, setShowCalendarExport] = useState(null); // Holds meal info for export

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  // Generate ICS file content for a meal
  const generateICSContent = (meal, date, mealTime = '18:00') => {
    const [year, month, day] = date.split('-');
    const startDate = new Date(year, month - 1, day);
    const [hours, minutes] = mealTime.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const formatDate = (d) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const description = meal.description 
      ? meal.description.replace(/\n/g, '\\n') 
      : `Cooking ${meal.title}`;
    
    const ingredients = meal.ingredients 
      ? '\\n\\nIngredients:\\n' + meal.ingredients.map(i => `- ${i}`).join('\\n')
      : '';
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Family Cookbook//Meal Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:🍽️ ${meal.title}
DESCRIPTION:${description}${ingredients}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
  };

  // Download ICS file
  const downloadICS = (meal, date, mealTime = '18:00') => {
    const icsContent = generateICSContent(meal, date, mealTime);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meal.title.replace(/[^a-z0-9]/gi, '_')}_${date}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowCalendarExport(null);
  };

  // Generate Google Calendar URL
  const getGoogleCalendarUrl = (meal, date, mealTime = '18:00') => {
    const [year, month, day] = date.split('-');
    const startDate = new Date(year, month - 1, day);
    const [hours, minutes] = mealTime.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
    const formatForGoogle = (d) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    const description = meal.description || `Cooking ${meal.title}`;
    const ingredients = meal.ingredients 
      ? '\n\nIngredients:\n' + meal.ingredients.map(i => `- ${i}`).join('\n')
      : '';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `🍽️ ${meal.title}`,
      dates: `${formatForGoogle(startDate)}/${formatForGoogle(endDate)}`,
      details: description + ingredients,
    });
    
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // Export all meals for a specific week
  const exportWeekToICS = () => {
    const allMeals = [];
    Object.entries(mealPlan).forEach(([date, meals]) => {
      meals.forEach(meal => {
        allMeals.push({ meal, date });
      });
    });
    
    if (allMeals.length === 0) {
      alert('No meals to export!');
      return;
    }
    
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Family Cookbook//Meal Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;
    
    allMeals.forEach(({ meal, date }, index) => {
      const [year, month, day] = date.split('-');
      const startDate = new Date(year, month - 1, day);
      startDate.setHours(18, 0, 0);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      
      const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const description = meal.description ? meal.description.replace(/\n/g, '\\n') : `Cooking ${meal.title}`;
      
      icsContent += `BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:🍽️ ${meal.title}
DESCRIPTION:${description}
UID:meal-${date}-${index}@familycookbook
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
`;
    });
    
    icsContent += 'END:VCALENDAR';
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `meal_plan_${new Date().toISOString().split('T')[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
          <div className="flex items-center gap-2">
            {/* Export All Button */}
            {Object.keys(mealPlan).some(date => mealPlan[date]?.length > 0) && (
              <button 
                onClick={exportWeekToICS}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs sm:text-sm font-medium transition-all"
                title="Export all meals to calendar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Export All</span>
                <span className="sm:hidden">Export</span>
              </button>
            )}
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
          <div className={`${showRecipePicker || selectedDate ? 'flex-1 lg:flex-none' : 'hidden lg:block'} lg:w-72 xl:w-80 p-3 sm:p-6 bg-gray-50 overflow-y-auto border-t lg:border-t-0 lg:border-l border-gray-200`}>
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
            ) : selectedDate && mealPlan[selectedDate]?.length > 0 ? (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base">Planned Meals</h3>
                  <button onClick={() => setShowRecipePicker(true)} className="text-xs sm:text-sm text-blue-600 font-medium px-2 py-1">+ Add More</button>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  {new Date(selectedDate).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <div className="space-y-2 sm:space-y-3">
                  {mealPlan[selectedDate].map((meal, index) => (
                    <div
                      key={index}
                      className="w-full p-2.5 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl">{meal.image}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-800 text-xs sm:text-sm truncate">{meal.title}</div>
                          <div className="text-[10px] sm:text-xs text-gray-500 truncate">{meal.category} • {meal.cookTime}</div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => setShowCalendarExport({ meal, date: selectedDate, index })}
                          className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Add to Calendar
                        </button>
                        <button
                          onClick={() => handleRemoveMeal(selectedDate, index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove meal"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedDate ? (
              <div className="animate-fadeIn text-center py-8">
                <p className="text-sm text-gray-500 mb-4">
                  No meals planned for<br />
                  <span className="font-medium text-gray-700">
                    {new Date(selectedDate).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                </p>
                <button
                  onClick={() => setShowRecipePicker(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all"
                >
                  + Add a Meal
                </button>
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

        {/* Calendar Export Modal */}
        {showCalendarExport && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setShowCalendarExport(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scaleIn" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Add to Calendar</h3>
              <p className="text-sm text-gray-500 mb-4">
                Export "<span className="font-medium text-gray-700">{showCalendarExport.meal.title}</span>" to your calendar
              </p>
              
              {/* Time Selection */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Meal Time</label>
                <select
                  id="mealTimeSelect"
                  defaultValue="18:00"
                  onChange={(e) => setShowCalendarExport(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:border-blue-500 outline-none"
                >
                  <option value="07:00">🌅 Breakfast (7:00 AM)</option>
                  <option value="12:00">☀️ Lunch (12:00 PM)</option>
                  <option value="18:00">🌙 Dinner (6:00 PM)</option>
                  <option value="15:00">🍪 Snack (3:00 PM)</option>
                </select>
              </div>
              
              <div className="space-y-2">
                {/* Google Calendar */}
                <button
                  onClick={() => {
                    const time = showCalendarExport.time || '18:00';
                    const url = getGoogleCalendarUrl(showCalendarExport.meal, showCalendarExport.date, time);
                    window.open(url, '_blank');
                    setShowCalendarExport(null);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-green-500 to-yellow-500 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm">Google Calendar</div>
                    <div className="text-xs text-gray-500">Opens in new tab</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </button>
                
                {/* Apple Calendar / Download ICS */}
                <button
                  onClick={() => {
                    const time = showCalendarExport.time || '18:00';
                    downloadICS(showCalendarExport.meal, showCalendarExport.date, time);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800 text-sm">Apple Calendar</div>
                    <div className="text-xs text-gray-500">Downloads .ics file</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                
                {/* Outlook / Other */}
                <button
                  onClick={() => {
                    const time = showCalendarExport.time || '18:00';
                    downloadICS(showCalendarExport.meal, showCalendarExport.date, time);
                  }}
                  className="w-full flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.5 2h-19A2.5 2.5 0 000 4.5v15A2.5 2.5 0 002.5 22h19a2.5 2.5 0 002.5-2.5v-15A2.5 2.5 0 0021.5 2zM7.5 17.5h-3v-3h3v3zm0-5h-3v-3h3v3zm0-5h-3v-3h3v3zm13 10h-11v-3h11v3zm0-5h-11v-3h11v3zm0-5h-11v-3h11v3z"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800 text-sm">Outlook / Other</div>
                    <div className="text-xs text-gray-500">Downloads .ics file</div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>
              
              <p className="text-xs text-gray-400 text-center mt-4">
                The .ics file works with most calendar apps
              </p>
              
              <button
                onClick={() => setShowCalendarExport(null)}
                className="w-full mt-4 py-2.5 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlannerModal;

