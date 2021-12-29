import { h } from 'preact';
import ReactTooltip from 'react-tooltip';

export default function WarningTooltip() {
  return (
    <ReactTooltip
      class="jns-tooltip"
      type="dark"
      effect="float"
      border={true}
      multiline={true}
    />
  );
}
