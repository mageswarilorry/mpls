const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'shipments.json');
const ADMIN_PASSWORD = 'admin'; // In a real app, use env vars and hashing

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '.')));

// Helper to read data
const readData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Initialize if not exists
            const initialData = {
                transporterName: "Global Transporters",
                experience: "Unknown",
                contactPhone: "",
                gstn: "",
                upiId: "",
                gpsLocation: "",
                transits: []
            };
            writeData(initialData);
            return initialData;
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data:", err);
        return {};
    }
};

// Helper to write data
const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing data:", err);
    }
};

// Middleware for Admin Auth
const requireAuth = (req, res, next) => {
    if (req.cookies.admin_token === 'authenticated') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Routes

// Get Info (Public)
app.get('/api/info', (req, res) => {
    const data = readData();
    res.json(data);
});

// Admin Login
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.cookie('admin_token', 'authenticated', { httpOnly: true, maxAge: 3600000 }); // 1 hour
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
});

// Update Info (Admin Only)
app.post('/api/update-info', requireAuth, (req, res) => {
    const { transporterName, experience, contactPhone, gstn, upiId, gpsLocation } = req.body;
    const data = readData();

    // Update fields if provided
    if (transporterName) data.transporterName = transporterName;
    if (experience) data.experience = experience;
    if (contactPhone) data.contactPhone = contactPhone;
    if (gstn) data.gstn = gstn;
    if (upiId) data.upiId = upiId;
    if (gpsLocation) data.gpsLocation = gpsLocation;

    writeData(data);
    res.json({ success: true, data });
});

// Update Transit (Admin Only)
app.post('/api/update-transit', requireAuth, (req, res) => {
    const { id, from, to, intermediate, status } = req.body;
    const data = readData();

    const transitIndex = data.transits.findIndex(t => t.id === id);
    if (transitIndex > -1) {
        if (from) data.transits[transitIndex].from = from;
        if (to) data.transits[transitIndex].to = to;
        if (intermediate !== undefined) data.transits[transitIndex].intermediate = intermediate;
        if (status) data.transits[transitIndex].status = status;

        writeData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Transit not found' });
    }
});

// Delete Transit (Admin Only)
app.post('/api/delete-transit', requireAuth, (req, res) => {
    const { id } = req.body;
    const data = readData();

    const initialLength = data.transits.length;
    data.transits = data.transits.filter(t => t.id !== id);

    if (data.transits.length < initialLength) {
        writeData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Transit not found' });
    }
});

// Add Transit (Admin Only)
app.post('/api/add-transit', requireAuth, (req, res) => {
    const newTransit = req.body;
    const data = readData();

    // Simple ID generation
    newTransit.id = 'TRN-' + Date.now().toString().slice(-6);

    if (!data.transits) data.transits = [];
    data.transits.push(newTransit);

    writeData(data);
    res.json({ success: true, transit: newTransit });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
