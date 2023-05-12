const express = require('express');
const path = require('path')
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    const dbFilePath = path.join(__dirname, './db/db.json');
    
    fs.readFile(dbFilePath, 'utf8', (err, data) => {
        if(err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Service Error' });
        } 

        let notes;
        try {
            notes = JSON.parse(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Service Error' });
        }

        res.json(notes);
    });
});

app.post('/api/notes', (req, res) => {
    const newNote = req.body;
    const dbFilePath = path.join(__dirname, '/db/db.json');

    fs.readFile(dbFilePath, 'utf8', (err, data) => {
        if(err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Service Error' });
        }

        let notes;
        try {
            notes = JSON.parse(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Service Error' });
        }

        const newNoteId = uuidv4();
        newNote.id = newNoteId;
        notes.push(newNote);

        fs.writeFile(dbFilePath, JSON.stringify(notes), (err) => {
            if(err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal Service Error' });
            }

            res.json(newNote);
        });
    });
});

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    const dbFilePath = path.join(__dirname, '/db/db.json');

    fs.readFile(dbFilePath, 'utf8', (err, data) => {
        if(err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Service Error' });
        }
        
        let notes;
        try {
            notes = JSON.parse(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Service Error' });
        }

        const updatedNotes = notes.filter((note) => note.id !== noteId);

        fs.writeFile(dbFilePath, JSON.stringify(updatedNotes), (err) => {
            if(err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal Service Error' });
            }

            res.json({ success: true });
        });
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});