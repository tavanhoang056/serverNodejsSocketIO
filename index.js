
var express = require('express');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
app.set('port', process.env.PORT || 3000);

var clients = new Array();
var brushs = new Array();
var bulletproofs = new Array();
var helmets = new Array();
var woodboxs = new Array();
var supporters = new Array();

io.on("connection", function(socket) {

	var currentUser;
	var currentBrush;
	var bulletproofPlayer;
	var helmetPlayer;
	var currentWoodBox;
	var currentSupporter;
	socket.on("USER_CONNECT", function() {
		console.log("User connected");
		for(var i = 0; i < clients.length; i++){
			//send all (data of otherplayer who is user is connected) to current user by sockt.emit
			socket.emit("STATE_USER_CONNECTED", {name:clients[i].name, position:clients[i].position, grabweapon:clients[i].grabweapon, health:clients[i].health});
			console.log("User name " + clients[i].name + " is connected");
		}
		for(var i = 0; i < brushs.length; i++){
			//send all (data of otherplayer who is user is connected) to current user
			socket.emit("STATE_BRUSH", {name:brushs[i].name, scale:brushs[i].scale, state:brushs[i].state});
			console.log("Brush name " + brushs[i].name + " is " + brushs[i].scale);
		}
		for(var i = 0; i < bulletproofs.length; i++){
			//send all (data of otherplayer who is user is connected) to current user
			socket.emit("STATE_BULLETPROOF", {name:bulletproofs[i].name});
		}
		for(var i = 0; i < helmets.length; i++){
			//send all (data of otherplayer who is user is connected) to current user
			socket.emit("STATE_HELMET", {name:helmets[i].name});
		}
		for(var i = 0; i < woodboxs.length; i++){
			//send all (data of otherplayer who is user is connected) to current user
			socket.emit("STATE_WOODBOX", {name:woodboxs[i].name, scale:woodboxs[i].scale, state:woodboxs[i].state, generate:woodboxs[i].generate,namegenerate:woodboxs[i].namegenerate});
			console.log("WoodBox name " + woodboxs[i].name + " is " + woodboxs[i].scale);
		}
		for(var i = 0; i < supporters.length; i++){
			//send all (data of otherplayer who is user is connected) to current user
			socket.emit("STATE_SUPPORTER", {name:supporters[i].name});
		}
	});

	socket.on("WEAPON", function(data) {
		currentUser.grabweapon = data.grabweapon;
		socket.broadcast.emit("WEAPON", currentUser);
		console.log(currentUser.name + "grab weapon: " + currentUser.grabweapon);
	});

	socket.on("GRABSUPPORTER", function(data) {
		currentSupporter = {name: data.name};
		supporters.push(currentSupporter);
		socket.broadcast.emit("GRABSUPPORTER", {name:data.name});
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
		socket.broadcast.emit("NEWPLAYER", {
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
		socket.broadcast.emit("SHOOTING", {name : data.name, speed : data.speed, line :  data.line, color : data.color});
	});

	socket.on("BANDAGEHEALTH", function(data) {
		currentUser.health = data.health;
		socket.broadcast.emit("BANDAGEHEALTH", {name : data.name});
	});

	socket.on("TAKEDAMAGE", function(data) {
		for(var i = 0; i < clients.length; i++){
			//send all (data of otherplayer who is user is connected) to current user by sockt.emit
			if(clients[i].name == data.name){
				clients[i].health = data.health;
			}
		}
		socket.broadcast.emit("TAKEDAMAGE", {name : data.name, health :  data.health});
	});

	socket.on("BULLETPROOF", function(data) {
		bulletproofPlayer = {
			name:data.name
		}
		bulletproofs.push(bulletproofPlayer);
		socket.broadcast.emit("BULLETPROOF", {name : data.name});
	});

	socket.on("HELMET", function(data) {
		helmetPlayer = {
			name:data.name
		}
		helmets.push(helmetPlayer);
		socket.broadcast.emit("HELMET", {name : data.name});
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

	socket.on("DESTROYWOODBOX", function(data) {
		currentWoodBox = {
			name:data.name,
			scale:data.scale,
			state:data.state,
			generate:data.generate,
			namegenerate:data.namegenerate
		}
		woodboxs.push(currentWoodBox);
		console.log("scale " + data.scale);
		socket.broadcast.emit("DESTROYWOODBOX", currentWoodBox);
	});

	socket.on("PLAYAGAIN", function(data) {
		for(var i = 0; i < bulletproofs.length; i++){
			//send all (data of otherplayer who is user is connected) to current user
			if(bulletproofs[i].name == data.name){
				bulletproofs.splice(i,1);
			}
		}
		for(var i = 0; i < helmets.length; i++){
			//send all (data of otherplayer who is user is connected) to current user
			if(helmets[i].name == data.name){
				helmets.splice(i,1);
			}
		}
		currentUser.health = "100";
		socket.broadcast.emit("PLAYAGAIN", {name : data.name});
	});

	socket.on("EXITPLAY", function(data) {
		for(var i = 0; i < bulletproofs.length; i++){
			//send all (data of otherplayer who is user is connected) to current user
			if(bulletproofs[i].name == data.name){
				bulletproofs.splice(i,1);
			}
		}
		for(var i = 0; i < helmets.length; i++){
			//send all (data of otherplayer who is user is connected) to current user
			if(helmets[i].name == data.name){
				helmets.splice(i,1);
			}
		}
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
				
				if(clients.length == 2){
					socket.broadcast.emit("WIN", {alive : clients.length});
				}
				clients.splice(i,1);
			}
		}
		if(clients.length == 0){
			brushs.splice(0, brushs.length);
			woodboxs.splice(0, woodboxs.length);
			supporters.splice(0, supporters.length);
		}
	});
});

server.listen(app.get('port'), function() {
	console.log("server is running");
});