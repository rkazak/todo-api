var express    = require('express');
var bodyParser = require('body-parser');
var _          = require('underscore');

var app        = express();
var PORT       = process.env.PORT || 3000;
var todos      = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function( req, res ) {
	res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function ( req, res ) {
	res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function ( req, res ) {

	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

/*
Alternate - 2
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
*/
/*
Alternate - 1
app.get('/todos:id', function( req, res ) {
	var todoID = parseInt(req.params.id, 10);
	var matchedTodo;

	todos.forEach(function (todo) {
	   if (todoId === todo.id) {
	      matchedTodo = todo;
	   }
	});
*/
	if (matchedTodo) {
	   res.json(matchedTodo);
	} else {
	   res.status(404).send();
	}
});


// POST /todos
app.post('/todos', function ( req, res ) {
    var body = _.pick(req.body, 'completed', 'description');

	if (   !_.isBoolean(body.completed)
		|| !_.isString(body.description)
		|| body.description.trim().length === 0) {
		return res.status(400).send();
	}

    body.description = body.description.trim();

	// add id
	body.id = todoNextId++;

	// push body into array
	todos.push(body);

	res.json(body);

});

app.delete('/todos/:id', function ( req, res ) {
	var todoId = parseInt(req.params.id, 10);
	console.log('Delete '+todoId);

	var matchedTodo = _.findWhere(todos, {id: todoId});
    if (matchedTodo) {
    	todos = _.without(todos, matchedTodo );
    	res.json(matchedTodo);
    } else {
    	res.status(404).send({"error": "No todo found with that id"});
    }
});

app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});
