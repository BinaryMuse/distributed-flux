/** @jsx React.DOM */

var ColorGrid = React.createClass({
  propTypes: {
    grid: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    onSelect: React.PropTypes.func.isRequired
  },

  render: function() {
    var rows = this.props.grid.map(this.buildRow);

    return (
      <table>{rows}</table>
    );
  },

  buildRow: function(cells, row) {
    var cells = cells.map(function(cell, col) {
      return this.buildCell(cell, row, col);
    }.bind(this));

    return <tr key={row}>{cells}</tr>;
  },

  buildCell: function(color, row, col) {
    var style = {
      border: "1px solid black",
      backgroundColor: color,
      width: 50,
      height: 50,
      cursor: "pointer"
    };

    return <td key={col} style={style} onClick={this.handleCellClick.bind(null, row, col)} />;
  },

  handleCellClick: function(row, col) {
    this.props.onSelect(row, col);
  }
});

module.exports = ColorGrid;
