import React from 'react';
import JustNotSorry from '../src/components/JustNotSorry.js';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';

jest.useFakeTimers();

document.createRange = jest.fn(() => ({
  setStart: jest.fn(),
  setEnd: jest.fn(),
  commonAncestorContainer: {
    nodeName: 'BODY',
    ownerDocument: document,
  },
  startContainer:
    "The word 'very' does not communicate enough information. Find a stronger, more meaningful adverb, or omit it completely. --Andrea Ayres",
  getClientRects: jest.fn(() => [{}]),
}));

const emailContaining = (text) => {
  const email = document.createElement('div');
  email.setAttribute('id', 'test');
  email.setAttribute('contentEditable', 'true');
  email.append(text ?? 'some text');
  document.body.appendChild(email);
  return email;
};

describe('JustNotSorry', () => {
  let mutationObserverMock;

  const simulateEvent = (node, event) => {
    act(() => {
      expect(mutationObserverMock.mock.instances.length).toBe(1);
      const documentObserver = mutationObserverMock.mock.instances[0];
      documentObserver.trigger([{ type: 'childList', target: node }]);
      expect(fireEvent[event](node)).toBe(true);
      jest.runOnlyPendingTimers();
    });
  };

  beforeEach(() => {
    mutationObserverMock = jest.fn(function MutationObserver(callback) {
      this.observe = jest.fn();
      this.disconnect = jest.fn();
      this.trigger = (mockedMutationList) => {
        callback(mockedMutationList, this);
      };
    });
    global.MutationObserver = mutationObserverMock;
  });

  it('listens for structural changes to the content editable div in document body', () => {
    render(<JustNotSorry />);

    const observerInstances = mutationObserverMock.mock.instances;
    expect(observerInstances.length).toBe(1);
    expect(observerInstances[0].observe).toHaveBeenCalledWith(document.body, {
      childList: true,
      subtree: true,
    });
  });

  it('on event does nothing when given an empty string', async () => {
    const email = emailContaining('');
    render(
      <JustNotSorry
        phrases={[
          {
            regex: /just/gi,
            message: 'just is not good',
          },
        ]}
        onEvents={['focus']}
      />
    );
    simulateEvent(email, 'focus');
    await waitFor(() => {
      expect(screen.queryAllByTestId('jns-warning').length).toEqual(0);
    });
  });

  it('on event checks for warnings', async () => {
    const email = emailContaining('just not');
    render(
      <JustNotSorry
        phrases={[
          {
            regex: /just/gi,
            message: 'just is not good',
          },
        ]}
        onEvents={['focus']}
      />
    );
    simulateEvent(email, 'focus');

    await waitFor(() => {
      expect(screen.getAllByTestId('jns-warning').length).toEqual(1);
    });
  });

  it('should clear warnings on blur event', async () => {
    const div = emailContaining('just not');

    render(
      <JustNotSorry
        phrases={[
          {
            regex: /just/gi,
            message: 'just is not good',
          },
        ]}
        onEvents={['focus']}
      />
    );
    simulateEvent(div, 'blur');

    await waitFor(() => {
      expect(screen.queryAllByTestId('jns-warning').length).toEqual(0);
    });
  });

  it('does not add warnings for partial matches', async () => {
    const email = emailContaining('test justify test');

    render(
      <JustNotSorry
        phrases={[
          {
            regex: /\bjust\b/,
            message: 'just is not good',
          },
        ]}
        onEvents={['focus']}
      />
    );
    simulateEvent(email, 'focus');

    await waitFor(() => {
      expect(screen.queryAllByTestId('jns-warning').length).toEqual(0);
    });
  });

  it('catches the warnings when email contains div with phrase', async () => {
    const div = emailContaining(`just not
    <div>just not</div>`);

    render(
      <JustNotSorry
        phrases={[
          {
            regex: /just/gi,
            message: 'just is not good',
          },
        ]}
        onEvents={['focus']}
      />
    );
    simulateEvent(div, 'focus');

    await waitFor(() => {
      expect(screen.getAllByTestId('jns-warning').length).toEqual(2);
    });
  });
});
