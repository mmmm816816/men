const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Database
mongoose.connect('mongodb://localhost/m');

const db = mongoose.connection;

db.once('open', () => {
    console.log('Connected to MongoDB database...')
})

// HTML routes
app.get('/', (req, res) => {
    //res.send('Hello');
    console.log(req.headers);
    res.sendFile(__dirname + '/index.html')
})

app.get('/copy', (req, res) => {
    //res.send('Hello');
    res.sendFile(__dirname + '/index copy.html')
})

app.get('/wsmongo', (req, res) => {
    //res.send('Hello');
    res.sendFile(__dirname + '/wsmongo.html')
})

/*
app.get('/about', (req, res) => {
    res.send('about');
});
*/

const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: server });

wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    const ipBehindProxy = req.headers['x-forward-for']; //.split(',')[0].trim();
    console.log(`New client connected: {ip:${ip}, ipBehindProxy:${ipBehindProxy}}`);
    //ws.send('Welcome NEW CLIENT');
    wss.clients.forEach((client) => {
        if (client === ws && client.readyState === WebSocket.OPEN) {
            client.send('welcome new client1. following is the latest requested info');
        }
    })
    // broadcast message, excluding itself
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        wss.clients.forEach((client) => { // client is the ws object
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

});

app.use(bodyParser.json()); // otherwise, req.body.config.data == string

// MongoDB routes
/*
const mRoute = require('./routes/xxxRoute');
app.use('/xxx', mRoute); // http://localhost:3000/xxx
*/
const xxxModel = require('./models/xxxModel');
const socket = new WebSocket('ws://localhost:3000');

app.get('/yyy', async (req, res) => {
    const getDocument = await xxxModel.find();
    res.json(getDocument);
    socket.send('get from mongo');
});

// Get specific documents by id
app.get('/yyy/:id', async (req, res) => {
    const q = await xxxModel.findById({ _id: req.params.id });
    res.json(q);
});

// Get specific documents by laneNo
app.get('/laneno/:laneNo', async (req, res) => {
    const q = await xxxModel.find({ laneNo: req.params.laneNo });
    res.json(q);
});

// Create new document
app.post('/yyy', async (req, res) => {
    const postDocument = new xxxModel(req.body);
    console.log(req);
    const postDocumentSaved = await postDocument.save();
    res.json(postDocumentSaved);
    //socket.send('post event');
});

// Delete a document
app.delete('/yyy/:id', async (req, res) => {
    const result = await xxxModel.findByIdAndDelete({ _id: req.params.id });
    res.json(result);
});

// Update a quote by id
app.patch('/yyy/:id', async (req, res) => {
    const q = await xxxModel.updateOne({ _id: req.params.id }, { $set: req.body });
    res.json(q);
});

// Update a quote by id
app.patch('/rackno/:rackNo', async (req, res) => {
    const q = await xxxModel.updateOne({ rackNo: req.params.rackNo }, { $set: req.body });
    res.json(q);
    socket.send('updated...');
});

app.use(express.static('public'));
app.use('/scripts', express.static(__dirname + 'public/scripts')) // DevTools failed to load source map: Could not load content for http://localhost:3000/scripts/axios.min.map: HTTP error: status code 404, net::ERR_HTTP_RESPONSE_CODE_FAILURE
// app.use('/js', express.static(__dirname + 'scripts')) // GET http://localhost:3000/scripts/axios.min.js net::ERR_ABORTED 404 (Not Found)

// Start server
server.listen(3000, console.log('Listening on port 3000'));