var Immutable = require("immutable");

function generateUuid() {
  var d = (Date.now && Date.now()) ||
          new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c === "x" ? r : (r&0x7|0x8)).toString(16);
  });
  return uuid;
}

function Flux(handleMessage, optimistic) {
  this._state = Immutable.Map({});
  this._sequenceId = 0;
  this._history = {};
  this._callbacks = [];
  this._optimisticLog = [];
  this._optimisticMessages = {};
  this._pendingConfirmedMessages = [];

  this._handleMessage = handleMessage;
  this._optimistic = !!optimistic;

  this._recordMessage(null);
}

Flux.prototype._recordMessage = function(msg) {
  this._history[this._sequenceId] = this._state;
};

Flux.prototype.callback = function() {
  for (var i = 0; i < this._callbacks.length; i++) {
    this._callbacks[i]();
  }
};

Flux.prototype.applyMessage = function(msg) {
  if (this._optimistic) {
    var optimisticId = generateUuid(),
        optimisticState = this._handleMessage(this._state, msg);
    this._optimisticMessages[optimisticId] = msg;
    this._optimisticLog.push(optimisticId);
    this._state = optimisticState;
    this.callback();
    return optimisticId;
  } else {
    this._sequenceId++;
    this._state = this._handleMessage(this._state, msg);
    this._recordMessage(msg);
    this.callback();
    return this._sequenceId;
  }
};

Flux.prototype.confirmMessage = function(messageOrOptSeqId, realSeqId) {
  if (typeof messageOrOptSeqId === "string") {
    var optimisticSeqId = messageOrOptSeqId;
    this._pendingConfirmedMessages.push([optimisticSeqId, realSeqId]);
    this.resolvePendingConfirmedMessages();
  } else {
    var message = messageOrOptSeqId;
    var newOptId = generateUuid();
    this._optimisticMessages[newOptId] = message;
    this._pendingConfirmedMessages.push([newOptId, realSeqId]);
    this.resolvePendingConfirmedMessages();
  }
};

Flux.prototype.resolvePendingConfirmedMessages = function(callbackAfter) {
  var index = -1,
      search = this._sequenceId + 1;

  for (var i = 0; i < this._pendingConfirmedMessages.length; i++) {
    if (this._pendingConfirmedMessages[i][1] === search) {
      index = i;
      break;
    }
  }

  if (index !== -1) {
    var update = this._pendingConfirmedMessages[index];
    this._pendingConfirmedMessages.splice(index, 1);
    this.applyConfirmedMessage(update[0], update[1]);
    this.resolvePendingConfirmedMessages(false);
    if (callbackAfter !== false) this.callback();
  }
};

Flux.prototype.applyConfirmedMessage = function(optimisticSeqId, realSeqId) {
  var prevSeqId = realSeqId - 1,
      prevState = this._history[prevSeqId],
      confirmedMsg = this._optimisticMessages[optimisticSeqId];

  var newState = this._handleMessage(prevState, confirmedMsg);
  this._state = newState;
  this._sequenceId = realSeqId;
  this._recordMessage();

  var msgIndex = this._optimisticLog.indexOf(optimisticSeqId);
  if (msgIndex !== -1) this._optimisticLog.splice(msgIndex, 1);

  this._state = this._optimisticLog.reduce(function(acc, msgId) {
    var message = this._optimisticMessages[msgId];
    return this._handleMessage(acc, message);
  }.bind(this), newState);

  delete this._optimisticMessages[optimisticSeqId];
};

Flux.prototype.onChange = function(cb) {
  this._callbacks.push(cb);
};

module.exports = Flux;
