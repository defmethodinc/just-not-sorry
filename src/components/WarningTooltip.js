import { h } from 'preact';
import ReactTooltip from 'react-tooltip';

export default function WarningTooltip() {
  return (
    <ReactTooltip
      class="jns-tooltip"
      type="dark"
      effect="float"
      multiline={true}
    />
  );
}
