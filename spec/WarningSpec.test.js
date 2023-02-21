import React from 'react';
import { render, waitFor } from '@testing-library/react';
import Warning, {
  calculateCoords,
  getHighlight,
} from '../src/components/Warning.js';

const parent = document.createElement('div');

parent.getBoundingClientRect = jest.fn(() => ({
  bottom: 591,
  height: 439,
  left: 26,
  right: 462,
  top: 152,
  width: 436,
  x: 26,
  y: 152,
}));

document.createRange = jest.fn(() => ({
  setStart: jest.fn(),
  setEnd: jest.fn(),
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
  getClientRects: jest.fn(() => [
    {
      bottom: 217,
      height: 15,
      left: 26,
      right: 65,
      top: 202,
      width: 39,
      x: 26,
      y: 202,
    },
  ]),
}));

const range = document.createRange();

describe('<Warning/>', () => {
  const testProps = {
    key: 'test-key',
    value: {
      pattern: 'test-pattern',
      message: 'test-message',
      parentNode: parent,
      rangeToHighlight: range,
    },
  };

  beforeEach(() => {
    render(
      <Warning
        parentRect={parent.getBoundingClientRect()}
        value={testProps.value}
        key={testProps.key}
      />
    );
  });

  it('should return a warning div', async () => {
    await waitFor(() => {
      const jnsWarnings = document.body.getElementsByClassName('jns-warning');
      expect(jnsWarnings.length).toBe(1);
      expect(jnsWarnings[0].tagName).toEqual('DIV');
    });
  });
});

describe('#calculateCoords', () => {
  it('should return undefined if the parentNode or rangeToHighlight are invalid', () => {
    expect(calculateCoords(null, null)).toEqual(undefined);
    expect(calculateCoords(undefined, undefined)).toEqual(undefined);
  });

  it('should return valid coords when both parentNode and rangeToHighlight are valid', () => {
    const parentNode = parent;
    const rectsToHighlight = range.getClientRects();
    expect(rectsToHighlight.length).toEqual(1);

    const rect = rectsToHighlight[0];
    const coords = calculateCoords(parentNode.getBoundingClientRect(), rect);
    expect(coords).toEqual({
      top: 65,
      left: 0,
    });
  });
});

describe('#setNodeStyles', () => {
  it('should return undefined if the parentNode or rangeToHighlight are invalid', () => {
    expect(getHighlight(null, null)).toEqual(undefined);
    expect(getHighlight(undefined, undefined)).toEqual(undefined);
  });

  it('should return a style object when both parentNode and rangeToHighlight are valid', () => {
    const rect = {
      bottom: 217,
      height: 15,
      left: 26,
      right: 65,
      top: 202,
      width: 39,
      x: 26,
      y: 202,
    };
    const coords = { top: 65, left: 0 };
    const highlight = getHighlight(rect, coords);
    expect(highlight).toEqual({
      style: {
        top: '62px',
        left: '0px',
        width: '39px',
        height: '3px',
        zIndex: 10,
        position: 'absolute',
        padding: '0px',
      },
      position: 'bottom',
    });
  });
});
