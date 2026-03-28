const express = require('express'); // Import the express module
const app = express();              // Create an Express application instance
const PORT = 3000;                  // Define the port number

// Define a basic route for the root URL (/)
app.get('/', (req, res) => {
  res.send('Hello World!'); // Send a response back to the client
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is running on dynamiteschedules.com`); // Log a message to the console when the server starts
});
