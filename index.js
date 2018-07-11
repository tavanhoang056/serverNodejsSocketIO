
var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
app.set('port', process.env.PORT || 3000);

var clients = new Array();
var brushs = new Array();
io.on("connection", function(socket) {

	var currentUser;
	var currentBrush;
	socket.on("USER_CONNECT", function() {
		console.log("User connected");
		for(var i = 0; i < clients.length; i++){
			//send all (data of otherplayer who is user is connected) to current user
			socket.emit("USER_CONNECTED", {name:clients[i].name, position:clients[i].position, grabweapon:clients[i].grabweapon, health:clients[i].health});
			console.log("User name " + clients[i].name + " is connected");
		}
		for(var i = 0; i < brushs.length; i++){
			//send all (data of otherplayer who is user is connected) to current user
			socket.emit("STATE_BRUSH", {name:brushs[i].name, scale:brushs[i].scale, state:brushs[i].state});
			console.log("Brush name " + brushs[i].name + " is " + brushs[i].scale);
		}
	});

	socket.on("WEAPON", function(data) {
		currentUser.grabweapon = data.grabweapon;
		socket.broadcast.emit("WEAPON", currentUser);
		console.log(currentUser.name + "grab weapon: " + currentUser.grabweapon);
	});

    socket.on("TALK", function (data) {
        io.sockets.emit("TALK", {
            name : data.name,
            messe : data.message
        });
        console.log(data.name + " : " + data.message);
    });

	socket.on("PLAY", function(data) {
		currentUser = {
			name:data.name,
			position:data.position,
			turn:data.turn,
			grabweapon:data.grabweapon,
			health:data.health
		}
		clients.push(currentUser);
		console.log("Alive : " + clients.length);
		socket.emit("PLAY", {
			name:data.name,
			position:data.position,
			turn:data.turn,
			grabweapon:data.grabweapon,
			health:data.health,
			alive:clients.length.toString()
		});
		
		//send data of current user to all user
		// socket.emit("USER_CONNECTED", currentUser);
		socket.broadcast.emit("USER_CONNECTED", {
			name:data.name,
			position:data.position,
			turn:data.turn,
			grabweapon:data.grabweapon,
			health:data.health,
			alive:clients.length.toString()
		});
	});

	socket.on("MOVE", function(data) {
		//listen data of current user is controlled by gamer
		currentUser.position = data.position;
		//socket.emit("MOVE", currentUser);
		socket.broadcast.emit("MOVE", currentUser);
		console.log(currentUser.name+" move to "+currentUser.position);
	});

	socket.on("TURN", function(data) {
		currentUser.turn = data.turn;
		socket.broadcast.emit("TURN", currentUser);
	});

	socket.on("HANDFIGHTING", function(data) {
		socket.broadcast.emit("HANDFIGHTING", {name : data.name});
	});

	socket.on("SHOOTING", function(data) {
		socket.broadcast.emit("SHOOTING", {name : data.name});
	});

	socket.on("TAKEDAMAGE", function(data) {
		currentUser.health = data.health;
		socket.broadcast.emit("TAKEDAMAGE", {name : data.name});
	});

	socket.on("DESTROYBRUSH", function(data) {
		currentBrush = {
			name:data.name,
			scale:data.scale,
			state:data.state
		}
		brushs.push(currentBrush);
		console.log("scale " + data.scale);
		socket.broadcast.emit("DESTROYBRUSH", currentBrush);
	});

	//socket.on("PING", function() {
		//socket.emit("PONG", currentUser);
	//});

	socket.on("disconnect", function() {
		socket.broadcast.emit("USER_DISCONNECTED", currentUser);
		for(var i = 0; i < clients.length; i++){
			if(clients[i].name == currentUser.name){
				io.sockets.emit("TALK", {
                    name : clients[i].name,
                    messe : " has disconnect"
                });
				console.log("User "+clients[i].name+" disconnected");
				clients.splice(i,1);
			}
		}
		if(clients.length == 0){
			brushs.splice(0, brushs.length);
		}
	});
});

server.listen(app.get('port'), function() {
	console.log("server is running");
});