var Immutable = require("immutable");

var initialGrid = [
  ["white", "white", "white", "white", "white"],
  ["white", "white", "white", "white", "white"],
  ["white", "white", "white", "white", "white"],
  ["white", "white", "white", "white", "white"],
  ["white", "white", "white", "white", "white"]
];

module.exports = function handleMessage(state, msg) {
  switch (msg.type) {
    case "initialize":
      return Immutable.fromJS({
        colors: ["white", "red", "blue"], grid: initialGrid
      });
      break;
    case "addColor":
      var colors = state.get("colors"),
          newColors = colors.push(msg.color);
      return state.set("colors", newColors);
    case "changeCell":
      var grid = state.get("grid"),
          newGrid = grid.updateIn(msg.cell, function() {
            return msg.color;
          });
      return state.set("grid", newGrid);
  }
}
