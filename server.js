const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const ejs = require('ejs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const path = require('path');

const pool = require('./config/database'); // database.js

// Serve static files (if needed)
// app.use(express.static(__dirname + '/public'));


app.set('view engine', 'ejs'); // Set EJS as the template engine
// Set the views directory (if it's not in the default location)
app.set('views', path.join(__dirname, 'src/views'));


// Define routes (if needed)
app.get('/', (req, res) => {
    // res.sendFile(__dirname + '/index.html');
    res.render('index', {
        connectedUsers,
        userCount
    }); // Render the index.ejs file

});
app.get('/items', async (req, res) => {
    try {
        const [rows, fields] = await pool.execute('SELECT * FROM items'); // Use pool.execute() for queries
        // res.json(rows);
        console.log("somebody access this page");
        res.render('items', {
            data: rows
        });
    } catch (error) {
        console.error('Error executing MySQL query:', error);
        res.status(500).send('Internal Server Error');
    }
});




let connectedUsers = 0; // Variable to keep track of connected users
let userCount = 0; // Variable to assign unique IDs to users

// Socket.io logic
io.on('connection', (socket) => {
    connectedUsers++; // Increment on connection
    userCount++;
    socket.userCount = userCount;

    io.emit('user connected', {
        userCount: userCount,
        connectedUsers: connectedUsers
    });

    // Handle messages
    socket.on('message', (message) => {
        io.emit('message', message); // Broadcast the message to all connected clients
        console.log(message);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        connectedUsers--; // Decrement on disconnection
        io.emit('user connected', {
            userCount: userCount,
            connectedUsers: connectedUsers
        });
        console.log('User disconnected');
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});