import React, { useState, useEffect, memo } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const MealPlannerModal = ({ onClose, recipes, mealPlan, setMealPlan }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [showCalendarExport, setShowCalendarExport] = useState(null);

  // Handle browser back button to close modal
  useEffect(() => {
    const handlePopState = () => {
      setIsVisible(false);
      setTimeout(onClose, 150);
    };

    window.history.pushState({ modal: 'meal-planner' }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modal === 'meal-planner') {
        window.history.back();
      }
    };
  }, [onClose]);

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

  // Build YYYY-MM-DD from local date parts — toISOString() converts to UTC
  // and can shift the key to the previous/next day depending on timezone.
  const toDateKey = (year, month, day) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const handleDateClick = (day) => {
    setSelectedDate(toDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day));
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
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-all duration-300 ${isVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'}`} onClick={onClose}>
      <div 
        className={`bg-background rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl w-full sm:max-w-4xl h-[92vh] sm:h-auto sm:max-h-[90vh] overflow-hidden transition-all duration-300 ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'sm:scale-95 opacity-0 translate-y-32'}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col lg:flex-row h-full bg-background transition-colors">
          {/* Main Calendar View */}
          <div className="flex-1 flex flex-col p-4 sm:p-10 pt-safe bg-background transition-colors">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="w-10 h-10 bg-muted hover:bg-border rounded-xl border border-border shrink-0"
                >
                  <ChevronLeft className="w-6 h-6 text-foreground" />
                </Button>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-md">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground leading-tight">Meal Planner</h2>
                    <p className="font-hand text-base text-muted-foreground leading-none mt-1">what's for dinner?</p>
                  </div>
                </div>
              </div>
              
              <div className="hidden sm:flex items-center gap-2 bg-muted p-1 rounded-xl">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-card hover:shadow-sm rounded-lg transition-all text-muted-foreground hover:text-foreground"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
                <span className="px-4 font-serif font-semibold text-sm text-foreground min-w-[120px] text-center">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={handleNextMonth} className="p-2 hover:bg-card hover:shadow-sm rounded-lg transition-all text-muted-foreground hover:text-foreground"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></button>
              </div>
            </div>

              <div className="flex sm:hidden items-center justify-between gap-2 bg-muted p-1 rounded-xl mb-6">
                <button onClick={handlePrevMonth} className="p-2 hover:bg-card hover:shadow-sm rounded-lg transition-all text-muted-foreground hover:text-foreground"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
                <span className="px-4 font-serif font-semibold text-sm text-foreground text-center">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <button onClick={handleNextMonth} className="p-2 hover:bg-card hover:shadow-sm rounded-lg transition-all text-muted-foreground hover:text-foreground"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></button>
              </div>

              <div className="grid grid-cols-7 gap-3 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/70">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3 flex-1 overflow-y-auto scrollbar-hide">
              {padding.map(i => <div key={`pad-${i}`} className="aspect-square bg-muted/40 rounded-xl" />)}
              {days.map(day => {
                const dateStr = toDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const meals = mealPlan[dateStr] || [];
                const now = new Date();
                const isToday = toDateKey(now.getFullYear(), now.getMonth(), now.getDate()) === dateStr;
                const isSelected = selectedDate === dateStr;

                return (
                  <div
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
                      relative aspect-square rounded-xl p-3 cursor-pointer transition-all border-2 group
                      ${isToday ? 'border-primary bg-primary/10' : 
                        isSelected ? 'border-foreground bg-foreground text-background shadow-lg' : 
                        'border-transparent bg-card hover:border-primary/40 hover:shadow-md'}
                    `}
                  >
                    <span className={`text-sm font-black ${isToday && !isSelected ? 'text-[hsl(var(--accent))]' : isSelected ? 'text-background' : 'text-muted-foreground'}`}>{day}</span>
                    {meals.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
                        <div className={`w-full h-1 rounded-full ${isSelected ? 'bg-background/30' : 'bg-primary/40'}`} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4 overflow-hidden p-2">
                          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-110">
                            {meals[0].image && (meals[0].image.startsWith('data:') || meals[0].image.startsWith('http')) ? (
                              <img src={meals[0].image} alt={meals[0].title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl">{meals[0].image || '🥘'}</span>
                            )}
                          </div>
                          {meals.length > 1 && <span className={`text-[8px] font-black mt-1 ${isSelected ? 'text-background/60' : 'text-muted-foreground'}`}>+{meals.length - 1} more</span>}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selection & Planned Sidebar */}
          <div className="lg:w-96 bg-secondary p-8 sm:p-10 flex flex-col border-l border-border">
            {selectedDate ? (
              <div className="flex flex-col h-full animate-fadeIn">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground mb-1">Planning For</h3>
                    <p className="font-serif text-xl font-semibold text-foreground tracking-tight">
                      {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  {!showRecipePicker && (
                    <button onClick={() => setShowRecipePicker(true)} className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center shadow-md hover:scale-110 transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth={3} /></svg></button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide -mx-4 px-4">
                  {showRecipePicker ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">Pick a Recipe</span>
                        <button onClick={() => setShowRecipePicker(false)} className="text-[10px] font-extrabold uppercase text-muted-foreground">Cancel</button>
                      </div>
                      {recipes.map(r => (
                        <button key={r.id} onClick={() => handleAddMeal(r)} className="w-full group p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-all flex items-center gap-4 text-left">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                            {r.image && (r.image.startsWith('data:') || r.image.startsWith('http')) ? (
                              <img src={r.image} alt={r.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                              <span className="text-2xl group-hover:scale-110 transition-transform">{r.image || '🥘'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-foreground truncate text-sm">{r.title}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{r.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(mealPlan[selectedDate] || []).length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 bg-card rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">🥘</div>
                          <p className="font-hand text-lg text-muted-foreground -rotate-1">Nothing planned yet.<br/>What sounds good?</p>
                        </div>
                      ) : (
                        mealPlan[selectedDate].map((m, i) => (
                          <div key={i} className="bg-card rounded-xl p-6 shadow-md border border-border relative group">
                            <button onClick={() => handleRemoveMeal(selectedDate, i)} className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth={3} /></svg></button>
                            <div className="flex items-center gap-4 mb-6">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                                {m.image && (m.image.startsWith('data:') || m.image.startsWith('http')) ? (
                                  <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-3xl">{m.image || '🥘'}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-serif font-semibold text-foreground leading-tight">{m.title}</h4>
                                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mt-1">{m.cookTime}</p>
                              </div>
                            </div>
                            <button onClick={() => setShowCalendarExport({ meal: m, date: selectedDate })} className="w-full py-3 bg-muted hover:bg-border rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-foreground transition-all flex items-center justify-center gap-2">
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
                <div className="w-20 h-20 bg-card rounded-2xl flex items-center justify-center mb-6 text-4xl shadow-sm">📅</div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2 tracking-tight">Select a Date</h3>
                <p className="font-hand text-lg text-muted-foreground max-w-[220px] -rotate-1">Choose a day from the calendar to start planning your family's meals.</p>
              </div>
            )}
          </div>
        </div>

        {/* Calendar Export Modal Layer */}
        {showCalendarExport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-fadeIn" onClick={() => setShowCalendarExport(null)}>
            <div className="bg-card border border-border rounded-2xl p-10 max-w-sm w-full animate-scaleIn shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm">{showCalendarExport.meal.image}</div>
                <h3 className="font-serif text-2xl font-semibold text-foreground tracking-tight mb-2">Sync to Calendar</h3>
                <p className="text-muted-foreground text-sm">Don't forget to cook <span className="font-bold text-foreground">{showCalendarExport.meal.title}</span>!</p>
              </div>
              
              <div className="space-y-3">
                <button onClick={() => { window.open(getGoogleCalendarUrl(showCalendarExport.meal, showCalendarExport.date), '_blank'); setShowCalendarExport(null); }} className="w-full flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-border transition-all group">
                  <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center shadow-sm text-xl">G</div>
                  <span className="flex-1 font-bold text-foreground text-left">Google Calendar</span>
                  <svg className="w-5 h-5 text-muted-foreground/60 group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} /></svg>
                </button>
                <button onClick={() => downloadICS(showCalendarExport.meal, showCalendarExport.date)} className="w-full flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-border transition-all group">
                  <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center shadow-sm text-xl">📅</div>
                  <span className="flex-1 font-bold text-foreground text-left">Apple / Outlook</span>
                  <svg className="w-5 h-5 text-muted-foreground/60 group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} /></svg>
                </button>
              </div>
              
              <button onClick={() => setShowCalendarExport(null)} className="w-full mt-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(MealPlannerModal);
