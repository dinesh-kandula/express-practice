# *Todo Application*

`Create a table with the name todo with the following columns`

### Todo Table

| Column     |	Type    |
|:---------  |:--------:|
| `id      ` |	INTEGER |
| `todo    ` |	TEXT    |
| `priority` |	TEXT    |
| `status  ` |	TEXT    |

### NOTE
- Replace the spaces in URL with **%20**.
- Possible values for priority are **_HIGH_**, _**MEDIUM**_, and _**LOW**_.
- Possible values for status are _**TO DO**_, _**IN PROGRESS**_, and _**DONE**_.``
# API 1

- Path: `/todos/`
- Method: `GET`

### Scenario 1

Sample API ``/todos/?status=TO%20DO``

#### Description: 
Returns a list of all todos whose status is 'TO DO'

#### Response:
```
[
  {
    id: 1,
    todo: "Watch Movie",
    priority: "LOW",
    status: "TO DO"
  },
  ...
]
```

### Scenario 2
Sample API ``/todos/?priority=HIGH``
#### Description: 
Returns a list of all todos whose priority is 'HIGH'

#### Response:
```
[
  {
    id: 2,
    todo: "Learn Node JS",
    priority: "HIGH",
    status: "IN PROGRESS"
  },
  ...
]
```

### Scenario 3
Sample API ``/todos/?priority=HIGH&status=IN%20PROGRESS``
#### Description: 
Returns a list of all todos whose priority is 'HIGH' and status is 'IN PROGRESS'
#### Response:
```
[
  {
    id: 2,
    todo: "Learn Node JS",
    priority: "HIGH",
    status: "IN PROGRESS"
  },
  ...
]
```


### Scenario 3
Sample API ``/todos/?search_q=Play``
#### Description: 
Returns a list of all todos whose todo contains 'Play' text

#### Response:
```
[
  {
    id: 2,
    todo: "Learn Node JS",
    priority: "HIGH",
    status: "IN PROGRESS"
  },
  ...
]
```
# API 2
- Path: ``/todos/:todoId/``
- Method: `GET`
#### Description:
Returns a specific todo based on the todo ID

#### Response

```
{
  id: 2,
  todo: "Learn JavaScript",
  priority: "HIGH",
  status: "DONE"
}
```
# API 3
- Path: `/todos/`
- Method: `POST`
#### Description:
Create a todo in the todo table,

#### Request
```
{
  "todo": "Finalize event theme",
  "priority": "LOW",
  "status": "TO DO"
}
```
#### Response
```
Todo Successfull Added Todo Id : 1
```

# API 4
- Path: `/todos/:todoId/`
- Method: `PUT`
#### Description:
Updates the details of a specific todo based on the todo ID

### Scenario 1
#### Request: `{ "status": "DONE" }`
#### Response: `Status Updated`

### Scenario 2
#### Request: `{ "priority": "HIGH" }`
#### Response: `Priority Updated`

### Scenario 2
#### Request: `{ "todo": "some task" }`
#### Response: `Todo Updated`

# API 5
- Path: `/todos/:todoId/`
- Method: `DELETE`
#### Description:
Deletes a todo from the todo table based on the todo ID

#### Response
```
Todo Deleted
```