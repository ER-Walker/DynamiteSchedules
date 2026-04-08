import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { join } from 'path';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

const app = express();
const rootDir = process.cwd();

dotenv.config({ path: join(rootDir, '.env') });
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
    console.log(`Mongo counts -> users: ${usersCount}, students: ${studentsCount}`);
  })
	.catch(err => console.error('Connection error: ' , err));

app.use(express.json());
app.use(express.static(rootDir));
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);

app.get('/', (req, res) => {
    console.log('Serving file: ' + rootDir + '/pages/login.html');
    res.sendFile(join(rootDir, 'pages/login.html'));
});

app.get('/resources', (req,res) => {
    console.log('Serving file: ' + rootDir + '/pages/resources.html');
    res.sendFile(join(rootDir, 'pages/resources.html'));
})

app.get('/index', (req,res) => {
    console.log('Serving file: ' + rootDir + '/pages/index.html');
    res.sendFile(join(rootDir, 'pages/index.html'));
})

app.listen(port, () => {
    console.log('Server is listening on port ' + port);
})
