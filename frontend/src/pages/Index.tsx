import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Users, BarChart3, ArrowRight, Clock, MapPin, Sparkles, GraduationCap, Shield, Zap, TrendingUp, CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTimeRange } from "@/store/eventStore";
import { useEffect, useState } from "react";
import collegeBg from "@/assets/college-bg.png";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const floatAnim = (dur: number, y: number) => ({ y: [0, y, 0], transition: { duration: dur, repeat: Infinity, ease: "easeInOut" as const } });

const Index = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
const fetchEvents = async () => {
  try {
    const res = await fetch("http://localhost:3000/events");
    const data = await res.json();

    const formatted = data.map((e: any) => ({
      id: e.event_id,
      name: e.event_name,
      description: e.description,
      date: e.date,
      venue: e.venue,
      status: e.status || "Upcoming",
      startTime: e.timing?.split("-")[0]?.trim() || "",
      endTime: e.timing?.split("-")[1]?.trim() || "",
    }));

    setEvents(formatted);
  } catch (err) {
    console.error(err);
  }
};

const fetchAttendance = async () => {
  try {
    const res = await fetch("http://localhost:3000/attendance");
    const data = await res.json();
    setAttendanceRecords(data);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
  fetchEvents();
  fetchAttendance();

  const interval = setInterval(() => {
    fetchEvents();
    fetchAttendance();
  }, 3000); // 🔥 auto refresh every 3 sec

  return () => clearInterval(interval);
}, []);
  const upcoming = events.filter((e) => e.status === "Upcoming");
  const ongoing = events.filter((e) => e.status === "Ongoing");
  const completed = events.filter((e) => e.status === "Completed");
  
  // ✅ UNIQUE STUDENTS COUNT
const totalStudents = new Set(
  attendanceRecords.map(r => r.roll_no)
).size;

// ✅ ATTENDANCE %
const totalPresent = attendanceRecords.filter(
  r => r.status === "Present"
).length;

