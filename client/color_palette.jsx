/** @jsx React.DOM */

var ColorPalette = React.createClass({
  propTypes: {
    colors: React.PropTypes.array,
    onChoose: React.PropTypes.func,
    onAdd: React.PropTypes.func,
  },

  getDefaultProps: function() {
    return {
      colors: ["red", "blue"],
      onChoose: function() {},
      onAdd: function() {}
    };
  },

  render: function() {
    return (
      <div className="component-color-palette">
        <span>Colors:</span>
        {this.props.colors.map(function(color) {
          var style = {
            width: 16,
            height: 16,
            margin: "0 3px",
            display: "inline-block",
            cursor: "pointer",
            backgroundColor: color,
            border: "1px solid black",
            verticalAlign: "text-bottom"
          };
          return <div key={color} style={style} onClick={this.handleColorClick.bind(null, color)} />;
        }.bind(this))}
        <button onClick={this.handleAddClick}>+</button>
      </div>
    );
  },

  handleColorClick: function(color) {
    this.props.onChoose(color);
  },

  handleAddClick: function() {
    var color = window.prompt("Color to add?");
    if (color) {
      this.props.onAdd(color);
    }
  }
});

module.exports = ColorPalette;
