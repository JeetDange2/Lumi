import { useState } from "react";
import axios from "axios";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const SmartRoadMap = () => {
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(false);

  const renderChart = (steps) => {
    const colors = ["#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e"];

    // 1. Create a Root Context Node
    const rootNode = {
      id: "root",
      data: {
        label: (
          <div className="flex flex-col items-center justify-center p-2 text-center gap-2">
            <span className="bg-white/10 text-white/70 text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full w-fit">
              Your Roadmap
            </span>
            <strong className="text-white text-xl capitalize leading-tight">{goal}</strong>
            <span className="text-cyan-400 font-medium text-sm">Level: {level}</span>
          </div>
        )
      },
      position: { x: window.innerWidth / 2 - 150, y: 0 },
      style: {
        padding: 20,
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.4))",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "#fff",
        width: 320,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.6)",
      },
    };

    // 2. Create Flow Nodes for Steps
    const stepNodes = steps.map((step, index) => {
      const color = colors[index % colors.length];
      return {
        id: `${index}`,
        data: {
          label: (
            <div className="flex flex-col gap-1 text-left">
              <strong className="text-base" style={{ color }}>{step.title}</strong>
              {step.info && <p className="text-zinc-300 text-xs mt-2 leading-relaxed">{step.info}</p>}
            </div>
          )
        },
        position: { x: window.innerWidth / 2 - 150, y: (index + 1) * 200 },
        style: {
          padding: 16,
          borderRadius: 12,
          border: `2px solid ${color}40`,
          backgroundColor: "rgba(24, 24, 27, 0.95)",
          color: "#fff",
          width: 320,
          boxShadow: `0 4px 20px -2px ${color}20`,
        },
      };
    });

    const flowNodes = [rootNode, ...stepNodes];

    // 3. Create Edges linking Root -> Step 0, Step 0 -> Step 1, etc.
    const flowEdges = [
      {
        id: `e-root-0`,
        source: "root",
        target: "0",
        animated: true,
        style: { stroke: "#fff", strokeWidth: 2, opacity: 0.5 }
      },
      ...steps.slice(1).map((_, index) => {
        const color = colors[index % colors.length];
        return {
          id: `e${index}-${index + 1}`,
          source: `${index}`,
          target: `${index + 1}`,
          animated: true,
          style: { stroke: color, strokeWidth: 2 }
        };
      })
    ];

    setNodes(flowNodes);
    setEdges(flowEdges);
  };

  const generateRoadmap = async () => {
    if (!goal || !level) {
      alert("Please enter a goal and a difficulty level!");
      return;
    }

    setLoading(true);

    const apiKey = import.meta.env.VITE_GROQ_API_KEY;

    // Simulation Fallback Architecture for Hackathon
    // Triggers if you haven't put a real API key in the .env file!
    if (!apiKey) {
      setTimeout(() => {
        const simulatedSteps = [
          { title: `Phase 1: Intro to ${goal}`, info: `Start by understanding the fundamental architecture, basic terminology, and core syntax involved in ${goal}.` },
          { title: `Phase 2: Core Infrastructure`, info: `Dive deep into the primary mechanisms shaping ${goal} tailored specifically for a ${level} learner.` },
          { title: `Phase 3: Deep Work Execution`, info: `Set up your development environment and install the industry-standard tools required.` },
          { title: `Phase 4: Practical Applications`, info: `Time to build. Construct 3 micro-projects applying the theoretical knowledge to solve real-world problems.` },
          { title: `Phase 5: Advanced Mastery`, info: `Explore extreme edge cases, optimize algorithmic performance, and understand advanced design blueprints.` }
        ];
        renderChart(simulatedSteps);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: `Create a structured learning roadmap for "${goal}" for a ${level} student.
Return ONLY a raw JSON array of objects strictly in this format without markdown wrappers:
[{"title": "Step 1: Basics", "info": "Detailed description of what to learn..."}, {"title": "Step 2: Advanced", "info": "Detailed description..."}]`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      let steps = [];

      try {
        let textResponse = response.data.choices[0].message.content;
        textResponse = textResponse.replace(/```json/g, "").replace(/```/g, "").trim();
        steps = JSON.parse(textResponse);
      } catch (err) {
        console.error("JSON parse failed. Fallback triggered.", err);
        // Fallback if AI returns plain list
        const rawSteps = response.data.choices[0].message.content.split("\n").filter(s => s.trim().length > 3);
        steps = rawSteps.map(s => ({ title: s.replace(/^[0-9.-]+\s*/, ''), info: "" }));
      }

      renderChart(steps);
    } catch (error) {
      console.error(error);

      // Secondary fallback if API request itself crashes (e.g. rate limit)
      const simulatedSteps = [
        { title: `Phase 1: Introduction to ${goal}`, info: `Learn the fundamentals, terminology, and core concepts of ${goal}.` },
        { title: `Phase 2: Core Principles`, info: `Dive deep into the primary mechanisms shaping ${goal}.` },
        { title: `Phase 3: Practical Application`, info: `Build projects tailored to a ${level} understanding.` },
      ];
      renderChart(simulatedSteps);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#0f0f11] text-white p-6 lg:p-12 relative overflow-hidden">

      {/* Glow blobs background */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-violet-700 opacity-10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col h-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
            Smart{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 tracking-tight">
              Roadmap Generator
            </span>
          </h1>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Input your goal and let AI map out the exact path you need to take to master your target field.
          </p>
        </div>

        {/* Input Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-[#18181b]/80 backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl shadow-2xl w-full max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Enter your goal (e.g. Data Science)"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full md:w-48 bg-[#0f0f11] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
          >
            <option value="" className="text-zinc-500 bg-[#0f0f11]">Select Level</option>
            <option value="beginner" className="bg-[#0f0f11]">Beginner</option>
            <option value="intermediate" className="bg-[#0f0f11]">Intermediate</option>
            <option value="advanced" className="bg-[#0f0f11]">Advanced</option>
          </select>

          <button
            onClick={generateRoadmap}
            disabled={loading}
            className="bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm px-8 py-3.5 rounded-xl transition-all duration-200 active:scale-95 shadow-lg shadow-violet-900/40 whitespace-nowrap min-w-[140px]"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Generating...
              </span>
            ) : (
              "Generate Flowchart"
            )}
          </button>
        </div>

        {/* Flowchart Section */}
        <div className="flex-1 min-h-[500px] md:min-h-[600px] w-full bg-[#18181b]/40 backdrop-blur-sm border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl relative">
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 gap-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <p className="font-medium text-sm">Your AI generated flowchart will appear here.</p>
            </div>
          ) : (
            <ReactFlow nodes={nodes} edges={edges} fitView minZoom={0.5} maxZoom={2}>
              <Background color="#52525b" gap={16} size={1} />
              <Controls className="bg-[#0f0f11] border border-white/10 fill-white rounded-xl overflow-hidden shadow-xl" />
            </ReactFlow>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartRoadMap;