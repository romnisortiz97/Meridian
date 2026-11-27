"use client";

import { useState, useEffect } from "react";

type Assignment = {
  id: string;
  title: string;
  due: string;
  course: string;
};

export default function Home() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [due, setDue] = useState("");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("meridian-assignments");
    if (saved) setAssignments(JSON.parse(saved));
    setNow(new Date());
  }, []);

  useEffect(() => {
    localStorage.setItem("meridian-assignments", JSON.stringify(assignments));
  }, [assignments]);

  const addAssignment = () => {
    if (!title.trim() || !due) return;
    setAssignments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: title.trim(),
        course: course.trim() || "General",
        due,
      },
    ]);
    setTitle("");
    setCourse("");
    setDue("");
  };

  const remove = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const sendReminder = async (a: Assignment) => {
    const email = prompt("Send reminder to which email?");
    if (!email) return;

    const res = await fetch("/api/send-reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        title: a.title,
        due: a.due,
        course: a.course,
      }),
    });

    if (res.ok) {
      alert("Reminder sent!");
    } else {
      alert("Failed to send reminder");
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-black">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-600 mb-2 text-center">
          Meridian
        </h1>
        <p className="text-center text-gray-300 mb-8">
          Keep track of your assignments
        </p>

        {/* Main lilac box with soft glow outward */}
        <div
          className="rounded-3xl p-6 mb-8 shadow-2xl"
          style={{
            backgroundColor: "#e8e0f5",
            boxShadow: "0 0 80px 40px rgba(232, 224, 245, 0.4)",
          }}
        >
          <div className="space-y-3">
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              placeholder="Assignment title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              placeholder="Course (optional)"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
            <input
              type="datetime-local"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
              value={due}
              onChange={(e) => setDue(e.target.value)}
            />
            <button
              onClick={addAssignment}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-xl transition"
            >
              Add Assignment
            </button>
          </div>
        </div>

        {/* Assignment list */}
        <div className="space-y-3">
          {assignments.length === 0 && (
            <p className="text-center text-gray-400 py-8">
              No assignments yet. Add one above.
            </p>
          )}

          {assignments
            .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
            .map((a) => {
              const dueDate = new Date(a.due);
              const isOverdue = now ? dueDate < now : false;

              return (
                <div
                  key={a.id}
                  className={`rounded-2xl p-5 border flex justify-between items-start transition ${
                    isOverdue
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-gray-100"
                  }`}
                  style={{
                    boxShadow: "0 0 40px 15px rgba(232, 224, 245, 0.35)",
                  }}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-lg">
                      {a.title}
                    </div>
                    <div className="text-sm text-purple-600 font-medium mt-0.5">
                      {a.course}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      Due {dueDate.toLocaleString()}
                      {isOverdue && (
                        <span className="ml-2 inline-block bg-red-600 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => sendReminder(a)}
                      className="text-sm text-purple-600 hover:text-purple-800 font-medium px-3 py-1.5 rounded-lg hover:bg-purple-50 transition"
                    >
                      Remind
                    </button>
                    <button
                      onClick={() => remove(a.id)}
                      className="text-gray-400 hover:text-red-500 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
