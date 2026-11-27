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
    <div className="p-6 max-w-2xl mx-auto min-h-screen" style={{ backgroundColor: "#e8e0f5" }}>
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Meridian</h1>

      <div className="flex flex-col gap-2 mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <input
          className="border border-gray-300 p-2 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Assignment title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border border-gray-300 p-2 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Course (optional)"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />
        <input
          type="datetime-local"
          className="border border-gray-300 p-2 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={due}
          onChange={(e) => setDue(e.target.value)}
        />
        <button
          onClick={addAssignment}
          className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 font-medium"
        >
          Add Assignment
        </button>
      </div>

      <div className="space-y-3">
        {assignments
          .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime())
          .map((a) => {
            const dueDate = new Date(a.due);
            const isOverdue = now ? dueDate < now : false;
            return (
              <div
                key={a.id}
                className={`rounded-lg p-4 flex justify-between items-start shadow-sm border ${
                  isOverdue
                    ? "bg-red-100 border-red-300"
                    : "bg-white border-gray-200"
                }`}
              >
                <div>
                  <div className="font-semibold text-gray-900">{a.title}</div>
                  <div className="text-sm text-gray-700">{a.course}</div>
                  <div className="text-sm mt-1 text-gray-800">
                    Due: {dueDate.toLocaleString()}
                    {isOverdue && (
                      <span className="ml-2 bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded">
                        Overdue
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => sendReminder(a)}
                    className="text-sm text-purple-600 hover:text-purple-800"
                  >
                    Remind
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className="text-gray-500 hover:text-red-600 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}