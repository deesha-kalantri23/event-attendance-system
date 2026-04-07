const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

console.log("🚀 Starting server...");

// ================= DATABASE =================
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'Event_Attendance'
});

db.connect(err => {
    if (err) {
        console.log("❌ DB Error:", err);
        return;
    }
    console.log("✅ MySQL Connected");
});

// ================= ROOT =================
app.get("/", (req, res) => {
    res.send("🚀 Server running");
});

// ================= EVENTS =================

// GET EVENTS
app.get('/events', (req, res) => {
    db.query("SELECT * FROM event", (err, result) => {
        if (err) {
            console.log("❌ FETCH EVENTS ERROR:", err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

// ADD EVENT
app.post('/events', (req, res) => {
    const { event_name, description, date, venue, timing, coordinator } = req.body;

    db.query(
        "INSERT INTO event (event_name, description, date, venue, timing, coordinator) VALUES (?, ?, ?, ?, ?, ?)",
        [
            event_name || "",
            description || "",
            date || null,
            venue || "",
            timing || "",
            coordinator || ""
        ],
        (err) => {
            if (err) {
                console.log("❌ ADD EVENT ERROR:", err);
                return res.status(500).json(err);
            }
            res.json({ message: "✅ Event added" });
        }
    );
});

// 🔥 UPDATE EVENT (MAIN FIXED API)
app.put('/event/:id', (req, res) => {

    console.log("🔥 EVENT UPDATE HIT");

    const { event_name, description, date, venue, timing, coordinator, status } = req.body;

    console.log("DATA RECEIVED:", req.body);

    db.query(
        `UPDATE event 
         SET event_name=?, description=?, date=?, venue=?, timing=?, coordinator=?, status=? 
         WHERE event_id=?`,
        [
            event_name || "",
            description || "",
            date || null,
            venue || "",
            timing || "",
            coordinator || "",
            status || "Upcoming",
            req.params.id
        ],
        (err, result) => {

            if (err) {
                console.log("❌ UPDATE EVENT ERROR:", err);
                return res.status(500).json(err);
            }

            console.log("✅ UPDATE RESULT:", result);

            if (result.affectedRows === 0) {
                return res.json({ message: "⚠️ No event updated (check ID)" });
            }

            res.json({ message: "✅ Event updated successfully" });
        }
    );
});

// DELETE EVENT
app.delete('/event/:id', (req, res) => {
    db.query(
        "DELETE FROM event WHERE event_id=?",
        [req.params.id],
        (err) => {
            if (err) {
                console.log("❌ DELETE EVENT ERROR:", err);
                return res.status(500).json(err);
            }
            res.json({ message: "✅ Event deleted" });
        }
    );
});

// ================= ATTENDANCE =================

// ADD ATTENDANCE
app.post('/attendance', (req, res) => {

    const { roll_no, name, department, year, division, event_name } = req.body;

    db.query(
        "SELECT event_id FROM event WHERE UPPER(event_name)=UPPER(?)",
        [event_name],
        (err, result) => {

            if (err) {
                console.log("❌ EVENT FIND ERROR:", err);
                return res.status(500).json(err);
            }

            if (!result || result.length === 0) {
                return res.json({ message: "Event not found" });
            }

            const event_id = result[0].event_id;

            // Insert / Update student
            db.query(
                `INSERT INTO student (roll_no, name, department, year, division)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 name=?, department=?, year=?, division=?`,
                [roll_no, name, department, year, division, name, department, year, division]
            );

            // Insert attendance
            db.query(
                "INSERT INTO attendance (roll_no, event_id) VALUES (?, ?)",
                [roll_no, event_id],
                (err) => {
                    if (err) return res.json({ message: "Already exists" });
                    res.json({ message: "✅ Attendance added" });
                }
            );
        }
    );
});

// GET ATTENDANCE
app.get('/attendance', (req, res) => {
    db.query(`
        SELECT 
            a.attendance_id,
            s.roll_no,
            s.name,
            s.department,
            s.year,
            s.division,
            e.event_name,
            e.date,
            e.timing,
            a.status
        FROM attendance a
        JOIN student s ON a.roll_no = s.roll_no
        JOIN event e ON a.event_id = e.event_id
    `, (err, result) => {
        if (err) {
            console.log("❌ FETCH ATTENDANCE ERROR:", err);
            return res.status(500).json(err);
        }
        res.json(result);
    });
});

// UPDATE ATTENDANCE STATUS
app.put('/attendance/:id', (req, res) => {

    console.log("🔥 ATTENDANCE UPDATE HIT");

    const { status } = req.body;

    const validStatus = ["Present", "Pending", "Absent"];
    if (!validStatus.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    db.query(
        "UPDATE attendance SET status=? WHERE attendance_id=?",
        [status, req.params.id],
        (err, result) => {

            if (err) {
                console.log("❌ UPDATE ATTENDANCE ERROR:", err);
                return res.status(500).json(err);
            }

            console.log("✅ UPDATE RESULT:", result);

            if (result.affectedRows === 0) {
                return res.json({ message: "⚠️ No record updated" });
            }

            res.json({ message: "✅ Status updated successfully" });
        }
    );
});

// DELETE ATTENDANCE
app.delete('/attendance/:id', (req, res) => {
    db.query(
        "DELETE FROM attendance WHERE attendance_id=?",
        [req.params.id],
        (err) => {
            if (err) {
                console.log("❌ DELETE ATTENDANCE ERROR:", err);
                return res.status(500).json(err);
            }
            res.json({ message: "✅ Attendance deleted" });
        }
    );
});

// ================= START =================
app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
});