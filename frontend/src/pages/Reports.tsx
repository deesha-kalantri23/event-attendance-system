import { motion } from "framer-motion";
import { Download, Users } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useState, useEffect } from "react";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

const COLORS = ["#16a34a", "#f59e0b", "#ef4444", "#3b82f6"];

const Reports = () => {

  const [events, setEvents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("all");

  // 🔥 FETCH DATA
  useEffect(() => {
    fetch("http://localhost:3000/events")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((e: any) => ({
          id: e.event_id,
          name: e.event_name,
          date: e.date,
          coordinator: e.coordinator
        }));
        setEvents(formatted);
      });

    fetch("http://localhost:3000/attendance")
      .then(res => res.json())
      .then(data => {
        setAttendanceRecords(data);
      });

  }, []);

  // 🔥 TOTALS
  const totalPresent = attendanceRecords.filter(r => r.status === "Present").length;
  const totalPending = attendanceRecords.filter(r => r.status === "Pending").length;
  const totalAbsent = attendanceRecords.filter(r => r.status === "Absent").length;
  const totalRecords = attendanceRecords.length;

  const overallRate = totalRecords > 0
    ? Math.round((totalPresent / totalRecords) * 100)
    : 0;

  // 🔥 EVENT DATA
  const reportData = events.map(e => {

    const records = attendanceRecords.filter(
      r => r.event_name === e.name
    );

    const present = records.filter(r => r.status === "Present").length;
    const pending = records.filter(r => r.status === "Pending").length;
    const absent = records.filter(r => r.status === "Absent").length;

    const total = records.length;

    const rate = total > 0
      ? Math.round((present / total) * 100)
      : 0;

    return {
      name: e.name,
      present,
      pending,
      absent,
      total,
      rate
    };
  });

  // 🔥 PIE DATA
  const statusPieData = [
    { name: "Present", value: totalPresent },
    { name: "Pending", value: totalPending },
    { name: "Absent", value: totalAbsent }
  ];

  const filteredEvents =
    selectedEvent === "all"
      ? reportData
      : reportData.filter((_, i) => events[i]?.id === Number(selectedEvent));

  return (
    <div className="container py-8 space-y-8">

      {/* HEADER */}
      <motion.div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Attendance insights dashboard</p>
        </div>

        <Button variant="outline">
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
      </motion.div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-5">

        <Card title="Total" value={totalRecords} />
        <Card title="Present" value={totalPresent} color="text-green-600" />
        <Card title="Pending" value={totalPending} color="text-yellow-600" />
        <Card title="Absent" value={totalAbsent} color="text-red-600" />
        <Card title="Rate" value={`${overallRate}%`} color="text-blue-600" />

      </div>

      {/* FILTER */}
      <Select value={selectedEvent} onValueChange={setSelectedEvent}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Filter event" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Events</SelectItem>
          {events.map(e => (
            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* BAR CHART */}
        <div className="col-span-2 p-5 border rounded-xl bg-card">
          <h3 className="mb-4 font-semibold">Event Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" fill={COLORS[0]} />
              <Bar dataKey="pending" fill={COLORS[1]} />
              <Bar dataKey="absent" fill={COLORS[2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE */}
        <div className="p-5 border rounded-xl bg-card">
          <h3 className="mb-4 font-semibold">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusPieData} dataKey="value">
                {statusPieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2 text-sm">

  <div className="flex items-center gap-2">
    <span className="w-3 h-3 bg-green-600 rounded-full"></span>
    Present ({totalPresent})
  </div>

  <div className="flex items-center gap-2">
    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
    Pending ({totalPending})
  </div>

  <div className="flex items-center gap-2">
    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
    Absent ({totalAbsent})
  </div>

</div>
        </div>

      </div>

      {/* TREND */}
      <div className="p-5 border rounded-xl bg-card">
        <h3 className="mb-4 font-semibold">Attendance Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={reportData}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Area dataKey="rate" stroke="#3b82f6" fill="#93c5fd" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* TABLE */}
      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Present</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead>Absent</TableHead>
              <TableHead>Rate</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredEvents.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.total}</TableCell>
                <TableCell className="text-green-600">{r.present}</TableCell>
                <TableCell className="text-yellow-600">{r.pending}</TableCell>
                <TableCell className="text-red-600">{r.absent}</TableCell>
                <TableCell><Badge>{r.rate}%</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </div>

    </div>
  );
};

// 🔥 CARD COMPONENT
const Card = ({ title, value }: any) => {

  const styles: any = {
    "Total": {
      bg: "from-blue-50 to-white",
      border: "border-blue-200",
      text: "text-blue-700"
    },
    "Present": {
      bg: "from-green-50 to-white",
      border: "border-green-200",
      text: "text-green-700"
    },
    "Pending": {
      bg: "from-yellow-50 to-white",
      border: "border-yellow-200",
      text: "text-yellow-700"
    },
    "Absent": {
      bg: "from-red-50 to-white",
      border: "border-red-200",
      text: "text-red-700"
    },
    "Rate": {
      bg: "from-purple-50 to-white",
      border: "border-purple-200",
      text: "text-purple-700"
    }
  };

  const style = styles[title] || styles["Total"];

  return (
    <div className={`bg-gradient-to-br ${style.bg} ${style.border} border rounded-2xl p-5 shadow hover:shadow-xl transition`}>
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className={`text-2xl font-bold ${style.text}`}>{value}</h2>
      <p className="text-xs text-gray-400 mt-1">
        {title === "Total" && "All records"}
        {title === "Present" && "Marked present"}
        {title === "Pending" && "Yet to mark"}
        {title === "Absent" && "Not attended"}
        {title === "Rate" && "Overall performance"}
      </p>
    </div>
  );
};

export default Reports;