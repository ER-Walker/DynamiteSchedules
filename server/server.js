import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import degreeRequirementRoutes from './routes/degreeRequirementRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import scheduleCartRoutes from './routes/scheduleCartRoutes.js';
import {requireAuth } from './auth/auth.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });
const port = Number(process.env.PORT) || 3000;

console.log('Server is running on port ' + port);

mongoose.connect(process.env.MONGO_URI)
	.then(async () => {
    console.log('Connected to MongoDB');
    console.log(
      `Mongo target: ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`
    );

    const usersCount = await mongoose.connection.collection('users').countDocuments();
    const studentsCount = await mongoose.connection.collection('students').countDocuments();
    const degreeRequirementsCount = await mongoose.connection
      .collection('degreeRequirements')
      .countDocuments();
    const coursesCount = await mongoose.connection.collection('courses').countDocuments();
    const scheduleCartsCount = await mongoose.connection.collection('scheduleCarts').countDocuments();
    console.log(
      `Mongo counts -> users: ${usersCount}, students: ${studentsCount}, degreeRequirements: ${degreeRequirementsCount}, courses: ${coursesCount}, scheduleCarts: ${scheduleCartsCount}`
    );
  })
	.catch(err => console.error('Connection error: ' , err));

app.use(express.json());
app.use(cookieParser());
app.use(express.static(rootDir));


app.get('/', (req, res) => {
    console.log('Serving file: ' + rootDir + '/pages/login.html');
    res.sendFile(path.join(rootDir, 'pages/login.html'));
});

app.get('/resources', requireAuth, (req,res) => {
    console.log('Serving file: ' + rootDir + '/pages/resources.html');
    res.sendFile(path.join(rootDir, 'pages/resources.html'));
})

app.get('/index', requireAuth, (req,res) => {
    console.log('Serving file: ' + rootDir + '/pages/index.html');
    res.sendFile(path.join(rootDir, 'pages/index.html'));
})

app.get('/dashboard', requireAuth, (req, res) => {
    console.log('Serving file: ' + rootDir + '/pages/dashboard.html');
    res.sendFile(path.join(rootDir, 'pages/dashboard.html'));
})

app.get('/schedule', requireAuth, (req, res) => {
    console.log('Serving file: ' + rootDir + '/pages/schedule.html');
    res.sendFile(path.join(rootDir, 'pages/schedule.html'));
})

app.use(express.static(rootDir));
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/degree-requirements', degreeRequirementRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/schedule-carts', scheduleCartRoutes);

app.listen(port, () => {
    console.log('Server is listening on port ' + port);
})
