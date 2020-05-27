import { h } from 'preact';
import ReactTooltip from 'react-tooltip';

export default function WarningTooltip() {
  return (
    <ReactTooltip
      class="jns-tooltip"
      place="bottom"
      type="dark"
      effect="float"
      multiline={true}
    />
  );
}
