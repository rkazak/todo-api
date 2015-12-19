// express - simple JS web-server.
var _ = require('underscore');
var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

//
app.use(bodyParser.json());

// root route!
app.get('/', function(req, res) {
	res.send('Todo API Root');
});


// GET /todos?completed=true|false&q=? description contains
app.get('/todos', middleware.requireAuthentication, function(req, res) {
	var query = req.query;

	var where = {
		userId: req.user.get('id')
	};

	if (query.hasOwnProperty('completed')) {
		where['completed'] = false;
		if (query.completed === 'true') {
			where['completed'] = true;
		}
	}

	if (query.hasOwnProperty('q')) {
		where['description'] = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});

});


// GET /todos/id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var where = {
		userId: req.user.get('id'),
		id: todoId
	};

	db.todo.findOne({
		where: where
	}).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send();
		}
	}, function(e) {
		res.status(500).send(e);
	});
});


// POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'completed', 'description');
	db.todo.create(body).then(function(todo) {
		req.user.addTodo(todo).then(function() {
			return todo.reload();
		}).then(function(todo) {
			res.json(todo.toJSON());
		});
	}, function(e) {
		res.status(400).json(e);
	});
});


// POST /users
app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	db.user.create(body).then(function(user) {
		res.json(user.toPublicJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});


// DELETE
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var where = {
		userId: req.user.get('id'),
		id: todoId
	};

	db.todo.destroy({
			where: where
		})
		.then(function(todoId) {
			if (todoId === 0) {
				res.status(404).json({
					error: "Todo not found"
				});
			} else {
				res.sendStatus(204);
			}
		}, function(e) {
			res.status(500).send(e);
		});
});


// PUT, update request
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(req.body, 'id', 'completed', 'description');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	var where = {
		userId: req.user.get('id'),
		id: todoId
	};

	db.todo.findOne({where: where}).then(function(todo) {
		if (todo)  {
			return todo.update(attributes);
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send();
	}).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		res.status(400).json(e);
	});
});


// POST /users/login
app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password');
	db.user.authenticate(body).then(function(user) {
		var token = user.generateToken('authentication');
		if (token) {
			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}
	}, function() {
		res.status(401).send();
	});
});


// Start the app.
db.sequelize.sync({force: true}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + '!');
	});
});