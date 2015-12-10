// Require the library for sequelize.
//
var Sequelize = require('sequelize');
var env       = process.env.NODE_ENV || 'development';
var sequelize;

// NODE_ENV set to production in heroku environment.
//
console.log('env var is '+env);
if (env === 'production') {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect : 'postgres'
	});
	
} else {
	// 	connect to the sqlite database.
	sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/dev-todo-api.sqlite'
	});
}

var db = {};

db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname + '/models/user.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;