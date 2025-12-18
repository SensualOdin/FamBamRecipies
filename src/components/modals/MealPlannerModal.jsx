import React, { useState, useEffect } from 'react';

const MealPlannerModal = ({ onClose, recipes, mealPlan, setMealPlan }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [showCalendarExport, setShowCalendarExport] = useState(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const generateICSContent = (meal, date, mealTime = '18:00') => {
    const [year, month, day] = date.split('-');
    const startDate = new Date(year, month - 1, day);
    const [hours, minutes] = mealTime.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const description = meal.description ? meal.description.replace(/\n/g, '\\n') : `Cooking ${meal.title}`;
    const ingredients = meal.ingredients ? '\\n\\nIngredients:\\n' + meal.ingredients.map(i => `- ${i}`).join('\\n') : '';
    
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

  const getGoogleCalendarUrl = (meal, date, mealTime = '18:00') => {
    const [year, month, day] = date.split('-');
    const startDate = new Date(year, month - 1, day);
    const [hours, minutes] = mealTime.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const formatForGoogle = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const description = meal.description || `Cooking ${meal.title}`;
    const ingredients = meal.ingredients ? '\n\nIngredients:\n' + meal.ingredients.map(i => `- ${i}`).join('\n') : '';
    const params = new URLSearchParams({ action: 'TEMPLATE', text: `🍽️ ${meal.title}`, dates: `${formatForGoogle(startDate)}/${formatForGoogle(endDate)}`, details: description + ingredients });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDayOfWeek: firstDay.getDay() };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const handleDateClick = (day) => {
    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setShowRecipePicker(false);
  };

  const handleAddMeal = (recipe) => {
    setMealPlan(prev => ({ ...prev, [selectedDate]: [...(prev[selectedDate] || []), recipe] }));
    setShowRecipePicker(false);
  };

  const handleRemoveMeal = (date, index) => {
    setMealPlan(prev => ({ ...prev, [date]: prev[date].filter((_, i) => i !== index) }));
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-all duration-300 ${isVisible ? 'bg-slate-900/60 backdrop-blur-md' : 'bg-transparent'}`} onClick={onClose}>
      <div 
        className={`bg-white rounded-t-[40px] sm:rounded-[48px] shadow-2xl w-full sm:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'sm:scale-95 opacity-0 translate-y-32'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col lg:flex-row h-full">
          {/* Main Calendar View */}
          <div className="flex-1 flex flex-col p-8 sm:p-10">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-detroit-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-detroit-500/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">Meal Planner</h2>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Organize Your Family Menu</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-900"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
                <span className="px-4 font-black text-sm uppercase tracking-tighter text-slate-700 min-w-[120px] text-center">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={handleNextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-400 hover:text-slate-900"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3 flex-1 overflow-y-auto scrollbar-hide">
              {padding.map(i => <div key={`pad-${i}`} className="aspect-square bg-slate-50/30 rounded-[20px]" />)}
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
                      relative aspect-square rounded-[24px] p-3 cursor-pointer transition-all border-2 group
                      ${isToday ? 'border-detroit-500 bg-detroit-50/30 shadow-lg shadow-detroit-500/10' : 
                        isSelected ? 'border-slate-900 bg-slate-950 text-white shadow-xl' : 
                        'border-slate-50 bg-white hover:border-detroit-100 hover:shadow-xl hover:shadow-slate-200/50'}
                    `}
                  >
                    <span className={`text-sm font-black ${isToday && !isSelected ? 'text-detroit-600' : isSelected ? 'text-white' : 'text-slate-400'}`}>{day}</span>
                    {meals.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                        <div className={`w-full h-1 rounded-full ${isSelected ? 'bg-white/30' : 'bg-detroit-500/30'}`} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 overflow-hidden p-2">
                          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110">
                            {meals[0].image && (meals[0].image.startsWith('data:') || meals[0].image.startsWith('http')) ? (
                              <img src={meals[0].image} alt={meals[0].title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl">{meals[0].image || '🥘'}</span>
                            )}
                          </div>
                          {meals.length > 1 && <span className={`text-[8px] font-black mt-1 ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>+{meals.length - 1} more</span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selection & Planned Sidebar */}
          <div className="lg:w-96 bg-slate-50 p-8 sm:p-10 flex flex-col border-l border-slate-100">
            {selectedDate ? (
              <div className="flex flex-col h-full animate-fadeIn">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-1">Planning For</h3>
                    <p className="text-xl font-black text-slate-900 tracking-tighter">
                      {new Date(selectedDate).toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  {!showRecipePicker && (
                    <button onClick={() => setShowRecipePicker(true)} className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3} /></svg></button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide -mx-4 px-4">
                  {showRecipePicker ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-detroit-500">Pick a Recipe</span>
                        <button onClick={() => setShowRecipePicker(false)} className="text-[10px] font-black uppercase text-slate-400">Cancel</button>
                      </div>
                      {recipes.map(r => (
                        <button key={r.id} onClick={() => handleAddMeal(r)} className="w-full group p-4 bg-white rounded-3xl border border-slate-100 hover:border-detroit-200 transition-all flex items-center gap-4 text-left">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                            {r.image && (r.image.startsWith('data:') || r.image.startsWith('http')) ? (
                              <img src={r.image} alt={r.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                              <span className="text-2xl group-hover:scale-110 transition-transform">{r.image || '🥘'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate text-sm">{r.title}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{r.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(mealPlan[selectedDate] || []).length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">🥘</div>
                          <p className="text-slate-400 text-sm font-medium">Nothing planned yet.<br/>What's for dinner?</p>
                        </div>
                      ) : (
                        mealPlan[selectedDate].map((m, i) => (
                          <div key={i} className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative group">
                            <button onClick={() => handleRemoveMeal(selectedDate, i)} className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3} /></svg></button>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                                {m.image && (m.image.startsWith('data:') || m.image.startsWith('http')) ? (
                                  <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-3xl">{m.image || '🥘'}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-black text-slate-900 leading-tight">{m.title}</h4>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">{m.cookTime}</p>
                              </div>
                            </div>
                            <button onClick={() => setShowCalendarExport({ meal: m, date: selectedDate })} className="w-full py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all flex items-center justify-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={2.5} /></svg>
                              Add to Calendar
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center mb-6 text-4xl shadow-sm">📅</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">Select a Date</h3>
                <p className="text-slate-400 text-sm max-w-[200px]">Choose a day from the calendar to start planning your family's meals.</p>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Export Modal Layer */}
        {showCalendarExport && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-fadeIn" onClick={() => setShowCalendarExport(null)}>
            <div className="bg-white rounded-[40px] p-10 max-w-sm w-full animate-scaleIn shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-detroit-50 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">{showCalendarExport.meal.image}</div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Sync to Calendar</h3>
                <p className="text-slate-500 text-sm">Don't forget to cook <span className="font-bold text-slate-900">{showCalendarExport.meal.title}</span>!</p>
              </div>
              
              <div className="space-y-3">
                <button onClick={() => { window.open(getGoogleCalendarUrl(showCalendarExport.meal, showCalendarExport.date), '_blank'); setShowCalendarExport(null); }} className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-[24px] hover:bg-slate-100 transition-all group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl">G</div>
                  <span className="flex-1 font-bold text-slate-700 text-left">Google Calendar</span>
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} /></svg>
                </button>
                <button onClick={() => downloadICS(showCalendarExport.meal, showCalendarExport.date)} className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-[24px] hover:bg-slate-100 transition-all group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-xl">📅</div>
                  <span className="flex-1 font-bold text-slate-700 text-left">Apple / Outlook</span>
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} /></svg>
                </button>
              </div>
              
              <button onClick={() => setShowCalendarExport(null)} className="w-full mt-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlannerModal;
