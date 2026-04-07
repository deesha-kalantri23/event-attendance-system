import { motion } from "framer-motion";
import {
  CalendarDays, Users, Clock, CheckCircle2
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, Tooltip,
  ResponsiveContainer,
  RadialBarChart, RadialBar,
  CartesianGrid
} from "recharts";

const BASE_URL = "http://localhost:3000";

const Dashboard = () => {

  const [events, setEvents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/events`)
      .then(res => res.json())
      .then(data => setEvents(data));
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/attendance`)
      .then(res => res.json())
      .then(data => setAttendanceRecords(data))
      .finally(() => setLoading(false));
  }, []);

  // ================= CALCULATIONS =================
  const total = events.length;
  const upcoming = events.filter(e => e.status === "Upcoming").length;
  const ongoing = events.filter(e => e.status === "Ongoing").length;
  const completed = events.filter(e => e.status === "Completed").length;

  const totalStudents = new Set(attendanceRecords.map(r => r.roll_no)).size;
  const totalPresent = attendanceRecords.filter(r => r.status === "Present").length;
  const totalPending = attendanceRecords.filter(r => r.status === "Pending").length;
  const totalAbsent = attendanceRecords.filter(r => r.status === "Absent").length;

  const attendanceRate = attendanceRecords.length
    ? Math.round((totalPresent / attendanceRecords.length) * 100)
    : 0;

  const statusData = [
    { name: "Present", value: totalPresent },
    { name: "Pending", value: totalPending },
    { name: "Absent", value: totalAbsent },
  ];

  const eventData = events.map(event => {
  const records = attendanceRecords.filter(
    r => r.event_name === event.event_name
  );

  const present = records.filter(r => r.status === "Present").length;
  const absent = records.filter(r => r.status === "Absent").length;
  const pending = records.filter(r => r.status === "Pending").length;
  const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border text-sm">
        <p className="font-semibold text-gray-700">
          {payload[0].name}
        </p>
        <p className="text-gray-600">
          Count: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};
  return {
    name: event.event_name,
    present,
    pending,
    absent
  };
});
  

  return (
    <div className="container py-8 space-y-8">

      {/* HEADER */}
      <motion.div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-500">Real-time overview of your system</p>
      </motion.div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <>
          {/* ================= STATS ================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

  {/* TOTAL EVENTS */}
  <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-2xl p-5 shadow hover:shadow-xl transition">
    <div className="flex items-center gap-3">
      <div className="p-3 bg-blue-100 rounded-xl">
        <CalendarDays className="text-blue-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Total Events</p>
        <h2 className="text-2xl font-bold text-blue-700">{total}</h2>
        <p className="text-xs text-gray-400">All registered events</p>
      </div>
    </div>
  </div>

  {/* STUDENTS */}
  <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl p-5 shadow hover:shadow-xl transition">
    <div className="flex items-center gap-3">
      <div className="p-3 bg-green-100 rounded-xl">
        <Users className="text-green-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Students</p>
        <h2 className="text-2xl font-bold text-green-700">{totalStudents}</h2>
        <p className="text-xs text-gray-400">Registered students</p>
      </div>
    </div>
  </div>

  {/* UPCOMING */}
  <div className="bg-gradient-to-br from-yellow-50 to-white border border-yellow-200 rounded-2xl p-5 shadow hover:shadow-xl transition">
    <div className="flex items-center gap-3">
      <div className="p-3 bg-yellow-100 rounded-xl">
        <Clock className="text-yellow-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Upcoming</p>
        <h2 className="text-2xl font-bold text-yellow-700">{upcoming}</h2>
        <p className="text-xs text-gray-400">Events coming soon</p>
      </div>
    </div>
  </div>

  {/* ATTENDANCE RATE */}
  <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-2xl p-5 shadow hover:shadow-xl transition">
    <div className="flex items-center gap-3">
      <div className="p-3 bg-purple-100 rounded-xl">
        <CheckCircle2 className="text-purple-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">Attendance</p>
        <h2 className="text-2xl font-bold text-purple-700">{attendanceRate}%</h2>
        <p className="text-xs text-gray-400">Overall rate</p>
      </div>
    </div>
  </div>

</div>

          {/* ================= MAIN BAR CHART ================= */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition">
            <h3 className="font-semibold mb-4">Students Registered per Event</h3>

            {events.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                No events yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={eventData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
  contentStyle={{
    borderRadius: "10px",
    border: "none",
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
  }}
/>
                  <Bar dataKey="present" fill="#60a5fa" radius={[6, 6, 0, 0]} />
<Bar dataKey="pending" fill="#4ade80" radius={[6, 6, 0, 0]} />
<Bar dataKey="absent" fill="#facc15" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

         <div className="grid md:grid-cols-3 gap-6 mt-6">

  {/* ================= EVENT STATUS ================= */}
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
  >
    <h3 className="font-semibold text-gray-700 mb-4">
      Event Status
    </h3>

    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={[
            { name: "Upcoming", value: upcoming },
            { name: "Ongoing", value: ongoing },
            { name: "Completed", value: completed }
          ]}
          dataKey="value"
          innerRadius={50}
          outerRadius={80}
        >
          {/* ✅ SOFT COLORS */}
          <Cell fill="#60a5fa" />
          <Cell fill="#4ade80" />
          <Cell fill="#facc15" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>

    {/* ✅ LEGEND */}
      <div className="mt-4 space-y-1 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
        Upcoming
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-green-400 rounded-full"></span>
        Ongoing
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
        Completed
      </div>
    </div>

  </motion.div>

  {/* ================= ATTENDANCE BREAKDOWN ================= */}
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="bg-white rounded-2xl p-6 shadow hover:shadow-xl transition"
  >
    <h3 className="font-semibold text-gray-700 mb-4">
      Attendance Breakdown
    </h3>

    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={statusData}
          dataKey="value"
          innerRadius={50}
          outerRadius={80}
        >
          <Cell fill="#60a5fa" />
          <Cell fill="#4ade80" />
          <Cell fill="#facc15" />
        </Pie>
      </PieChart>
    </ResponsiveContainer>

    {/* ✅ LEGEND */}
    <div className="mt-4 space-y-1 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
        Upcoming
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-green-400 rounded-full"></span>
        Ongoing
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
        Completed
      </div>
    </div>

  </motion.div>

  {/* ================= ATTENDANCE RATE ================= */}
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.2 }}
    className="bg-white rounded-2xl p-6 shadow hover:shadow-xl transition text-center"
  >
    <h3 className="font-semibold text-gray-700 mb-4">
      Attendance Rate
    </h3>

    <div className="relative flex justify-center items-center">

      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart
          innerRadius="65%"
          outerRadius="100%"
          data={[{ value: attendanceRate }]}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            dataKey="value"
            fill="#22c55e"
            cornerRadius={15}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      {/* CENTER TEXT */}
      <div className="absolute text-2xl font-bold">
        {attendanceRate}%
      </div>

    </div>

    <p className="text-sm text-gray-500 mt-2">
      Overall Performance
    </p>

  </motion.div>

</div>

          {/* ================= RECENT EVENTS ================= */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-semibold mb-4">Recent Events</h3>

            {events.length === 0 ? (
              <p className="text-gray-400">No events yet</p>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 5).map(e => (
                  <div key={e.event_id} className="flex justify-between items-center border p-3 rounded-xl">
                    <div>
                      <p className="font-semibold">{e.event_name}</p>
                      <p className="text-sm text-gray-500">{e.venue}</p>
                    </div>
                    <Badge>{e.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

        </>
      )}
    </div>
  );
};

export default Dashboard;