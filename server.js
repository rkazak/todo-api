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

app.get('/todos/:id', function ( req, res ) {

	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

	if (matchedTodo) {
	   res.json(matchedTodo);
	} else {
	   res.status(404).send();
	}
});

// GET /todos?completed=true|false
app.get('/todos', function ( req, res ) {
	var queryParams = req.query;
	var filteredTodos = todos;

	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
		filteredTodos = _.where(filteredTodos, { completed: true});
	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
		filteredTodos = _.where(filteredTodos, { completed: false});
	}

	res.json(filteredTodos);
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

// DELETE
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

// PUT
app.put( '/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id: todoId});

    var body = _.pick(req.body, 'id', 'completed', 'description');
    var validAttributes = {};

    if (!matchedTodo) {
    	return res.status(404).send();
    }

    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    	validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
    	return res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    	validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
    	return res.status(400).send();
    }

    _.extend(matchedTodo, validAttributes);
    res.json(matchedTodo);
});


app.listen(PORT, function() {
	console.log('Express listening on port ' + PORT + '!');
});
