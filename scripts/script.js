import express from 'express';
import __dirname from 'path';

const app = express();
const port = 3000;

console.log('Server is running on port ' + port);

app.get('/', (req, res) => {
    res.sendFile('DynamiteScheduling/pages/login.html', { root: __dirname });
});

app.listen(port, () => {
    console.log('Server is listening on port ' + port);
})