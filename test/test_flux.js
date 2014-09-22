var chai = require("chai"),
    expect = chai.expect;

chai.use(function(chai, utils) {
  chai.Assertion.addProperty("immutably", function() {
    if (this._obj && this._obj.toJS) this._obj = this._obj.toJS();
  });
});

var Flux = require("../flux.js");

describe("Flux", function() {
  var flux;
  var update = function(state, msg) {
    switch (msg.type) {
      case "set":
        return state.set("value", msg.value);
      case "add":
        return state.set("value", state.get("value") + msg.value);
      case "subtract":
        return state.set("value", state.get("value") - msg.value);
      case "multiply":
        return state.set("value", state.get("value") * msg.value);
      case "divide":
        return state.set("value", state.get("value") / msg.value);
    }
  };

  beforeEach(function() {
    flux = new Flux(update);
  });

  it("has state", function() {
    expect(flux._state.toJS()).to.eql({});
  });

  it("changes state when applying a message", function() {
    flux.applyMessage({type: "set", value: 1});
    flux.applyMessage({type: "add", value: 2});
    expect(flux._state).to.immutably.eql({value: 3});
  });

  it("maintains a history of states", function() {
    flux.applyMessage({type: "set", value: 1});
    flux.applyMessage({type: "add", value: 2});
    expect(flux._history[0]).to.immutably.eql({});
    expect(flux._history[1]).to.immutably.eql({value: 1});
    expect(flux._history[2]).to.immutably.eql({value: 3});
  });

  describe("in optimistic mode", function() {
    beforeEach(function() {
      flux = new Flux(update, true);
    });

    it("doesn't apply state to history right away", function() {
      var optId = flux.applyMessage({type: "set", value: 1});
      expect(flux._state).to.immutably.eql({value: 1});
      expect(flux._history[1]).to.be.undefined;
      expect(optId).not.to.eql(1);
    });

    it("optimistically applies messages", function() {
      msg = {type: "set", value: 1};
      var optId = flux.applyMessage(msg);
      expect(flux._optimisticMessages[optId]).to.eql(msg);
      expect(flux._optimisticLog).to.eql([optId]);
    });

    describe("confirming messages", function() {
      var msg1, msg2, msg3, opt1, opt2, opt3;

      beforeEach(function() {
        msg1 = {type: "set", value: 1};
        msg2 = {type: "add", value: 10};
        msg3 = {type: "multiply", value: 5};

        opt1 = flux.applyMessage(msg1);
        opt2 = flux.applyMessage(msg2);
        opt3 = flux.applyMessage(msg3);
      });

      it("rolls back to the last confirmed message", function() {
        flux.confirmMessage(opt1, 1);
        expect(flux._state).to.immutably.eql({value: 55});
        expect(flux._history[1]).to.immutably.eql({value: 1});

        flux.confirmMessage(opt3, 2);
        expect(flux._state).to.immutably.eql({value: 15});
        expect(flux._history[2]).to.immutably.eql({value: 5});
      });

      it("can confirm messages out of order", function() {
        flux.confirmMessage(opt1, 1);
        expect(flux._state).to.immutably.eql({value: 55});
        expect(flux._history[1]).to.immutably.eql({value: 1});

        flux.confirmMessage(opt3, 3);
        expect(flux._state).to.immutably.eql({value: 55});
        expect(flux._history[3]).to.be.undefined;

        flux.confirmMessage(opt2, 2);
        expect(flux._state).to.immutably.eql({value: 55});
        expect(flux._history[2]).to.immutably.eql({value: 11});
        expect(flux._history[3]).to.immutably.eql({value: 55});
      });

      it("can confirm messages originating elsewhere", function() {
        var externalMsg = {type: "add", value: 2};

        flux.confirmMessage(opt1, 1);
        expect(flux._state).to.immutably.eql({value: 55});

        flux.confirmMessage(externalMsg, 2);
        expect(flux._state).to.immutably.eql({value: 65});

        flux.confirmMessage(opt3, 3);
        expect(flux._state).to.immutably.eql({value: 25});

        flux.confirmMessage(externalMsg, 5);
        expect(flux._state).to.immutably.eql({value: 25});

        flux.confirmMessage(opt2, 4);
        expect(flux._state).to.immutably.eql({value: 27});
      });
    });
  });
});
