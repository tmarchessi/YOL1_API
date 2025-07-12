import 'dotenv/config'; 
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use(cors());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user; 
    next();
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access denied: User role not found' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied: You need one of these roles: ${roles.join(', ')}` });
    }
    next();
  };
};


const generateAndNormalizeScore = (inputCode) => {
    const hash = crypto.createHash('sha256').update(inputCode).digest('hex');

    const hashAsInt = parseInt(hash.substring(0, 8), 16);
    
    const normalizedScore = hashAsInt % 101; 

    return normalizedScore;
};


app.post('/api/register', async (req, res) => {
  const { rut, password, role } = req.body;
  if (!rut || !password) {
    return res.status(400).json({ message: 'RUT and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        rut,
        password: hashedPassword,
        role: role || 'user',
      },
    });
    res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'RUT already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.post('/api/login', async (req, res) => {
  const { rut, password } = req.body;
  if (!rut || !password) {
    return res.status(400).json({ message: 'RUT and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { rut },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid RUT or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid RUT or password' });
    }

    const token = jwt.sign(
      { id: user.id, rut: user.rut, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/score', authenticateToken, authorizeRole(['user', 'admin']), async (req, res) => {
  const { code } = req.query; 


  if (!code && req.user.role === 'admin') {
    try {
      const allScores = await prisma.score.findMany();
      return res.status(200).json(allScores);
    } catch (error) {
      console.error('Error fetching all scores for admin:', error);
      return res.status(500).json({ message: 'Internal server error fetching all scores' });
    }
  }


  if (!code) {
    
    return res.status(400).json({ message: 'Code is required to retrieve a specific score.' });
  }

  try {
    let scoreRecord = await prisma.score.findUnique({
      where: { code },
    });

    
    if (!scoreRecord) {
      const generatedScoreValue = generateAndNormalizeScore(code); 

      scoreRecord = await prisma.score.create({
        data: {
          code,
          value: generatedScoreValue,
        },
      });

      return res.status(201).json({ score: scoreRecord.value, message: 'Score generated and created successfully!' });
    } else {
      return res.status(200).json({ score: scoreRecord.value });
    }
  } catch (error) {
    console.error('Get/Create score error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/admin/data', authenticateToken, authorizeRole(['admin']), (req, res) => {
  res.status(200).json({ message: 'This is sensitive admin data!', user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('---');
  console.log('To register a test user (e.g., "12345678-9" with "password123"):');
  console.log('  curl -X POST -H "Content-Type: application/json" -d "{\\"rut\\": \\"12345678-9\\", \\"password\\": \\"password123\\", \\"role\\": \\"user\\"}" http://localhost:3001/api/register');
  console.log('To register an admin user (e.g., "98765432-1" with "adminpass", role "admin"):');
  console.log('  curl -X POST -H "Content-Type: application/json" -d "{\\"rut\\": \\"98765432-1\\", \\"password\\": \\"adminpass\\", \\"role\\": \\"admin\\"}" http://localhost:3001/api/register');
  console.log('To add a test score (e.g., code "ABC123" with score 100):');
  console.log('  curl -X POST -H "Content-Type: application/json" -d "{\\"code\\": \\"ABC123\\", \\"value\\": 100}" http://localhost:3001/api/scores_seed');
  console.log('---');
});


app.post('/api/scores_seed', async (req, res) => {
    try {
        const { code, value } = req.body;
        if (!code || typeof value !== 'number') {
            return res.status(400).json({ message: 'Code and a numeric value are required.' });
        }
        const score = await prisma.score.create({
            data: { code, value }
        });
        res.status(201).json({ message: 'Score seeded successfully', score });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ message: 'Code already exists.' });
        }
        console.error('Error seeding score:', error);
        res.status(500).json({ message: 'Internal server error during seeding.' });
    }
});