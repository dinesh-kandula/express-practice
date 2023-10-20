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

    // get the WHERE Clause if pueryParams are passed
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
        res.send(results);
    });
})

// API-3 Add todo api
app.post("/todos", (req, res) => {
    const todoBody = req.body;
    const {todo, priority, status} = todoBody;
    const validations = checkPostValidations(todoBody);

    if(validations.error) return res.status(400).send(validations.error.details[0].message);
    
    const postQuery = `INSERT INTO todo (todo, priority, status) VALUES('${todo}', '${priority}', '${status}');`;
    
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

// API-4 Update the todo
app.put("/todos/:todoId", (req, res) => {
    const {todoId} = req.params;
    const todoBody = req.body

    // Update Query
    let setQuery = `SET `
    for (let key in todoBody){
        setQuery += (`${key}='${todoBody[key]}',`)
    }
    setQuery = setQuery.substring(0, setQuery.length-1);
    const updateQuery = `
    UPDATE todo
    ${setQuery}
    WHERE id=${todoId};
    `

    // Validation of Body Object
    const {error} = checkUpdateValidations(todoBody);
    if(error) return res.status(400).send(error.details[0].message);
    
    // Validating weather the todoId is valid 
    const query = `SELECT * FROM todo WHERE id=${todoId};`
    connection.query(query, (error, results) => {
        if(error){
            console.log(error.message);
            res.status(502);
            return;
        }
        if(results.length === 0) { 
            res.status(404).send(`No todo found with todoId: ${todoId}`);
            return;
        }else{
             // Executing the Update Query
            connection.query(updateQuery, (error, result) => {
                if(error){
                    return res.status(502).send(`Bad Gateway`);
                }else{
                    res.send(`Updated the todo, todoId: ${todoId}`);
                }
            })
        }
    });
})

// Function to check the validation of todo body details for updating
const checkUpdateValidations = (todoBody) => {
    const joiSchema = {
        todo: Joi.string().min(3),
        priority: Joi.string().valid(...priorityConstants),
        status: Joi.string().valid(...statusConstants)
    }
    return Joi.validate(todoBody, joiSchema);
}


// API-5 Delte Todo
app.delete("/todos/:todoId/", (req, res) => {
    const {todoId} = req.params
    connection.query(`DELETE FROM todo WHERE id=${todoId};`, (error, result) => {
        if(error){
            return res.status(502).send(`Bad Gateway`);
        }else{
            res.send(`Todo Deleted, todo id: ${todoId}`);
        }
    })
})


// Listener
app.listen(port, () => {
    console.log('Server is up and running on http://localhost:8080');
});