const attendanceRate = attendanceRecords.length
  ? Math.round((totalPresent / attendanceRecords.length) * 100)
  : 0;
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero with college background - reduced transparency */}
      <section className="relative min-h-[75vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={collegeBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>

        <div className="container relative z-10 py-16">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/90 text-primary-foreground text-sm mb-6 shadow-lg">
              <Sparkles className="h-3.5 w-3.5" />
              Pimpri Chinchwad College of Engineering
            </motion.div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-[1.08] mb-5 tracking-tight drop-shadow-lg">
              Event Attendance{" "}
              <span className="relative inline-block">
                <span className="text-primary">Management</span>
                <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-primary/40 rounded-full origin-left" />
              </span>
              <br />
              <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                System
              </motion.span>
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed max-w-xl font-medium drop-shadow-sm">
              Streamline event planning, track attendance in real-time, and generate insightful reports — all from one powerful platform.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-wrap gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="gradient-primary text-primary-foreground gap-2 shadow-xl text-base px-8 h-13 rounded-xl font-semibold group">
                  Go to Dashboard <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/events">
                <Button size="lg" variant="outline" className="border-foreground/20 text-foreground bg-card/70 backdrop-blur-sm hover:bg-card text-base px-8 h-13 rounded-xl font-semibold shadow-lg">
                  View Events
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats - properly placed below hero */}
      <section className="container py-12">
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: CalendarDays, label: "Total Events", value: events.length, color: "text-primary", bg: "bg-primary/10 border-primary/20", desc: "All registered events" },
            { icon: Users, label: "Students", value: totalStudents, color: "text-success", bg: "bg-success/10 border-success/20", desc: "Registered students" },
            { icon: BarChart3, label: "Upcoming", value: upcoming.length, color: "text-warning", bg: "bg-warning/10 border-warning/20", desc: "Events coming soon" },
            { icon: Zap, label: "Attendance", value: `${attendanceRate}%`, color: "text-info", bg: "bg-info/10 border-info/20", desc: "Overall rate" },
          ].map((stat) => (
            <motion.div key={stat.label} variants={item} whileHover={{ y: -4, scale: 1.02 }}
              className={`rounded-2xl border-2 ${stat.bg} bg-card p-6 flex items-center gap-4 cursor-default group shadow-sm hover:shadow-md transition-shadow`}>
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">{stat.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Ongoing Events */}
      {ongoing.length > 0 && (
        <section className="container mb-16">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex items-center gap-3 mb-8">
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" /><span className="relative inline-flex rounded-full h-3 w-3 bg-success" /></span>
            <h2 className="section-title">Ongoing Events</h2>
            <Badge className="bg-success/15 text-success border-success/30 text-xs">LIVE</Badge>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {ongoing.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-2xl border-2 border-success/30 bg-gradient-to-br from-success/8 via-success/3 to-transparent p-7 card-hover relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-bl-full" />
                <div className="flex items-start justify-between relative">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{event.name}</h3>
                    <div className="mt-4 rounded-xl border border-success/20 bg-card/80 px-4 py-3 shadow-sm">
                      <p className="text-sm font-medium leading-relaxed text-foreground/80">
                        {event.description || `${event.name} at ${event.venue}`}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-success/20 text-success border-success/40 animate-pulse font-semibold">● Live</Badge>
                </div>
                <div className="flex flex-wrap gap-4 mt-5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5 bg-success/8 px-3 py-1.5 rounded-lg"><MapPin className="h-3.5 w-3.5 text-success" />{event.venue}</span>
                  <span className="flex items-center gap-1.5 bg-success/8 px-3 py-1.5 rounded-lg"><Clock className="h-3.5 w-3.5 text-success" />{formatTimeRange(event.startTime, event.endTime)}</span>
                  <span className="flex items-center gap-1.5 bg-success/8 px-3 py-1.5 rounded-lg"><CalendarDays className="h-3.5 w-3.5 text-success" />{new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcoming.length > 0 && (
        <section className="container mb-16">
          <div className="flex items-end justify-between mb-8">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <h2 className="section-title">Upcoming Events</h2>
              <p className="text-sm text-muted-foreground mt-1">Events scheduled for the future</p>
            </motion.div>
            <Link to="/events" className="text-sm font-semibold text-accent hover:text-accent/80 flex items-center gap-1 transition-colors group">
              View all <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
            {upcoming.slice(0, 3).map((event) => (
              <motion.div key={event.id} variants={item} whileHover={{ y: -6 }} className="group rounded-2xl border border-border bg-card p-6 card-hover relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-[3rem] group-hover:bg-accent/10 transition-colors" />
                <div className="flex items-center gap-3 mb-4 relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-accent transition-colors">{event.name}</h3>
                    <p className="text-xs text-muted-foreground">{new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="mb-5 rounded-xl border border-border/70 bg-muted/40 px-4 py-3 shadow-sm">
                  <p className="text-sm font-medium leading-relaxed text-foreground/80">
                    {event.description || `${event.name} at ${event.venue}`}
                  </p>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-md"><MapPin className="h-3 w-3" />{event.venue}</span>
                  <span className="flex items-center gap-1 bg-muted/60 px-2.5 py-1 rounded-md"><Clock className="h-3 w-3" />{formatTimeRange(event.startTime, event.endTime)}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {/* No events */}
      {events.length === 0 && (
        <section className="container mb-16 text-center py-20">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto">
            <motion.div animate={floatAnim(3, -8)} className="flex h-24 w-24 items-center justify-center rounded-3xl gradient-primary shadow-xl mx-auto mb-8">
              <CalendarDays className="h-12 w-12 text-primary-foreground" />
            </motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No events yet</h3>
            <p className="text-muted-foreground mb-8">Create your first event to get started with the attendance management system.</p>
            <Link to="/events">
              <Button className="gradient-primary text-primary-foreground gap-2 h-12 px-8 rounded-xl shadow-lg">
                Create Event <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </section>
      )}

      {/* Quick Access */}
      <section className="container mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Quick <span className="text-gradient">Access</span>
          </h2>
          <p className="text-muted-foreground">Navigate to any section instantly</p>
        </motion.div>
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: "/dashboard", icon: BarChart3, label: "Dashboard", desc: "Analytics overview", color: "text-primary", bg: "bg-primary/10" },
            { to: "/events", icon: CalendarDays, label: "Events", desc: "Manage events", color: "text-success", bg: "bg-success/10" },
            { to: "/attendance", icon: Users, label: "Attendance", desc: "Mark attendance", color: "text-warning", bg: "bg-warning/10" },
            { to: "/reports", icon: Eye, label: "Reports", desc: "View insights", color: "text-info", bg: "bg-info/10" },
          ].map((nav) => (
            <motion.div key={nav.to} variants={item} whileHover={{ y: -6, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to={nav.to} className="block rounded-2xl border border-border bg-card p-6 text-center card-hover group">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${nav.bg} ${nav.color} mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <nav.icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-foreground group-hover:text-accent transition-colors">{nav.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{nav.desc}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 via-secondary to-secondary/80" />
        <div className="container relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} viewport={{ once: true }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
              <Zap className="h-3.5 w-3.5" /> Why Choose PCCOE EAMS
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              Manage Events <span className="text-gradient">Effortlessly</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-base">
              A comprehensive platform for PCCOE faculty and staff to organize events and track attendance.
            </p>
          </motion.div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-8">
            {[
              { icon: CalendarDays, title: "Event Management", desc: "Create, schedule, and manage all college events with an intuitive interface. Track status from upcoming to completed.", color: "text-accent", bg: "bg-accent/10" },
              { icon: GraduationCap, title: "Student Tracking", desc: "Register students and track attendance across multiple events. Filter by department and export to Excel.", color: "text-success", bg: "bg-success/10" },
              { icon: Shield, title: "Detailed Reports", desc: "Generate comprehensive attendance reports with visual analytics and actionable insights.", color: "text-primary", bg: "bg-primary/10" },
            ].map((feat) => (
              <motion.div key={feat.title} variants={item} whileHover={{ y: -8 }} className="rounded-2xl bg-card border border-border p-8 text-center card-hover group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/3 rounded-bl-full group-hover:bg-accent/8 transition-colors duration-500" />
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${feat.bg} ${feat.color} mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feat.icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Ready to get <span className="text-gradient">started</span>?
          </h2>
          <p className="text-muted-foreground mb-8">Start managing your college events and tracking attendance today.</p>
          <div className="flex justify-center gap-4">
            <Link to="/events">
              <Button size="lg" className="gradient-primary text-primary-foreground gap-2 h-12 px-8 rounded-xl shadow-lg font-semibold">
                Create Your First Event <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
