/** @jsx React.DOM */

var ConfigPanel = React.createClass({
  render: function() {
    return (
      <div>
        <div>
          Client -> Server Delay:
          <input type="text" value={this.props.config.clientServerDelay}
                 onChange={this.handleChangeClientServerDelay} />
        </div>
        <div>
          Server -> Client Delay:
          <input type="text" value={this.props.config.serverClientDelay}
                 onChange={this.handleChangeServerClientDelay} />
        </div>
      </div>
    );
  },

  handleChangeClientServerDelay: function(e) {
    this.props.config.clientServerDelay = e.target.value;
    this.forceUpdate();
  },

  handleChangeServerClientDelay: function(e) {
    this.props.config.serverClientDelay = e.target.value;
    this.forceUpdate();
  }
});

module.exports = ConfigPanel;
