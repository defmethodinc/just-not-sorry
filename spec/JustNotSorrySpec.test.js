import { h } from 'preact';
import JustNotSorry from '../src/components/JustNotSorry.js';
import { render, fireEvent, waitFor } from '@testing-library/preact';

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
    expect(mutationObserverMock.mock.instances.length).toBe(1);
    const documentObserver = mutationObserverMock.mock.instances[0];
    documentObserver.trigger([{ type: 'childList', target: node }]);
    expect(fireEvent[event](node)).toBe(true);
    jest.runOnlyPendingTimers();
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

  describe('documentObserver', () => {
    it('listens for structural changes to the content editable div in document body', () => {
      render(<JustNotSorry />);

      const observerInstances = mutationObserverMock.mock.instances;
      expect(observerInstances.length).toBe(1);
      expect(observerInstances[0].observe).toHaveBeenCalledWith(document.body, {
        childList: true,
        subtree: true,
      });
    });
  });

  it('on event does nothing when given an empty string', async () => {
    const email = emailContaining('');

    render(<JustNotSorry onEvents={['focus']} />);
    simulateEvent(email, 'focus');

    await waitFor(() => {
      expect(document.body.getElementsByClassName('jns-warning').length).toBe(
        0
      );
    });
  });

  it('on event checks for warnings', async () => {
    const email = emailContaining('just not');

    render(<JustNotSorry onEvents={['focus']} />);
    simulateEvent(email, 'focus');

    await waitFor(() => {
      expect(document.body.getElementsByClassName('jns-warning').length).toBe(
        1
      );
    });
  });

  it('should clear warnings on blur event', async () => {
    const div = emailContaining('just not');

    render(<JustNotSorry />);
    simulateEvent(div, 'blur');

    await waitFor(() => {
      expect(document.body.getElementsByClassName('jns-warning').length).toBe(
        0
      );
    });
  });

  it('does not add warnings for partial matches', async () => {
    const email = emailContaining('test justify test');

    render(<JustNotSorry onEvents={['focus']} />);
    simulateEvent(email, 'focus');

    await waitFor(() => {
      expect(document.body.getElementsByClassName('jns-warning').length).toBe(
        0
      );
    });
  });

  it('catches the warnings when email contains div with phrase', async () => {
    const div = emailContaining(`just not
    <div>just not</div>`);

    render(<JustNotSorry onEvents={['focus']} />);
    simulateEvent(div, 'focus');

    await waitFor(() => {
      expect(document.body.getElementsByClassName('jns-warning').length).toBe(
        2
      );
    });
  });
});
