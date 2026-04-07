import { create } from "zustand";

export interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  startTime: string;
  endTime: string;
  coordinator: string;
  status: "Upcoming" | "Ongoing" | "Completed";
  description?: string;
}

export interface Student {
  id: string;
  name: string;
  department: string;
  rollNo: string;
  eventId: string; // linked event
}

export interface AttendanceRecord {
  studentId: string;
  eventId: string;
  status: "Present" | "Absent" | "Pending";
  markedAt?: string;
  isStatusConfirmed?: boolean;
}

interface EventStore {
  events: Event[];
  students: Student[];
  coordinators: string[];
  attendanceRecords: AttendanceRecord[];
  addEvent: (event: Omit<Event, "id">) => void;
  addStudent: (student: Omit<Student, "id">) => void;
  addCoordinator: (name: string) => void;
  updateEventStatus: (eventId: string, status: Event["status"]) => void;
  setAttendance: (record: AttendanceRecord) => void;
  getStudentsForEvent: (eventId: string) => AttendanceRecord[];
}

export const formatTimeRange = (startTime: string, endTime: string) => {
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return m === 0 ? `${hour} ${ampm}` : `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
  };
  return `${fmt(startTime)} - ${fmt(endTime)}`;
};

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  students: [],
  coordinators: [],
  attendanceRecords: [],

  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, { ...event, id: Date.now().toString() }],
    })),

  addStudent: (student) =>
    set((state) => {
      const id = Date.now().toString();
      return {
        students: [...state.students, { ...student, id }],
        attendanceRecords: [
          ...state.attendanceRecords,
          { studentId: id, eventId: student.eventId, status: "Pending" as const, isStatusConfirmed: false },
        ],
      };
    }),

  addCoordinator: (name) =>
    set((state) => ({
      coordinators: state.coordinators.includes(name)
        ? state.coordinators
        : [...state.coordinators, name],
    })),

  updateEventStatus: (eventId, status) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId ? { ...e, status } : e
      ),
    })),

  setAttendance: (record) =>
    set((state) => {
      const existing = state.attendanceRecords.findIndex(
        (r) => r.studentId === record.studentId && r.eventId === record.eventId
      );
      if (existing >= 0) {
        const updated = [...state.attendanceRecords];
        updated[existing] = record;
        return { attendanceRecords: updated };
      }
      return { attendanceRecords: [...state.attendanceRecords, record] };
    }),

  getStudentsForEvent: (eventId) => {
    return get().attendanceRecords.filter((r) => r.eventId === eventId);
  },
}));
