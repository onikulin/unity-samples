var express = require('express'),
    path = require('path'),
    wine = require('./routes/wines'),
    cluster = require('cluster');

var config = require('./config.json');
var protocol = require(config.server.protocol);

if (cluster.isMaster && typeof config.server.workers !== 'undefined' && config.server.workers > 0) {
    var numWorkers = config.server.workers;
    for (var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }
    cluster.on('online', function (worker) {
        console.log("Worker " + worker.process.pid + " is online");
    });
} else {
    var app = express();

    app.configure(function () {
        app.set('port', config.server.port);
        app.use(express.logger('dev'));
        /* 'default', 'short', 'tiny', 'dev' */
        app.use(express.bodyParser()),
            app.use(express.static(path.join(__dirname, 'public')));
    });

    app.get('/wines', wine.findAll);
    app.get('/wines/:id', wine.findById);
    app.post('/wines', wine.addWine);
    app.put('/wines/:id', wine.updateWine);
    app.delete('/wines/:id', wine.deleteWine);

    protocol.createServer(app).listen(app.get('port'), function () {
        console.log("Express server listening on port " + app.get('port'));
    });
}