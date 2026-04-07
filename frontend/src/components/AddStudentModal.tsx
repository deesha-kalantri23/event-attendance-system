import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { useEventStore, formatTimeRange } from "@/store/eventStore";
import { toast } from "sonner";

const AddStudentModal = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [department, setDepartment] = useState("");
  const [eventId, setEventId] = useState("");
  const addStudent = useEventStore((s) => s.addStudent);
  const events = useEventStore((s) => s.events);

  const selectedEvent = events.find((e) => e.id === eventId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rollNo || !department || !eventId) {
      toast.error("Please fill all fields");
      return;
    }
    addStudent({ name, rollNo, department, eventId });
    toast.success("Student added successfully!");
    setOpen(false);
    setName(""); setRollNo(""); setDepartment(""); setEventId("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow">
          <UserPlus className="h-4 w-4" /> Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="student-name">Full Name</Label>
            <Input id="student-name" placeholder="Enter student name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roll-no">Roll Number</Label>
            <Input id="roll-no" placeholder="Enter roll number" value={rollNo} onChange={(e) => setRollNo(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input id="department" placeholder="Enter department" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Event</Label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events.length === 0 ? (
                  <SelectItem value="none" disabled>No events available</SelectItem>
                ) : (
                  events.map((ev) => (
                    <SelectItem key={ev.id} value={ev.id}>
                      {ev.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {selectedEvent && (
            <div className="rounded-xl bg-accent/5 border border-accent/20 p-3 text-sm">
              <p className="font-semibold text-foreground">{selectedEvent.name}</p>
              <p className="text-muted-foreground text-xs mt-1">
                {selectedEvent.venue} · {formatTimeRange(selectedEvent.startTime, selectedEvent.endTime)} · {new Date(selectedEvent.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          )}
          <Button type="submit" className="w-full gradient-primary text-primary-foreground">Add Student</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentModal;
