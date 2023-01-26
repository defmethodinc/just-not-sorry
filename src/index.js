import { h, render } from 'preact';
import JustNotSorry from './components/JustNotSorry';

render(<JustNotSorry onEvents={['input', 'focus', 'cut']} />, document.body);
