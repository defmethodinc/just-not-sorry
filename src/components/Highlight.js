import { h, Component } from 'preact';

function Highlight(props) {
  return (
    <div
      class='jns-highlight'
      style={props.styles}
    ></div>
  );
}

export default Highlight;