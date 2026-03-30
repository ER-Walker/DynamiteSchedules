import express from 'express';

const app = express();
const port = 3000;

console.log('Server is running on port ' + port);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages/login.html'));
});

app.listen(port, () => {
    console.log('Server is listening on port ' + port);
})