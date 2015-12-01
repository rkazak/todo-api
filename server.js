var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function( req, res ) {
	res.send('Todo API Root');
});

// GET /todos
app.get('/todos',function(req, res) {
	res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function ( req, res ) {
	var todoId = req.params.id;
	//console.log('todoid '+todoId);
	// Iterate over todos array. Find match.
	//console.log('len '+todos.length);
	for (var i in todos) {
		var val = todos[i];
		//console.log(val['id']+' '+todoId);

		if (val['id'] == todoId) {
			//console.log('Yi');
			//res.send('Asking for todo with id of ' + req.params.id);
			res.json(val);
		}
	};
	res.status(404).send();
});

/*
Alternate -
app.get('/todos:id', function( req, res ) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTodo;

	todos.forEach(function (todo) {
	   if (todoId === todo.id) {
	      matchedTodo = todo;
	   }
	});

	if (matchedTodo) {
	   res.json(matchedTodo);
	} else {
	   res.status(404).send();
	}
});

*/

// POST /todos
app.post('/todos', function(req, res) {
	var body = req.body;
	// add id
	body.id = todoNextId;
	todoNextId++;
	// push body into array
	todos.push(body);
	res.json(body);

});

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});
