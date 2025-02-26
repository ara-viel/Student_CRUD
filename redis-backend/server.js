const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
//const csv = require('csv-parser');
//const fs = require('fs');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

const SECRET_KEY = 'your_secret_key';

// Middleware
app.use(cors());
app.use(bodyParser.json());


// Connect to Redis
const client = redis.createClient({
  url: 'redis://@127.0.0.1:6379'  // Default Redis connection
});


client.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection error:', err));


// 🔹 **1. Register User (Signup)**
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Hash the password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Store user details in Redis
    await client.hSet(`user:${username}`, 'password', hashedPassword);
    await client.hSet(`user:${username}`, 'role', role);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});


// 🔹 **2. Login User**
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await client.hGetAll(`user:${username}`);
  
  if (!user.password) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Generate a JWT token
  const token = jwt.sign({ username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ token, role: user.role });
});


// 🔹 **3. Middleware to Protect Routes**
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) return res.status(403).json({ message: 'No token provided' });

  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });

    req.user = decoded;
    next();
  });
};


// 🔹 **4. Protected Route (Example)**
app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.username}, Role: ${req.user.role}` });
});


// CRUD Operations


// Route to save student data
app.post('/students', async (req, res) => {
  const { id, name, gender, age, address, occupation, religion, status } = req.body;


  // Validate input fields
  if (!id || !name || !gender || !age || !address || !occupation || !religion || !status ) {
    return res.status(400).json({ message: 'All fields are required' });
  }


  try {
    // Set student data in Redis (using object syntax for Redis v4 and above)
    const studentData = { name, gender, age, address, occupation, religion, status };


    // Save student data in Redis hash
    await client.hSet(`student:${id}`, 'name', studentData.name);
    await client.hSet(`student:${id}`, 'gender', studentData.gender);
    await client.hSet(`student:${id}`, 'age', studentData.age);
    await client.hSet(`student:${id}`, 'address', studentData.address);
    await client.hSet(`student:${id}`, 'occupation', studentData.occupation);
    await client.hSet(`student:${id}`, 'religion', studentData.religion);
    await client.hSet(`student:${id}`, 'status', studentData.status);


    // Respond with success message
    res.status(201).json({ message: 'Pro saved successfully' });
  } catch (error) {
    console.error('Error saving student:', error);
    res.status(500).json({ message: 'Failed to save student' });
  }
});


// Read (R)
app.get('/students/:id', async (req, res) => {
  const id = req.params.id;
  const student = await client.hGetAll(`student:${id}`);
  if (Object.keys(student).length === 0) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json(student);
});


// Read all students
app.get('/students', async (req, res) => {
  const keys = await client.keys('student:*');
  const students = await Promise.all(keys.map(async (key) => {
    return { id: key.split(':')[1], ...(await client.hGetAll(key)) };
  }));
  res.json(students);
});


// Update (U)
app.put('/students/:id', async (req, res) => {
  const id = req.params.id;
  const { name, gender, age, address, occupation, religion, status } = req.body;


  if (!name && !gender && !age && !address && !occupation && !religion && !status) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }


  try {
    const existingStudent = await client.hGetAll(`student:${id}`);
    if (Object.keys(existingStudent).length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }


    // Update student data in Redis
    if (name) await client.hSet(`student:${id}`, 'name', name);
    if (gender) await client.hSet(`student:${id}`, 'gender', gender);
    if (age) await client.hSet(`student:${id}`, 'age', age);
    if (address) await client.hSet(`student:${id}`, 'address', address);
    if (occupation) await client.hSet(`student:${id}`, 'occupation', occupation);
    if (religion) await client.hSet(`student:${id}`, 'religion', religion);
    if (status) await client.hSet(`student:${id}`, 'status', status);


    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
});


// Delete (D)
app.delete('/students/:id', async (req, res) => {
  const id = req.params.id;
  await client.del(`student:${id}`);
  res.status(200).json({ message: 'Profile deleted successfully' });
});

// Setup multer to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.post('/students/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse CSV using papaparse
    const csvData = req.file.buffer.toString();
    const Papa = require('papaparse');
    const parsedData = Papa.parse(csvData, { header: true });

    const students = parsedData.data.filter(student => student.id); // Ensure valid records

    // Save each student record to Redis
    for (const student of students) {
      await client.hSet(`student:${student.id}`, student);
    }

    res.status(200).json({ message: 'CSV uploaded successfully', students });
  } catch (error) {
    console.error('CSV upload error:', error);
    res.status(500).json({ message: 'Error processing CSV' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});













