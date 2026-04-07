import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Download } from "lucide-react";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddStudentModal from "@/components/AddStudentModal";
import * as XLSX from "xlsx";

const BASE_URL = "http://127.0.0.1:3000";

const Attendance = () => {

  const [records, setRecords] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [filterEvent, setFilterEvent] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterDivision, setFilterDivision] = useState("all");
  const [search, setSearch] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      const attRes = await fetch(`${BASE_URL}/attendance`);
      const attData = await attRes.json();

      const eventRes = await fetch(`${BASE_URL}/events`);
      const eventData = await eventRes.json();

      setRecords(attData || []);
      setEvents(eventData || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ================= DELETE =================
  const deleteRecord = async (id: number) => {
    try {
      await fetch(`${BASE_URL}/attendance/${id}`, { method: "DELETE" });

      setRecords(prev => prev.filter(r => r.attendance_id !== id));

    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ================= STATUS UPDATE =================
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await fetch(`${BASE_URL}/attendance/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      setRecords(prev =>
        prev.map(r =>
          r.attendance_id === id ? { ...r, status: newStatus } : r
        )
      );

    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  // ================= FILTER =================
  const filteredRecords = records.filter((r) => {
    return (
      (filterEvent === "all" || r.event_name === filterEvent) &&
      (filterYear === "all" || r.year === filterYear) &&
      (filterDivision === "all" || r.division === filterDivision) &&
      (
        search === "" ||
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.roll_no?.toLowerCase().includes(search.toLowerCase())
      )
    );
  });

  // ================= DOWNLOAD =================
  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(filteredRecords);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, "attendance.xlsx");
  };

  return (
    <div className="container py-8">

      {/* HEADER */}
      <motion.div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Attendance</h1>

        <div className="flex gap-3">
          <AddStudentModal />
          <Button onClick={handleDownload} variant="outline">
            <Download className="h-4 w-4 mr-1" /> Download
          </Button>
        </div>
      </motion.div>

      {/* FILTERS */}
      <div className="flex gap-3 mb-6 flex-wrap">

        <Select value={filterEvent} onValueChange={setFilterEvent}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map(e => (
              <SelectItem key={e.event_id} value={e.event_name}>
                {e.event_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="FY">FY</SelectItem>
            <SelectItem value="SY">SY</SelectItem>
            <SelectItem value="TY">TY</SelectItem>
            <SelectItem value="BE">BE</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDivision} onValueChange={setFilterDivision}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Division" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Div</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Roll No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Timing</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10">
                  <Users className="mx-auto mb-2 opacity-30" />
                  No attendance records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((r) => (
                <TableRow key={r.attendance_id}>

                  <TableCell>{r.roll_no}</TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.department}</TableCell>
                  <TableCell>{r.year}</TableCell>
                  <TableCell>{r.division}</TableCell>
                  <TableCell>{r.event_name}</TableCell>
                  <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                  <TableCell>{r.timing}</TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <Select
                      value={r.status}
                      onValueChange={(val) =>
                        handleStatusChange(r.attendance_id, val)
                      }
                    >
                      <SelectTrigger className="w-28 font-semibold">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="Present">Present</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Absent">Absent</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* DELETE BUTTON */}
                  <TableCell>
                    <button
                      className="text-red-500 hover:text-red-700 font-semibold"
                      onClick={() => setDeleteId(r.attendance_id)}
                    >
                      Delete
                    </button>
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 🔥 MODAL (OUTSIDE TABLE) */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80">
            <h2 className="text-lg font-semibold mb-4">
              Delete this attendance record?
            </h2>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 rounded bg-red-500 text-white"
                onClick={async () => {
                  await deleteRecord(deleteId);
                  setDeleteId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Attendance;