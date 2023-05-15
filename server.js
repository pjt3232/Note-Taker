//imports express.js, the file path file system, the file system, and are random id function
const express = require('express');
const path = require('path')
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

//intiates our app and PORT for heroku or your local server
const app = express();
const PORT = process.env.PORT || 3001;

//middleware:
//parses incoming HTTP requests with url payloads
app.use(express.urlencoded({extended: true}));
//parses incoming HTTP requests with JSON payloads
app.use(express.json());
//takes public directory and serves any files in that directory
app.use(express.static('public'));

//HTTP get request for notes html
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

//HTTP get request for the /api/notes path to grab the db.json data
app.get('/api/notes', (req, res) => {
    //variable for the db.json file path
    const dbFilePath = path.join(__dirname, './db/db.json');
    
    //reads the db.json file and returns the data as json data
    fs.readFile(dbFilePath, 'utf8', (err, data) => {
        //returns error and console.error if there is an error
        if(err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Service Error' });
        } 

        //parses the data that could potentially be an error so we try it
        //if error comes from this part of the data we catch it with this code
        let notes;
        try {
            //parses the json data retrieved from db.json
            notes = JSON.parse(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Service Error' });
        }

        //sends the data as a JSON response
        res.json(notes);
    });
});

//HTTP post request for the /api/notes path to post json data onto the notes html page
app.post('/api/notes', (req, res) => {
    //assigns variables to the req.body and db.json file path
    const newNote = req.body;
    const dbFilePath = path.join(__dirname, '/db/db.json');

    //reads the data from the db.json file and writes a new file based on the data in the file
    fs.readFile(dbFilePath, 'utf8', (err, data) => {
        //returns error and console.error if there is an error
        if(err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Service Error' });
        }

        //parses the data that could potentially be an error so we try it
        //if error comes from this part of the data we catch it with this code
        let notes;
        try {
            //parses the json data retrieved from db.json
            notes = JSON.parse(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Service Error' });
        }

        //assigns the new note a random id with uuidv4 function that was imported
        const newNoteId = uuidv4();
        //new note's id is the random id created by the function uuidv4
        newNote.id = newNoteId;
        //pushes the new note with the random id to the json data's array of notes
        notes.push(newNote);

        //writes the notes object to the db.json file 
        fs.writeFile(dbFilePath, JSON.stringify(notes), (err) => {
            //returns error and console.error if there is an error
            if(err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal Service Error' });
            }

            //sends newNote as a JSON response
            res.json(newNote);
        });
    });
});

//HTTP delete request to the /api/notes/:id path which is the unique id for a note
app.delete('/api/notes/:id', (req, res) => {
    //assigns variable to the req.params.id and the db.json file path
    const noteId = req.params.id;
    const dbFilePath = path.join(__dirname, '/db/db.json');

    //reads the db.json file and writes a file with the deleted id from the db.json file
    fs.readFile(dbFilePath, 'utf8', (err, data) => {
        if(err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal Service Error' });
        }
        
        //parses the data that could potentially be an error so we try it
        //if error comes from this part of the data we catch it with this code
        let notes;
        try {
            //parses the json data retrieved from db.json
            notes = JSON.parse(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Service Error' });
        }

        //creates new array for the notes if the id is not equal to the req.params object. Simply put deletes the obejct specified from notes
        const updatedNotes = notes.filter((note) => note.id !== noteId);

        //writes new db.json file and turns the new array's json data into a string
        fs.writeFile(dbFilePath, JSON.stringify(updatedNotes), (err) => {
            if(err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal Service Error' });
            }

            //JSON object that indicates the file was successfully created
            res.json({ success: true });
        });
    });
});

//HTTP get request using wildcard route that redirects the client to the index.html page if no other routes match
//this is lower in the code because I had issues with it overriding my other get requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

//creates the server at the said localhost PORT
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});