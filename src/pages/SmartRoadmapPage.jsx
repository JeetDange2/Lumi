import React, { useState } from "react";

export default function SmartRoadmapPage() {

  const [form, setForm] = useState({
    name: "",
    field: "",
    level: "",
    goal: "",
  });

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);

    const prompt = `Generate a roadmap for ${form.field} for a ${form.level} student aiming to ${form.goal}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.sk - proj - hr - FiOzma6HdJp3J63qDqFBIgfMq3OpmdCFC4dbsdimFninH7kK6wUWcIyg_dVnGBfoEivcMzIT3BlbkFJnMAf4gw010IxoFAhg6JPIxqrlMzXdumeBW4Zd6w8Ihq_armffY4hE - D1FePdJ3ZJotOm9E99oA,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-opus-4-5",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || "";

      setRoadmap(text);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white">

      {/* HERO UI (Code 1) */}
      <div className="px-10 py-20 flex flex-col items-center text-center">

        <h1 className="text-5xl font-bold mb-6">
          AI Roadmap Generator 🚀
        </h1>

        <p className="text-gray-400 mb-10 max-w-xl">
          Generate your personalized learning roadmap using AI
        </p>

        {/* FORM (from Code 2 logic) */}
        <div className="bg-[#18181b] p-6 rounded-xl w-full max-w-md space-y-4">

          <input
            placeholder="Your Name"
            className="w-full p-3 rounded bg-black border border-gray-700"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Field (e.g. Web Dev)"
            className="w-full p-3 rounded bg-black border border-gray-700"
            onChange={(e) => setForm({ ...form, field: e.target.value })}
          />

          <input
            placeholder="Level (Beginner/Intermediate)"
            className="w-full p-3 rounded bg-black border border-gray-700"
            onChange={(e) => setForm({ ...form, level: e.target.value })}
          />

          <input
            placeholder="Goal"
            className="w-full p-3 rounded bg-black border border-gray-700"
            onChange={(e) => setForm({ ...form, goal: e.target.value })}
          />

          <button
            onClick={handleGenerate}
            className="w-full bg-violet-600 p-3 rounded font-semibold hover:bg-violet-500"
          >
            {loading ? "Generating..." : "Generate Roadmap"}
          </button>
        </div>

        {/* RESULT */}
        {roadmap && (
          <div className="mt-10 bg-[#18181b] p-6 rounded-xl max-w-2xl text-left whitespace-pre-wrap">
            {roadmap}
          </div>
        )}

      </div>
    </div>
  );
}