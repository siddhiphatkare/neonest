// app/Growth/page.js
"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, BarChart3, Pencil, Trash2, CalendarIcon } from "lucide-react";
import { Button } from "../components/ui/Button";
import Input from "../components/ui/Input";
import InteractionWithBaby from "../components/InteractionWithBaby";
import MilestoneTracker from "../components/MilestoneTracker";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { useAuth } from "../context/AuthContext";
import LoginPrompt from "../components/LoginPrompt";

import GrowthChart from "./GrowthChart";

// Custom DatePicker Component
const DatePicker = ({ value, onChange, placeholder = "Select date" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value || "");

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  // Generate calendar days
  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return { year, month: month - 1, day };
  };

  const handleDateSelect = (day) => {
    const newDate = formatDate(viewYear, viewMonth, day);
    setSelectedDate(newDate);
    onChange(newDate);
    setIsOpen(false);
  };

  const goToPreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const days = getDaysInMonth(viewYear, viewMonth);
  const parsedSelectedDate = parseDate(selectedDate);
  const isSelectedMonth = parsedSelectedDate && parsedSelectedDate.year === viewYear && parsedSelectedDate.month === viewMonth;

  return (
    <div className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer flex items-center justify-between bg-white"
      >
        <span className={selectedDate ? "text-gray-900" : "text-gray-500"}>
          {selectedDate || placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-gray-400" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-white border rounded-lg shadow-lg p-4 min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 rounded"
              type="button"
            >
              ←
            </button>
            <div className="font-semibold">
              {monthNames[viewMonth]} {viewYear}
            </div>
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
              type="button"
            >
              →
            </button>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <div key={index} className="text-center">
                {day && (
                  <button
                    onClick={() => handleDateSelect(day)}
                    className={`w-8 h-8 text-sm rounded hover:bg-indigo-100 ${
                      isSelectedMonth && parsedSelectedDate.day === day
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-700'
                    }`}
                    type="button"
                  >
                    {day}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div className="mt-4 pt-3 border-t flex justify-between">
            <button
              onClick={() => {
                const todayStr = today.toISOString().split('T')[0];
                setSelectedDate(todayStr);
                onChange(todayStr);
                setIsOpen(false);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800"
              type="button"
            >
              Today
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function GrowthPage() {
  const { isAuth } = useAuth();
  
  useEffect(() => {
    document.title = "Growth | NeoNest";
  }, []);

  const [growthLogs, setGrowthLogs] = useState([]);
  const [newEntry, setNewEntry] = useState({
    date: "",
    height: "",
    weight: "",
    head: "",
    comment: "",
  });
  const [editId, setEditId] = useState(null);
  const [babyDOB, setBabyDOB] = useState("");
  const [babyGender, setBabyGender] = useState("");
  const [showWHO, setShowWHO] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("growthLogs");
    if (saved) setGrowthLogs(JSON.parse(saved));

    const dob = localStorage.getItem("babyDOB");
    if (dob) setBabyDOB(dob);

    const gender = localStorage.getItem("babyGender");
    if (gender) setBabyGender(gender);
  }, []);

  useEffect(() => {
    if (babyDOB) localStorage.setItem("babyDOB", babyDOB);
  }, [babyDOB]);

  useEffect(() => {
    if (babyGender) localStorage.setItem("babyGender", babyGender);
  }, [babyGender]);

  const getMonthsSinceDOB = (dateStr) => {
    if (!babyDOB || !dateStr) return 0;
    const birthDate = new Date(babyDOB);
    const entryDate = new Date(dateStr);
    return Math.max(
      0,
      (entryDate.getFullYear() - birthDate.getFullYear()) * 12 +
        (entryDate.getMonth() - birthDate.getMonth())
    );
  };

  const getWHOHeight = (dateStr) => {
    const months = getMonthsSinceDOB(dateStr);
    return months <= 24 ? (49 + months * 1.5).toFixed(1) : "";
  };

  const getWHOWeight = (dateStr) => {
    const months = getMonthsSinceDOB(dateStr);
    return months <= 24 ? (3.5 + months * 0.5).toFixed(1) : "";
  };

  const addGrowthEntry = () => {
    if (!newEntry.date || !newEntry.height || !newEntry.weight) return;
    const withWHO = {
      ...newEntry,
      whoHeight: getWHOHeight(newEntry.date),
      whoWeight: getWHOWeight(newEntry.date),
    };
    if (editId) {
      const updated = growthLogs.map((log) => (log.id === editId ? { ...log, ...withWHO } : log));
      setGrowthLogs(updated);
      localStorage.setItem("growthLogs", JSON.stringify(updated));
      setEditId(null);
    } else {
      const updated = [...growthLogs, { id: Date.now(), ...withWHO }];
      setGrowthLogs(updated);
      localStorage.setItem("growthLogs", JSON.stringify(updated));
    }
    
    // Notify the growth chart component
    window.dispatchEvent(new Event('growthDataUpdated'));
    
    setNewEntry({ date: "", height: "", weight: "", head: "", comment: "" });
  };

  const deleteEntry = (id) => {
    const updated = growthLogs.filter((log) => log.id !== id);
    setGrowthLogs(updated);
    localStorage.setItem("growthLogs", JSON.stringify(updated));
    
    // Notify the growth chart component
    window.dispatchEvent(new Event('growthDataUpdated'));
  };

  const editEntry = (log) => {
    setNewEntry(log);
    setEditId(log.id);
  };

  const milestones = [
    { age: "0-1 month", tasks: ["Lifts head slightly", "Responds to sound"] },
    { age: "2-3 months", tasks: ["Smiles at people", "Follows movement"] },
    { age: "4-6 months", tasks: ["Rolls over", "Begins to babble"] },
    { age: "7-9 months", tasks: ["Sits without support", "Responds to own name"] },
  ];

  const [checkedMilestones, setCheckedMilestones] = useState({});
  const toggleMilestone = (age, task) => {
    const key = `${age}:${task}`;
    setCheckedMilestones((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasBadge = checkedMilestones["4-6 months:Rolls over"] && checkedMilestones["7-9 months:Sits without support"];

  const calculateBabyAge = () => {
    if (!babyDOB) return "";
    const dobDate = new Date(babyDOB);
    const now = new Date();
    const diffMonths = (now.getFullYear() - dobDate.getFullYear()) * 12 + (now.getMonth() - dobDate.getMonth());
    if (diffMonths < 1) return "0-1 month";
    if (diffMonths < 3) return "2-3 months";
    if (diffMonths < 6) return "4-6 months";
    if (diffMonths < 9) return "7-9 months";
    return "10+ months";
  };

  // Show login prompt if user is not authenticated
  if (!isAuth) {
    return <LoginPrompt sectionName="growth tracking" />;
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Growth Tracker</h2>
      <p className="text-gray-600">Log your baby's growth, track milestones, and visualize progress over time.</p>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Baby Information</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <DatePicker 
            placeholder="Date of Birth" 
            value={babyDOB} 
            onChange={(date) => setBabyDOB(date)} 
          />
          <select
            value={babyGender}
            onChange={(e) => setBabyGender(e.target.value)}
            className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        {babyDOB && (
          <p className="text-sm text-gray-600">
            Baby is in age group: <strong>{calculateBabyAge()}</strong>
            {babyGender && (
              <span className="ml-4">
                Gender: <strong>{babyGender === "male" ? "Boy" : "Girl"}</strong>
              </span>
            )}
          </p>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <h3 className="text-xl font-semibold">{editId ? "Edit Growth Entry" : "Log Growth Entry"}</h3>
        <div className="grid grid-cols-2 gap-3">
          <DatePicker 
            placeholder="Select Date" 
            value={newEntry.date} 
            onChange={(date) => setNewEntry({ ...newEntry, date })} 
          />
          <Input placeholder="Height (cm)" value={newEntry.height} onChange={(e) => setNewEntry({ ...newEntry, height: e.target.value })} />
          <Input placeholder="Weight (kg)" value={newEntry.weight} onChange={(e) => setNewEntry({ ...newEntry, weight: e.target.value })} />
          <Input placeholder="Head Circumference (cm)" value={newEntry.head} onChange={(e) => setNewEntry({ ...newEntry, head: e.target.value })} />
          <Input placeholder="Comment" value={newEntry.comment} onChange={(e) => setNewEntry({ ...newEntry, comment: e.target.value })} />
        </div>
        <Button className="mt-2 bg-indigo-500 text-white" onClick={addGrowthEntry}>
          <Plus className="w-4 h-4 mr-2" /> {editId ? "Update Entry" : "Add Entry"}
        </Button>
      </div>

      {growthLogs.length > 0 ? (
        <>
          <div className="bg-white p-4 rounded-lg shadow space-y-3">
            <h3 className="text-xl font-semibold">Growth Log Entries</h3>
            {growthLogs.map(log => (
              <div key={log.id} className="border-b py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <p className="font-medium">{log.date}</p>
                  <p className="text-sm text-gray-600">📏 {log.height} cm | ⚖️ {log.weight} kg | 🧠 {log.head} cm</p>
                  {log.comment && <p className="text-xs italic text-gray-500">"{log.comment}"</p>}
                </div>
                <div className="flex gap-3">
                  <Pencil className="text-indigo-600 cursor-pointer" onClick={() => editEntry(log)} />
                  <Trash2 className="text-red-500 cursor-pointer" onClick={() => deleteEntry(log.id)} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <BarChart3 /> Growth Chart
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={growthLogs} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  label={{ value: "Date", position: "insideBottom", offset: -20 }} 
                />
                <YAxis yAxisId="left" label={{ value: "Height (cm)", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: "Weight (kg)", angle: 90, position: "insideRight" }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="height" fill="#ec4899" name="Your Baby - Height" />
                {showWHO && <Bar yAxisId="left" dataKey="whoHeight" fill="#10b981" name="WHO Height" />}
                <Bar yAxisId="right" dataKey="weight" fill="#818cf8" name="Your Baby - Weight" />
                {showWHO && <Bar yAxisId="right" dataKey="whoWeight" fill="#facc15" name="WHO Weight" />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 italic">No entries yet? Start logging to unlock the growth chart! 📈</div>
      )}

      {/* ===== ML Predictive Chart (separate, non-WHO) ===== */}
      <GrowthChart defaultMonths={6} />

      <div className="space-y-6">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Developmental Milestones</h3>
          <MilestoneTracker babyDOB={babyDOB} />
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <InteractionWithBaby />
        </div>
      </div>

      {hasBadge && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
          🏆 Congratulations! Your baby unlocked the <strong>Milestone Badge</strong> for "Rolling over" and "Sitting without support"!
        </div>
      )}

      <div className="text-center text-gray-500 text-sm py-8">
        For more information regarding this section, visit{" "}
        <a href="/Resources" className="text-pink-600 hover:underline">Resources</a> or{" "}
        <a href="/Faqs" className="text-pink-600 hover:underline">FAQs</a>.
      </div>
    </div>
  );
}