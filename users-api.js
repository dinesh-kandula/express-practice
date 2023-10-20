// This module contains the User details API's [CRUD practice]
const express = require('express');
const mysql = require('mysql');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080; //Enivronmental Variables

//this middle function is used to run static HTML page
app.use(express.static(path.join(__dirname, 'TechVedikaClone'))); 

//used to recognize the incoming request as JSON object and parse it
app.use(express.json());

// Pool Connection Credentials
const pool  = mysql.createPool({
    connectionLimit : 10,
    host : 'localhost',
    user : 'root',
    password: 'Techv1@3',
    database: 'dinnu'
});

const connection = mysql.createConnection({
    connectionLimit : 10,
    host : 'localhost',
    user : 'root',
    password: 'Techv1@3',
    database: 'dinnu'
});


connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
   
    console.log('connected as id ' + connection.threadId);
  });


// Api will send HTML Content as response
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'TechVedikaClone', './index.html')); //sending html file page
});

// Display all the list of users
app.get("/users/", (req, res) => {
    connection.query('SELECT * FROM persons;', function (error, results, fields) {
        if(results.length === 0){
            res.status(404).send(`No Data Found in the table`);
        }else{
            res.send(JSON.stringify(results));
        }
      });
});

// Display the specific user details using user Id
app.get("/user/:id", (req, res) => {
    const params = req.params
    const {id} = params
    connection.query(`SELECT * FROM persons WHERE id=${id};`, (error, results) => {
        if (error) {
            res.status(502).send(`Bad Gateway`);
        }
        if (results.length === 0) {
            res.status(404).send(`No User found with user ID - ${id}`);
        } else {
            res.send(JSON.stringify(results));
        }
    })
});

// Add Person Api
app.post("/users/", (req, res) => {
    const {first_name, last_name, age, city} = req.body;
    const addPersonQuery = 
    `INSERT INTO 
    persons(first_name, last_name, age, city)
    VALUES('${first_name}', '${last_name}', ${age}, '${city}');`
    pool.query(addPersonQuery, (error, result) => {
        if (error) {
            res.status(502).send(`Bad Gateway`);
        }else{
            res.send(`User added and user id: ${result.insertId}`);
        }
    });
});

// Update person Api
app.put("/users/:id", (req, res) => {
    const {id} = req.params;
    const bodyObj = req.body;
   
    // Update 
    let setQuery = `SET `;
    for (let key in bodyObj){
        switch (key) {
            case 'age':
                setQuery += (`${key}=${bodyObj[key]},`)
                break
            default:
                setQuery += (`${key}='${bodyObj[key]}',`)
                break
        };
    }
    setQuery = setQuery.substring(0, setQuery.length-1);
    const updateQuery = `
    UPDATE persons
    ${setQuery}
    WHERE id=${id};
    `

    pool.query(`SELECT * FROM persons WHERE id=${id};`, (error, results) => {
        if (error) return res.status(502).send(`Bad Gateway`);
        if (results.length === 0){
             return res.status(404).send(`No User found to update the details with user ID - ${id}`);
        }else{
            pool.query(updateQuery, (error, result) => {
                if(error){
                    return res.status(502).send(`Bad Gateway`);
                }else{
                    res.send(`Updated the user details, user id: ${id}`);
                }
            });
        }
    });

    
})

// Delete Person Api
app.delete("/users/:id", (req, res) => {
    const {id} = req.params;
    pool.query(`DELETE FROM persons WHERE id=${id};`, (error, result) => {
        if(error){
            return res.status(502).send(`Bad Gateway`);
        }else{
            res.send(`Successfully Deleted the user id: ${id}`);
        }
    })
});


app.listen(port, () => {
    console.log(`Listening on port and running on http://localhost:${port}`);
});
