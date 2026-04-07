import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ✅ FIXED BASE URL
const BASE_URL = "http://localhost:3000";

const AddEventModal = ({ refreshEvents }: any) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>();
  const [venue, setVenue] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [coordinator, setCoordinator] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !date || !venue || !startTime || !endTime || !coordinator) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      // ✅ FIXED API CALL
      const res = await fetch(`${BASE_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          event_name: name,
          description: description || `${name} at ${venue}`,
          date: format(date, "yyyy-MM-dd"),
          venue: venue,

          // ✅ FIXED TIMING FORMAT (no NaN issue)
          timing: `${startTime} - ${endTime}`,

          coordinator: coordinator
        })
      });

      const msg = await res.text();

      if (!res.ok) {
        throw new Error(msg);
      }

      toast.success(msg || "Event added successfully!");

      // 🔥 REFRESH TABLE
      if (refreshEvents) refreshEvents();

      // RESET FORM
      setOpen(false);
      setName("");
      setDescription("");
      setDate(undefined);
      setVenue("");
      setStartTime("");
      setEndTime("");
      setCoordinator("");

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error adding event");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Event
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <Label>Event Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>

              <PopoverContent>
                <Calendar mode="single" selected={date} onSelect={setDate} />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Venue</Label>
            <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
          </div>

          <div>
            <Label>Timing</Label>
            <div className="flex gap-2">
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Coordinator</Label>
            <Input value={coordinator} onChange={(e) => setCoordinator(e.target.value)} />
          </div>

          <Button type="submit" className="w-full">
            Submit
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEventModal;