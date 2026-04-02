import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import {dirname, join} from 'path';

const app = express();
const port = 3000;
const __dirname = '/var/www/dynamiteschedules/DynamiteSchedules';
let filePath = __dirname;

console.log('Server is running on port ' + port);

dotenv.config({path: join(__dirname, '.env')});
mongoose.connect(process.env.MONGO_URI)
	.then(() => console.log('Connected to MongoDB'))
	.catch(err => console.error('Connection error: ' , err));

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    filePath += '/pages/login.html';
    console.log('Serving file: ' + filePath);
    res.sendFile(filePath);
    filePath = __dirname;
});

app.get('/resources', (req,res) => {
    filePath += '/pages/resources.html';
    console.log('Serving file: ' + __dirname + '/pages/resources.html');
    res.sendFile(filePath);
    filePath = __dirname;
})

app.get('/index', (req,res) => {
    filePath += '/pages/index.html';
    console.log('Serving file: ' + __dirname + '/pages/index.html');
    res.sendFile(filePath);
    filePath = __dirname;
})

app.listen(port, () => {
    console.log('Server is listening on port ' + port);
})
