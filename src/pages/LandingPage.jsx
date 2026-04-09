import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import { auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const cards = [
  {
    id: 1,
    title: "Smart Roadmap Generator",
    description: "AI-powered learning paths tailored to your goals. Get a personalized step-by-step roadmap to master any skill faster.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
    color: "violet",
    tag: "AI Powered",
    stats: "500+ paths",
  },
  {
    id: 2,
    title: "Study Planner",
    description: "Organize your study sessions intelligently. Schedule, track, and optimize your learning with smart time-blocking tools.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
    color: "cyan",
    tag: "Productivity",
    stats: "10k+ sessions",
  },
  {
    id: 3,
    title: "Performance Tracker",
    description: "Visualize your progress with real-time analytics. Identify strengths, weaknesses, and milestones at a glance.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
    color: "emerald",
    tag: "Analytics",
    stats: "Live insights",
  },
  {
    id: 4,
    title: "Social",
    description: "Connect with learners worldwide. Share progress, join study groups, and grow together in a vibrant community.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "pink",
    tag: "Community",
    stats: "50k+ members",
  },
];

const colorMap = {
  violet: {
    bg: "bg-violet-500/10",
    icon: "text-violet-400",
    border: "border-violet-500/30",
    tag: "bg-violet-500/10 text-violet-400",
    glow: "hover:shadow-violet-900/30",
    dot: "bg-violet-400",
    btn: "text-violet-400 hover:text-violet-300",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    icon: "text-cyan-400",
    border: "border-cyan-500/30",
    tag: "bg-cyan-500/10 text-cyan-400",
    glow: "hover:shadow-cyan-900/30",
    dot: "bg-cyan-400",
    btn: "text-cyan-400 hover:text-cyan-300",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    icon: "text-emerald-400",
    border: "border-emerald-500/30",
    tag: "bg-emerald-500/10 text-emerald-400",
    glow: "hover:shadow-emerald-900/30",
    dot: "bg-emerald-400",
    btn: "text-emerald-400 hover:text-emerald-300",
  },
  pink: {
    bg: "bg-pink-500/10",
    icon: "text-pink-400",
    border: "border-pink-500/30",
    tag: "bg-pink-500/10 text-pink-400",
    glow: "hover:shadow-pink-900/30",
    dot: "bg-pink-400",
    btn: "text-pink-400 hover:text-pink-300",
  },
};

function FeatureCard({ card }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const c = colorMap[card.color];

  const handleClick = () => {
    if (card.id === 1) {
      navigate('/roadmap-generator');
    } else if (card.id === 2) {
      navigate('/study-planner');
    } else if (card.id === 3) {
      navigate('/performance-tracker');
    } else if (card.id === 4) {
      navigate('/social');
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative group bg-[#18181b] border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl ${c.glow} ${hovered ? `border-${card.color}-500/30` : "border-white/[0.06]"
        }`}
      style={{
        borderColor: hovered ? undefined : "rgba(255,255,255,0.06)",
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-5">
        <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.icon} flex items-center justify-center transition-transform duration-300 ${hovered ? "scale-110" : ""}`}>
          {card.icon}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.tag}`}>
          {card.tag}
        </span>
      </div>

      {/* Content */}
      <h3 className="text-white font-semibold text-lg mb-2 leading-snug">{card.title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed mb-5">{card.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
          <span className="text-xs text-zinc-500">{card.stats}</span>
        </div>
        <button className={`text-xs font-medium flex items-center gap-1 transition-colors ${c.btn}`}>
          Explore
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function AIChatbotSection() {
  useEffect(() => {
    if (!document.getElementById("thinkstack-script")) {
      const script = document.createElement("script");
      script.id = "thinkstack-script";
      script.setAttribute("chatbot_id", "69d51079cf001516ca5eb288");
      script.setAttribute("data-type", "bar");
      script.src = "https://app.thinkstack.ai/bot/thinkstackai-loader.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return null;
}

export default function LandingPage() {
  const [showAIChatbot, setShowAIChatbot] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToAIAssistant = () => {
    setShowAIChatbot(true);
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white font-sans relative overflow-hidden">

      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow blobs */}
      <div className="fixed top-[-150px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-violet-700 opacity-10 blur-[130px] pointer-events-none" />
      <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full bg-pink-700 opacity-8 blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/[0.05]">
        <Logo size="md" />
        <div className="hidden md:flex items-center gap-7 text-sm text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Community</a>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <button onClick={handleLogout} className="text-sm text-zinc-400 hover:text-white transition-colors hidden md:block">
              Log out
            </button>
          ) : (
            <a href="/" className="text-sm text-zinc-400 hover:text-white transition-colors hidden md:block">Sign in</a>
          )}
          <button onClick={scrollToFeatures} className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-violet-900/40">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-1.5 text-xs text-zinc-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />

        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Learn smarter.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
            Grow faster.
          </span>
        </h1>
        <p className="mt-5 text-zinc-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Everything you need to master new skills — AI roadmaps, smart scheduling, deep analytics, and a community that pushes you forward.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={scrollToFeatures} className="bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm px-6 py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-violet-900/40">
            Start To Grow
          </button>
          <button onClick={scrollToAIAssistant} className="bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] text-white font-medium text-sm px-6 py-3 rounded-xl transition-all duration-200 active:scale-95">
            AI Assistant
          </button>
        </div>
      </section>

      {/* Cards section */}
      <section id="features" className="relative z-10 px-6 md:px-12 pb-20 max-w-6xl mx-auto pt-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Everything in one place</h2>
          <p className="text-zinc-500 text-sm mt-2">Four powerful tools. One seamless platform.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card) => (
            <FeatureCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="relative z-10 px-6 md:px-12 pb-20 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-violet-600/20 to-pink-600/20 border border-white/[0.07] rounded-2xl px-8 py-10 text-center">
          <h3 className="text-2xl font-semibold text-white mb-2">Ready to level up?</h3>
          <p className="text-zinc-400 text-sm mb-6">Join 50,000+ learners already building their future.</p>
          <button className="bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm px-8 py-3 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-violet-900/40">
            Get started for free
          </button>
        </div>
      </section>

      {/* AI Chatbot Section */}
      {showAIChatbot && <AIChatbotSection />}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <span className="text-xs text-zinc-600">© 2026 Lumi. All rights reserved.</span>
        <div className="flex items-center gap-5 text-xs text-zinc-600">
          <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
          <a href="#" className="hover:text-zinc-400 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}