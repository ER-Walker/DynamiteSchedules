import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import {dirname, join} from 'path';

const app = express();
const port = 3000;
const __dirname = '/var/www/dynamiteschedules/DynamiteSchedules';

console.log('Server is running on port ' + port);

dotenv.config({path: join(__dirname, '.env')});
mongoose.connect(process.env.MONGO_URI)
	.then(() => console.log('Connected to MongoDB'))
	.catch(err => console.error('Connection error: ' , err));

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    console.log('Serving file: ' + __dirname + "/pages/login.html");
    res.sendFile(join(__dirname, "/pages/login.html"));
});

app.get('/resources', (req,res) => {
    console.log('Serving file: ' + __dirname + '/pages/resources.html');
    res.sendFile(join(__dirname, "/pages/resources.html"));
})

app.get('/index', (req,res) => {
    console.log('Serving file: ' + __dirname + '/pages/index.html');
    res.sendFile(join(__dirname, "/pages/index.html"));
})

app.get('/styles/resourceStyle', (req,res) => {
    console.log('Serving file: ' + __dirname + '/styles/resourceStyle.css');
    res.sendFile(join(__dirname, '/styles/resourceStyle.css'));
})

app.listen(port, () => {
    console.log('Server is listening on port ' + port);
})
