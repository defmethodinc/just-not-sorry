import { h, Component } from 'preact';
import ReactTooltip from "react-tooltip";

export default function WarningTooltip() {
    return <ReactTooltip class="jns-tooltip" place="right" type="dark" effect="float" multiline={true}/>;
}