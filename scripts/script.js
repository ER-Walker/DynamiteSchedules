import express from 'express';

const app = express();
const port = 3000;

console.log('Server is running on port ' + port);

app.get('/', (req, res) => {
    const filePath = import.meta.dirname + '/../pages/index.html';
    console.log('Serving file: ' + filePath);
    res.sendFile(filePath);
});

app.listen(port, () => {
    console.log('Server is listening on port ' + port);
})