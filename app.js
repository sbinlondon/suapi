const express = require('express');
const fs = require('fs');
const bp = require('body-parser');

const app = express();
const api = express.Router();



/// FUNCTIONS

function keyify(string) {
    const getTitles = string.split(`\r\n`)
    // get json keys
    const keysArr = []
    keysArr.push(getTitles[0])
    const keys = keysArr[0].split(',')
    return keys
}

function charify(string) {
    const getTitles = string.split(`\r\n`)
    getTitles.shift()
    const chars = getTitles
    return chars
}

function process(keys, chars) {
    const json = []
    for (i = 0; i < chars.length; i++) {
        const values = chars[i].split(',')
        let newChar = {}
        for (j = 0; j < keys.length; j++) {
            const newKey = keys[j]
            const newValue = values[j]
            newChar = {
                ...newChar,
                [newKey]: newValue
            }
        }
        json.push(newChar)
    }
    return json
}

function refreshData() {
    const sudata = fs.readFileSync('./suapi.csv', 'UTF-8')
    const newsudata = process(keyify(sudata), charify(sudata))
    const data = new Uint8Array(Buffer.from(JSON.stringify(newsudata)));
    fs.writeFile('./su.json', data, (err) => {
        if (err) throw err;
        console.log(err)
    });
}

///

api.get('/', (req, res) => {
    refreshData()
    fs.readFile('./su.json', 'utf-8', (err, data) => {
        if (err) throw err;
        res.json(JSON.parse(data));
    });
});

api.get('/:name', (req, res) => {
    refreshData()
    fs.readFile('./su.json', 'utf-8', (err, data) => {
        if (err) throw err;
        const filtered = JSON.parse(data).filter(character => character.name.includes(req.params.name));
        if (filtered.length < 1) {
            res.json({
                "error": "Sorry, something's gone wrong. That doesn't appear to be a character."
            })
        } else {
            res.json(filtered);
        }
    });
});

api.get('/fusions', (req, res) => {
    refreshData()
    fs.readFile('./su.json', 'utf-8', (err, data) => {
        if (err) throw err;
        const filtered = JSON.parse(data).filter(character => character.fusion !== "");
        res.json(filtered);
    });
});

api.get('/csv', (req, res) => {
    const sudata = fs.readFileSync('./suapi.csv', 'UTF-8');
    res.json(sudata);
});

// api.post('/add', (req, res) => {
//     pokedata.push(req.body);
//     res.json('ok cowboy');
// });

api.use(bp.json());
app.use('/api', api);

app.set('port', 1989);
app.set('host', 'localhost');

module.exports = app;