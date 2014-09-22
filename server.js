var express = require("express"),
    socketio = require("socket.io"),
    http = require("http"),
    Flux = require("./flux"),
    handleMessage = require("./client/handle_message.js"),
    Immutable = require("immutable");;

var app = express(),
    server = http.Server(app),
    io = socketio(server);

app.use(express.static(__dirname + "/public"));

var flux = new Flux(require("./client/handle_message"));
flux.applyMessage({type: "initialize"});

io.on("connection", function(socket) {
  socket.emit("state", flux._state, flux._history[flux._sequenceId - 1], flux._sequenceId);

  socket.on("optimisticMessage", function(msg, confirmation) {
    var realId = flux.applyMessage(msg);
    socket.broadcast.emit("message", msg, realId);
    confirmation(realId);
  });
});

server.listen(8081, function() {
  console.log("http://localhost:8081/");
});
