import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import AddEventModal from "@/components/AddEventModal";

const BASE_URL = "http://localhost:3000";

const Events = () => {

  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ================= FETCH =================
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${BASE_URL}/events`);
      const data = await res.json();

      const formatted = data.map((e: any) => {
        const timingParts = (e.timing || "").split(" - ");

        return {
          id: e.event_id,
          name: e.event_name,
          description: e.description,
          date: e.date,
          venue: e.venue,
          startTime: timingParts[0],
          endTime: timingParts[1],
          coordinator: e.coordinator,
          status: e.status || "Upcoming"
        };
      });

      setEvents(formatted);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ================= FILTER =================
  const filtered = useMemo(() => {
    return events.filter((e) => {
      return (
        (statusFilter === "all" || e.status === statusFilter) &&
        (
          e.name?.toLowerCase().includes(search.toLowerCase()) ||
          e.venue?.toLowerCase().includes(search.toLowerCase()) ||
          e.coordinator?.toLowerCase().includes(search.toLowerCase())
        )
      );
    });
  }, [events, search, statusFilter]);

  return (
    <div className="container py-8">

      <motion.div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Events</h1>
        <AddEventModal refreshEvents={fetchEvents} />
      </motion.div>

      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Upcoming">Upcoming</SelectItem>
            <SelectItem value="Ongoing">Ongoing</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Coordinator</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((event) => (
              <TableRow key={event.id}>

                <TableCell>{event.name}</TableCell>
                <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                <TableCell>{event.venue || "-"}</TableCell>
                <TableCell>{event.coordinator || "-"}</TableCell>

                {/* 🔥 STATUS AUTO SAVE */}
                <TableCell>
                  <Select
                    value={event.status}
                    onValueChange={async (newStatus) => {

                      try {

                        console.log("🔥 Sending status:", newStatus);

                        const res = await fetch(`${BASE_URL}/event/${event.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            event_name: event.name,
                            description: event.description,
                            date: event.date?.split("T")[0], // ✅ FIXED DATE
                            venue: event.venue,
                            timing: `${event.startTime} - ${event.endTime}`,
                            coordinator: event.coordinator,
                            status: newStatus || "Upcoming" // ✅ SAFE
                          })
                        });

                        const data = await res.text();
                        console.log("🔥 RESPONSE:", data);

                        if (!res.ok) {
                          throw new Error("Update failed");
                        }

                        // 🔥 REFRESH DATA FROM DB
                        await fetchEvents();

                      } catch (err) {
                        console.error("❌ Update error:", err);
                        alert("❌ Failed to update status");
                      }

                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>

                  </Select>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    </div>
  );
};

export default Events;