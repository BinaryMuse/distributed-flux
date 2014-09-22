var Application = require("./client/application.jsx"),
    Flux = require("./flux"),
    Immutable = require("immutable");

var handleMessage = require("./client/handle_message");
var flux = new Flux(handleMessage, true);

var config = {
  clientServerDelay: 0,
  serverClientDelay: 0
};

var socket = io();

var applyMessage = function(message) {
  var clientServerDelay = parseInt(config.clientServerDelay, 10),
      serverClientDelay = parseInt(config.serverClientDelay, 10);

  var optimisticId = flux.applyMessage(message);
  setTimeout(function() {
    socket.emit("optimisticMessage", message, function(realId) {
      setTimeout(function() {
        if (realId) {
          console.log("Server confirmed optimistic update", optimisticId, "with sequence ID", realId);
          flux.confirmMessage(optimisticId, realId);
        }
      }, serverClientDelay);
    });
  }, clientServerDelay);
};

socket.once("state", function(state, prevState, seqId) {
  console.log("Intial state from server", state, seqId);
  console.log("State for sequence ID", seqId - 1, "is", prevState);

  flux._state = Immutable.fromJS(state);
  flux._sequenceId = seqId;
  flux._history[seqId - 1] = Immutable.fromJS(prevState);
  flux._history[seqId] = flux._state;

  React.renderComponent(
    Application({flux: flux, applyMessage: applyMessage, config: config}),
    document.getElementById("app")
  );
});

socket.on("message", function(msg, id) {
  console.log("Message", id, "from server:", msg);
  flux.confirmMessage(msg, id);
});
