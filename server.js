const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { initializeDb, saveContact, getContacts, deleteContact } = require('./db');

const app = express();
const port = process.env.PORT || 3000;
const ADMIN_USERNAME = 'vidhanadmin';
const ADMIN_PASSWORD = 'Vidhan@2026';

const adminSessions = new Map();

function createAdminSession(res) {
  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  adminSessions.set(token, true);
  res.cookie('adminSession', token, { httpOnly: true, sameSite: 'lax' });
  return token;
}

function isAdminAuthenticated(req) {
  return adminSessions.has(req.cookies?.adminSession);
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static(__dirname));
app.use(cookieParser());

app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload.' });
  }
  next(err);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Vidhan Digital Solution API' });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    createAdminSession(res);
    return res.json({ success: true, message: 'Login successful.' });
  }
  return res.status(401).json({ success: false, message: 'Invalid username or password.' });
});

app.post('/api/admin/logout', (req, res) => {
  const token = req.cookies?.adminSession;
  if (token) {
    adminSessions.delete(token);
  }
  res.clearCookie('adminSession');
  res.json({ success: true, message: 'Logged out.' });
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, business, company, service, budget, message } = req.body;
    const businessName = (business || company || '').trim();

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const result = await saveContact({
      name,
      email,
      business: businessName,
      service: service?.trim() || '',
      budget: budget?.trim() || '',
      message,
    });
    res.status(201).json({
      success: true,
      message: 'Thank you! Your request has been received and saved successfully.',
      id: result.id,
    });
  } catch (error) {
    console.error('Contact save failed:', error);
    res.status(500).json({ success: false, message: 'Could not save your request right now.' });
  }
});

app.get('/api/messages', requireAdmin, async (req, res) => {
  try {
    const messages = await getContacts();
    res.json(messages);
  } catch (error) {
    console.error('Message fetch failed:', error);
    res.status(500).json({ success: false, message: 'Unable to fetch messages.' });
  }
});

app.delete('/api/messages/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteContact(id);
    res.json({ success: true, deleted });
  } catch (error) {
    console.error('Message delete failed:', error);
    res.status(500).json({ success: false, message: 'Unable to delete request.' });
  }
});

function requireAdmin(req, res, next) {
  if (isAdminAuthenticated(req)) {
    return next();
  }
  return res.redirect('/admin-login.html');
}

app.get(['/admin', '/admin/'], requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin.html', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/admin-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get(['/request', '/request/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'request.html'));
});

app.get('/request.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'request.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'INDEX.HTML'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'INDEX.HTML'));
});

initializeDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 Vidhan Digital Solution running at http://localhost:${port}`);
      console.log(`📦 Database initialized at ${path.join(__dirname, 'data', 'vidhan.db')}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
