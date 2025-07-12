import 'dotenv/config'; // Esto es un patrón común para cargar dotenv en ES Modules

import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
-
app.use(express.json());
app.use(cors());

// Middleware for authentication
// Middleware for authentication
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
  
  // ... el middleware authorizeRole no necesita cambios directos si solo usa req.user.role

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access denied: User role not found' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

app.post('/api/register', async (req, res) => {
    const { rut, password, role } = req.body; // AHORA
  
    if (!rut || !password) { // Actualiza la validación
      return res.status(400).json({ message: 'RUT and password are required' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          rut, // Usar 'rut'
          password: hashedPassword,
          role: role || 'user',
        },
      });
      res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'P2002') {
        return res.status(409).json({ message: 'RUT already exists' }); // Mensaje actualizado
      }
      res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
// const { username, password } = req.body; // ANTES
    const { rut, password } = req.body; // AHORA
  
    if (!rut || !password) { // Actualiza la validación
      return res.status(400).json({ message: 'RUT and password are required' });
    }
  
    try {
      const user = await prisma.user.findUnique({
        // where: { username }, // ANTES
        where: { rut }, // AHORA: Busca por RUT
      });
  
      if (!user) {
        return res.status(401).json({ message: 'Invalid RUT or password' }); // Mensaje actualizado
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid RUT or password' }); // Mensaje actualizado
      }
  
      // Generar JWT token
      const token = jwt.sign(
        // { id: user.id, username: user.username, role: user.role }, // ANTES
        { id: user.id, rut: user.rut, role: user.role }, // AHORA: Incluye 'rut' en el payload del JWT
        JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
});

// GET Endpoint: Protected - Get Score
app.get('/api/score', authenticateToken, authorizeRole(['user', 'admin']), async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ message: 'Code is required' });
  }

  try {
    const scoreRecord = await prisma.score.findUnique({
      where: { code },
    });

    if (!scoreRecord) {
      return res.status(404).json({ message: 'Score not found for this code' });
    }

    res.status(200).json({ score: scoreRecord.value });
  } catch (error) {
    console.error('Get score error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET Endpoint: Protected - Admin only example (optional)
app.get('/api/admin/data', authenticateToken, authorizeRole(['admin']), (req, res) => {
  res.status(200).json({ message: 'This is sensitive admin data!', user: req });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('---');
  console.log('To register a test user (e.g., "testuser" with "password123"):');
  console.log('  curl -X POST -H "Content-Type: application/json" -d "{\\"username\\": \\"testuser\\", \\"password\\": \\"password123\\", \\"role\\": \\"user\\"}" http://localhost:3001/api/register');
  console.log('To add a test score (e.g., code "ABC123" with score 100):');
  console.log('  curl -X POST -H "Content-Type: application/json" -d "{\\"code\\": \\"ABC123\\", \\"value\\": 100}" http://localhost:3001/api/scores_seed');
  console.log('---');
});

// Endpoint for seeding initial scores (for testing, not part of core requirements)
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