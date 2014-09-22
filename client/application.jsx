/** @jsx React.DOM */

var ColorPalette = require("./color_palette.jsx"),
    ColorGrid = require("./color_grid.jsx"),
    ConfigPanel = require("./config_panel.jsx");

var Application = React.createClass({
  propTypes: {
    applyMessage: React.PropTypes.func.isRequired,
    flux: React.PropTypes.object.isRequired,
    config: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      selectedColor: "white"
    };
  },

  componentWillMount: function() {
    this.setState(this.props.flux._state.toJS())
  },

  componentDidMount: function() {
    this.props.flux.onChange(function() {
      this.setState(this.props.flux._state.toJS())
    }.bind(this));
  },

  render: function() {
    return (
      <div>
        <ColorPalette colors={this.state.colors}
                      onAdd={this.handleAddColor}
                      onChoose={this.handleChooseColor} />
        <ColorGrid grid={this.state.grid} onSelect={this.handleGridSelect} />
        <ConfigPanel config={this.props.config} />
      </div>
    );
  },

  handleAddColor: function(color) {
    if (this.state.colors.indexOf(color) === -1) {
      this.props.applyMessage({type: "addColor", color: color});
    }
  },

  handleChooseColor: function(color) {
    this.setState({selectedColor: color});
  },

  handleGridSelect: function(row, col) {
    var color = this.state.selectedColor;
    this.props.applyMessage({type: "changeCell", cell: [row, col], color: color});
  }
});

module.exports = Application;
