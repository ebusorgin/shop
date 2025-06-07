const express = require('express');
const app = express();
app.use(express.json());

// simple login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  // In a real app, you'd verify credentials here
  res.json({ message: 'Login successful' });
});

// simple register endpoint
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  // Here you'd store user credentials
  res.json({ message: 'Registration successful' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
