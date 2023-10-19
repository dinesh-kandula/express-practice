// This module is desgined for ToDo's application

const express = require('express');
const mysql = require('mysql2');
const Joi = require('joi');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

const priorityConstants = ["HIGH","MEDIUM","LOW"];
const statusConstants = ["TO DO", "IN PROGRESS", "DONE"];

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password: 'Techv1@3',
    database: 'dinnu'
});

connection.connect(function(error) {
    if (error) {
      console.error('DB error connecting: ' + error.stack);
      return;
    }   
    console.log('DB connected');
});


// API-1 Display all the list of todos with/without filters
app.get("/todos/", (req, res) => {
    const queryParams = req.query
    const query = allTodosQueryWithFilters(queryParams);
    // console.log(query)
    connection.query(query, (error, results) => {
        if(error){
            console.log(error.message);
            res.status(502);
            return;
        }
        res.send(results);
    });
});

// Query for getting todo's with/without filters
const allTodosQueryWithFilters = (queryParams) => {
    let query = `SELECT * FROM todo `

    if(Object.keys(queryParams).length > 0){
        let whereClause = `WHERE `
        for (let key in queryParams){
            if(key === 'search_q'){
                whereClause += `todo LIKE '%${queryParams[key]}%' AND `;
            }else{
                const valueArr = queryParams[key].split(",");
                let condition = '';
                for (value of valueArr) {
                    condition += `'${value}',`;
                }
                condition = condition.substring(0, condition.length-1);
                whereClause += `${key} IN (${condition}) AND `
            }
        }
        whereClause = whereClause.substring(0, whereClause.length-4);

        query += whereClause;
        }
    query += ";";
    return query;
}

// API-2 get todo api
app.get("/todos/:todoId", (req, res) => {
    const {todoId} = req.params
    const query = `SELECT * FROM todo WHERE id=${todoId};`
    connection.query(query, (error, results) => {
        if(error){
            console.log(error.message);
            res.status(502);
            return;
        }
        res.send(results[0]);
    });
})

// API-3 Add todo api
app.post("/todos", (req, res) => {
    const todoBody = req.body;
    const {todo, priority, status} = todoBody;
    const validations = checkPostValidations(todoBody);

    if(validations.error){
        res.status(400).send(validations.error.details[0].message);
    }

    const postQuery = `INSERT INTO todo (todo, priority, status)
    VALUES('${todo}', '${priority}', '${status}');`;
    
    connection.query(postQuery, (error, result) => {
        if(error){
            console.log(error.message);
            res.status(502);
            return;
        }
        res.send(`Todo Successfully Added Todo Id: ${result.insertId}`);
    })
})

// Function to check the validation of todo body details 
const checkPostValidations = (todoBody) => {
    const joiSchema = {
        todo: Joi.string().min(3).required(),
        priority: Joi.string().valid(...priorityConstants),
        status: Joi.string().valid(...statusConstants)
    }
    return Joi.validate(todoBody, joiSchema);
}

app.listen(port, () => {
    console.log('Server is up and running on http://localhost:8080');
});
