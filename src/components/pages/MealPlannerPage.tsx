import React, { useState, memo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, X, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface MealPlannerPageProps {
  onBack: () => void;
  recipes: any[];
  mealPlan: Record<string, any>;
  setMealPlan: (plan: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void;
}

const hasPhoto = (img: any) =>
  img && typeof img === 'string' && (img.startsWith('data:') || img.startsWith('http'));

const MealPlannerPage: React.FC<MealPlannerPageProps> = ({ onBack, recipes, mealPlan, setMealPlan }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [showCalendarExport, setShowCalendarExport] = useState<any>(null);

  const generateICSContent = (meal: any, date: string, mealTime = '18:00') => {
    const [year, month, day] = date.split('-');
    const startDate = new Date(Number(year), Number(month) - 1, Number(day));
    const [hours, minutes] = mealTime.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const formatDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const description = meal.description ? meal.description.replace(/\n/g, '\\n') : `Cooking ${meal.title}`;
    const ingredients = meal.ingredients ? '\\n\\nIngredients:\\n' + meal.ingredients.map((i: string) => `- ${i}`).join('\\n') : '';

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Family Cookbook//Meal Planner//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${meal.title}
DESCRIPTION:${description}${ingredients}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
  };

  const downloadICS = (meal: any, date: string, mealTime = '18:00') => {
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

  const getGoogleCalendarUrl = (meal: any, date: string, mealTime = '18:00') => {
    const [year, month, day] = date.split('-');
    const startDate = new Date(Number(year), Number(month) - 1, Number(day));
    const [hours, minutes] = mealTime.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes), 0);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const formatForGoogle = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const description = meal.description || `Cooking ${meal.title}`;
    const ingredients = meal.ingredients ? '\n\nIngredients:\n' + meal.ingredients.map((i: string) => `- ${i}`).join('\n') : '';
    const params = new URLSearchParams({ action: 'TEMPLATE', text: meal.title, dates: `${formatForGoogle(startDate)}/${formatForGoogle(endDate)}`, details: description + ingredients });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const getDaysInMonth = (date: Date) => {
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
  const toDateKey = (year: number, month: number, day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const handleDateClick = (day: number) => {
    setSelectedDate(toDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    setShowRecipePicker(false);
  };

  const handleAddMeal = (recipe: any) => {
    if (!selectedDate) return;
    setMealPlan(prev => ({ ...prev, [selectedDate]: [...(prev[selectedDate] || []), recipe] }));
    setShowRecipePicker(false);
  };

  const handleRemoveMeal = (date: string, index: number) => {
    setMealPlan(prev => ({ ...prev, [date]: prev[date].filter((_: any, i: number) => i !== index) }));
  };

  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background pb-28 sm:pb-16 animate-in fade-in duration-300">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full px-3 sm:px-4 h-10 font-bold text-sm border-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Back to the binder</span>
            <span className="xs:hidden">Back</span>
          </Button>

          <div className="flex items-center gap-1 bg-muted p-1 rounded-full">
            <button onClick={handlePrevMonth} aria-label="Previous month" className="p-2 hover:bg-card rounded-full transition-all text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-serif font-semibold text-sm text-foreground min-w-[130px] text-center">{monthLabel}</span>
            <button onClick={handleNextMonth} aria-label="Next month" className="p-2 hover:bg-card rounded-full transition-all text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-8 mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-1">Meal Planner</h1>
          <p className="font-hand text-xl text-muted-foreground -rotate-1">what's for dinner?</p>
        </div>

        <div className="grid lg:grid-cols-[1fr,340px] gap-8">
          {/* Calendar */}
          <div>
            <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground/70">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {padding.map(i => <div key={`pad-${i}`} className="aspect-square bg-muted/40 rounded-xl" />)}
              {days.map(day => {
                const dateStr = toDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const meals = mealPlan[dateStr] || [];
                const now = new Date();
                const isToday = toDateKey(now.getFullYear(), now.getMonth(), now.getDate()) === dateStr;
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    aria-label={`Plan meals for ${dateStr}`}
                    className={`
                      relative aspect-square rounded-xl p-2 sm:p-3 cursor-pointer transition-all border-2 group text-left
                      ${isToday ? 'border-primary bg-primary/10' :
                        isSelected ? 'border-foreground bg-foreground text-background shadow-lg' :
                        'border-transparent bg-card hover:border-primary/40 hover:shadow-md'}
                    `}
                  >
                    <span className={`text-xs sm:text-sm font-black ${isToday && !isSelected ? 'text-[hsl(var(--accent))]' : isSelected ? 'text-background' : 'text-muted-foreground'}`}>{day}</span>
                    {meals.length > 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-3 overflow-hidden">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden flex items-center justify-center bg-muted transition-transform group-hover:scale-110">
                          {hasPhoto(meals[0].image) ? (
                            <img src={meals[0].image} alt={meals[0].title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-hand text-base text-muted-foreground">{(meals[0].title || '?')[0]}</span>
                          )}
                        </div>
                        {meals.length > 1 && <span className={`text-[8px] font-black mt-0.5 ${isSelected ? 'text-background/60' : 'text-muted-foreground'}`}>+{meals.length - 1}</span>}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day panel */}
          <div className="bg-secondary border border-border rounded-2xl p-6 sm:p-8 h-fit lg:sticky lg:top-20">
            {selectedDate ? (
              <div className="flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted-foreground mb-1">Planning For</h3>
                    <p className="font-serif text-xl font-semibold text-foreground tracking-tight">
                      {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  {!showRecipePicker && (
                    <button onClick={() => setShowRecipePicker(true)} aria-label="Add a meal" className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center shadow-md hover:scale-110 transition-all">
                      <Plus className="w-5 h-5" strokeWidth={3} />
                    </button>
                  )}
                </div>

                <div className="max-h-[50vh] overflow-y-auto scrollbar-hide -mx-2 px-2">
                  {showRecipePicker ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[hsl(var(--accent))]">Pick a Recipe</span>
                        <button onClick={() => setShowRecipePicker(false)} className="text-[10px] font-extrabold uppercase text-muted-foreground">Cancel</button>
                      </div>
                      {recipes.map((r: any) => (
                        <button key={r.id} onClick={() => handleAddMeal(r)} className="w-full group p-3 bg-card rounded-xl border border-border hover:border-primary/50 transition-all flex items-center gap-3 text-left">
                          <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                            {hasPhoto(r.image) ? (
                              <img src={r.image} alt={r.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                              <span className="font-hand text-lg text-muted-foreground">{(r.title || '?')[0]}</span>
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
                        <div className="text-center py-10">
                          <p className="font-hand text-lg text-muted-foreground -rotate-1">Nothing planned yet.<br />What sounds good?</p>
                        </div>
                      ) : (
                        mealPlan[selectedDate].map((m: any, i: number) => (
                          <div key={i} className="bg-card rounded-xl p-5 shadow-md border border-border relative group">
                            <button onClick={() => handleRemoveMeal(selectedDate, i)} aria-label="Remove meal" className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110">
                              <X className="w-4 h-4" strokeWidth={3} />
                            </button>
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex items-center justify-center shrink-0">
                                {hasPhoto(m.image) ? (
                                  <img src={m.image} alt={m.title} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-hand text-xl text-muted-foreground">{(m.title || '?')[0]}</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-serif font-semibold text-foreground leading-tight">{m.title}</h4>
                                <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mt-1">{m.cookTime}</p>
                              </div>
                            </div>
                            <button onClick={() => setShowCalendarExport({ meal: m, date: selectedDate })} className="w-full py-3 bg-muted hover:bg-border rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-foreground transition-all flex items-center justify-center gap-2">
                              <Calendar className="w-4 h-4" />
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
              <div className="flex flex-col items-center justify-center text-center py-12">
                <Calendar className="w-10 h-10 text-muted-foreground/40 mb-4" />
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2 tracking-tight">Select a Date</h3>
                <p className="font-hand text-lg text-muted-foreground max-w-[220px] -rotate-1">Choose a day to start planning the family's meals.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calendar Export Overlay */}
      {showCalendarExport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in" onClick={() => setShowCalendarExport(null)}>
          <div className="bg-card border border-border rounded-2xl p-10 max-w-sm w-full shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-8">
              <h3 className="font-serif text-2xl font-semibold text-foreground tracking-tight mb-2">Sync to Calendar</h3>
              <p className="text-muted-foreground text-sm">Don't forget to cook <span className="font-bold text-foreground">{showCalendarExport.meal.title}</span>!</p>
            </div>

            <div className="space-y-3">
              <button onClick={() => { window.open(getGoogleCalendarUrl(showCalendarExport.meal, showCalendarExport.date), '_blank'); setShowCalendarExport(null); }} className="w-full flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-border transition-all group">
                <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center shadow-sm font-serif font-bold">G</div>
                <span className="flex-1 font-bold text-foreground text-left">Google Calendar</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
              </button>
              <button onClick={() => downloadICS(showCalendarExport.meal, showCalendarExport.date)} className="w-full flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-border transition-all group">
                <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center shadow-sm"><Calendar className="w-5 h-5" /></div>
                <span className="flex-1 font-bold text-foreground text-left">Apple / Outlook</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
              </button>
            </div>

            <button onClick={() => setShowCalendarExport(null)} className="w-full mt-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(MealPlannerPage);
