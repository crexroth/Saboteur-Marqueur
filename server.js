const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const config = require('./config.server.js');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public')); // Serve your HTML, CSS, and JS files

// API route to handle form submission
app.post('/submit', (req, res) => {
    const data = req.body;
    
    // Prepare CSV data
    const csvData = [
        ["Game Date", "Num Players", "Players", "Stealing Data"],
        [
            data.gameDate,
            data.numPlayers,
            JSON.stringify(data.players),
            JSON.stringify(data.stealing),
        ],
    ];
    
    const csvContent = "data:text/csv;charset=utf-8,"
        + csvData.map(row => row.join(",")).join("\n");

    const filePath = path.resolve(config.csvFilePath);
    
    // Append data to CSV file
    fs.appendFile(filePath, csvContent + '\n', (err) => {
        if (err) {
            return res.status(500).send('Error writing to file');
        }
        res.status(200).send('Data saved successfully');
    });
});

app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
});
