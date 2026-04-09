import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../services/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function StudyPlannerPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Visibility toggle
  const [showPlanner, setShowPlanner] = useState(false);
  const plannerRef = useRef(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: "", type: "Study" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchEvents(currentUser.uid);
      } else {
        setEvents([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchEvents = async (uid) => {
    try {
      const q = query(collection(db, "planner_events"), where("userId", "==", uid));
      const querySnapshot = await getDocs(q);
      const fetchedEvents = [];
      querySnapshot.forEach((docSnap) => {
        fetchedEvents.push({ id: docSnap.id, ...docSnap.data() });
      });
      setEvents(fetchedEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPlanner = () => {
    setShowPlanner(true);
    setTimeout(() => {
      plannerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday

  // Navigation handlers
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const openModal = (day) => {
    setSelectedDate(new Date(year, month, day));
    setNewEvent({ title: "", type: "Study" });
    setIsModalOpen(true);
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim() || !user) return;
    
    // Normalize date
    const offset = selectedDate.getTimezoneOffset();
    const targetDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
    const dateStr = targetDate.toISOString().split("T")[0];

    try {
      const docRef = await addDoc(collection(db, "planner_events"), {
        userId: user.uid,
        date: dateStr,
        title: newEvent.title,
        type: newEvent.type,
        createdAt: new Date().toISOString()
      });
      setEvents([...events, { id: docRef.id, date: dateStr, title: newEvent.title, type: newEvent.type }]);
      setNewEvent({ title: "", type: "Study" });
    } catch (err) {
      console.error("Error adding event:", err);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteDoc(doc(db, "planner_events", id));
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  const getEventsForDay = (day) => {
    const targetDate = new Date(year, month, day);
    const offset = targetDate.getTimezoneOffset();
    const localDate = new Date(targetDate.getTime() - (offset * 60 * 1000));
    const dStr = localDate.toISOString().split("T")[0];
    return events.filter(e => e.date === dStr);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const EVENT_COLORS = {
    Exam: "bg-fuchsia-500",
    Study: "bg-cyan-500",
    Break: "bg-emerald-500"
  };

  const EVENT_BADGES = {
    Exam: "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30",
    Study: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
    Break: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
  };

  const renderCalendarDays = () => {
    const blanks = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        blanks.push(<div key={`blank-${i}`} className="border border-white/[0.03] bg-white/[0.01] p-3 text-transparent pointer-events-none">0</div>);
    }

    const days = [];
    const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split("T")[0];

    for (let d = 1; d <= daysInMonth; d++) {
        const targetDate = new Date(year, month, d);
        const offset = targetDate.getTimezoneOffset();
        const localDate = new Date(targetDate.getTime() - (offset * 60 * 1000));
        const currentDStr = localDate.toISOString().split("T")[0];
        
        let isTodayHighlight = false;
        if (currentDStr === todayStr) isTodayHighlight = true;

        const dayEvents = getEventsForDay(d);
        
        days.push(
            <div 
              key={`day-${d}`} 
              onClick={() => openModal(d)}
              className={`min-h-[100px] border border-white/[0.05] bg-[#18181b] p-3 hover:bg-white/[0.03] transition-colors cursor-pointer group hover:border-cyan-500/50 ${isTodayHighlight ? 'ring-1 ring-cyan-500' : ''}`}
            >
                <div className={`text-sm font-medium mb-1.5 inline-flex w-7 h-7 items-center justify-center rounded-full transition-colors ${isTodayHighlight ? 'bg-cyan-600 text-white' : 'text-zinc-400 group-hover:text-white'}`}>{d}</div>
                <div className="flex flex-col gap-1 mt-1">
                    {dayEvents.slice(0, 3).map((ev, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${EVENT_COLORS[ev.type] || 'bg-white'}`}></span>
                            <span className="text-[10px] text-zinc-100 truncate">{ev.title}</span>
                        </div>
                    ))}
                    {dayEvents.length > 3 && (
                        <span className="text-[10px] text-zinc-500 font-medium">+{dayEvents.length - 3} more</span>
                    )}
                </div>
            </div>
        );
    }

    return [...blanks, ...days];
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white font-sans relative overflow-x-hidden pb-12 custom-scrollbar">
      {/* Background aesthetics */}
      <div className="fixed inset-0 opacity-[0.035] pointer-events-none" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="fixed top-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full bg-cyan-700/20 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full bg-blue-700/10 blur-[130px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/home")}
          className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.1] transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </div>
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        {!user && !loading && (
          <span className="text-sm text-pink-400 bg-pink-500/10 px-3 py-1.5 rounded-full border border-pink-500/20 shadow-lg shadow-pink-900/20">
            Sign in to auto-save to cloud
          </span>
        )}
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 md:px-12 py-10 max-w-5xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Left Text */}
          <div className="flex-1">
            <span className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full mb-6 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2 animate-pulse" />
              Productivity
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              Master your time.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Unlock Focus.
              </span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              Organize your study sessions intelligently. Our planner uses smart time-blocking
              and spaced repetition to ensure you learn efficiently without burning out. Let
              the system schedule your revisions exactly when you need them.
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={handleOpenPlanner}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-cyan-900/40"
              >
                Create Schedule
              </button>
              <button className="bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] text-white font-medium px-8 py-3.5 rounded-xl transition-all duration-200 active:scale-95">
                Learn Time-blocking
              </button>
            </div>
          </div>

          {/* Right Visualizer */}
          <div className="flex-1 w-full max-w-md">
            <div className="bg-[#18181b]/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-400" />

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex items-center gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.05]">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Today, 10:00 AM</h3>
                    <p className="text-xs text-zinc-500">Deep Work: React Fundamentals</p>
                  </div>
                  <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">Completed</span>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-4 bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20 shadow-lg shadow-cyan-900/20">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-cyan-900/50">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Now, 2:30 PM</h3>
                    <p className="text-xs text-zinc-400">Review: JavaScript Closures</p>
                  </div>
                  <span className="ml-auto flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                  </span>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-4 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.05] opacity-60">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-400 flex items-center justify-center shrink-0 border border-zinc-700">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Next, 4:00 PM</h3>
                    <p className="text-xs text-zinc-500">Break & Reflection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Hidden/Revealed Calendar Section */}
      {showPlanner && (
        <section ref={plannerRef} className="relative z-10 px-6 md:px-12 pb-20 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-500 pt-10 border-t border-white/[0.05]">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Your Dashboard</h2>
                  <p className="text-sm text-zinc-400">Organize and track your upcoming learning sessions.</p>
              </div>
              
              {/* Month Controls */}
              <div className="flex items-center gap-3 bg-[#18181b] border border-white/[0.08] rounded-xl p-1.5 shadow-lg">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors text-zinc-400 hover:text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  </button>
                  <div className="w-36 text-center">
                      <span className="font-semibold text-white">{monthNames[month]} {year}</span>
                  </div>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors text-zinc-400 hover:text-white">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  </button>
                  <button onClick={goToday} className="ml-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-medium text-white transition-colors shadow-lg shadow-cyan-900/40">
                      Today
                  </button>
              </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-[#18181b]/60 border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
              <div className="grid grid-cols-7 border-b border-white/[0.08] bg-black/20">
                  {daysOfWeek.map(d => (
                      <div key={d} className="py-4 text-center text-xs font-medium text-zinc-400 uppercase tracking-widest">{d}</div>
                  ))}
              </div>
              <div className="grid grid-cols-7">
                  {renderCalendarDays()}
              </div>
          </div>
        </section>
      )}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-[#18181b] border border-white/[0.08] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors bg-white/[0.05] hover:bg-white/[0.1] rounded-full p-1.5 border border-white/[0.08]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <div className="p-7">
                <h2 className="text-xl font-semibold text-white mb-2">Schedule Activity</h2>
                <p className="text-sm text-zinc-400 mb-7">Plan your day for <span className="font-medium text-zinc-200">{monthNames[month]} {selectedDate?.getDate()}, {year}</span></p>
                
                <form onSubmit={handleAddEvent} className="space-y-5">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">Event Subject</label>
                        <input autoFocus required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="e.g. Master React Hooks" className="w-full bg-[#0f0f11] border border-white/[0.08] hover:border-white/[0.15] focus:border-cyan-500 ring-0 focus:ring-1 focus:ring-cyan-500/20 rounded-xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all shadow-inner" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">Event Type</label>
                        <div className="grid grid-cols-3 gap-2.5">
                           {["Study", "Break", "Exam"].map(type => (
                               <button 
                                 type="button" 
                                 key={type} 
                                 onClick={() => setNewEvent({...newEvent, type})}
                                 className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${newEvent.type === type ? EVENT_BADGES[type] : 'bg-[#0f0f11] border-white/[0.08] text-zinc-400 hover:border-white/[0.15] hover:text-zinc-200 shadow-inner'}`}
                               >
                                   {type}
                               </button>
                           ))}
                        </div>
                    </div>
                    <button disabled={!user && !newEvent.title} type="submit" className="w-full mt-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-colors shadow-lg shadow-cyan-900/40 active:scale-95 border border-cyan-500/50">
                        {user ? "Save Event" : "Sign in to Schedule"}
                    </button>
                </form>

                {/* Existing Day Events List */}
                {selectedDate && getEventsForDay(selectedDate.getDate()).length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/[0.08]">
                        <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3">Planned Activities</h3>
                        <div className="space-y-2.5 overflow-y-auto max-h-[160px] pr-1 custom-scrollbar">
                            {getEventsForDay(selectedDate.getDate()).map(ev => (
                                <div key={ev.id} className="flex flex-row items-center justify-between bg-[#0f0f11] border border-white/[0.05] rounded-xl p-3 shadow-inner hover:border-white/[0.1] transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${EVENT_COLORS[ev.type]}`}></div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white">{ev.title}</span>
                                            <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider mt-0.5">{ev.type}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteEvent(ev.id)} className="text-zinc-600 hover:text-pink-400 p-2 transition-colors opacity-0 group-hover:opacity-100 bg-white/[0.02] hover:bg-pink-500/10 rounded-lg">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
