import * as HighlightGenerator from "../src/HighlightGenerator.js";

describe('HighlightGenerator', function () {
  describe('#highlightMatches', function () {
    var warningClass = 'test-warning';
    var message = 'test';
    var mockNode;
    var rect1 = {};
    var rect2 = {};
    var rects = [rect1, rect2];
    var parentNodeSpy, currMatch, range;

    beforeEach(function () {
      mockNode = {title: 'another title'};
      spyOn(HighlightGenerator, 'highlightMatch').and.returnValue(mockNode);
      parentNodeSpy = jasmine.createSpyObj('parentNode', ['getBoundingClientRect', 'appendChild']);
      currMatch = jasmine.createSpy();
      range = jasmine.createSpyObj('range', ['getClientRects']);
      range.getClientRects.and.returnValue(rects);
    });

    it('appends one highlight node to the parent for each client rect in the range', async function (done) {
      await HighlightGenerator.highlightMatches(message, warningClass).call(parentNodeSpy, currMatch, range);
      requestAnimationFrame(function () {
        expect(parentNodeSpy.appendChild).toHaveBeenCalled();
        expect(parentNodeSpy.appendChild.calls.count()).toEqual(rects.length);
        done();
      })
    });

    it('sets the same message on all highlight nodes', async function () {
      await HighlightGenerator.highlightMatches(message, warningClass).call(parentNodeSpy, currMatch, range);
      expect(mockNode.title).toEqual(message);
    });

    it('sets the warning class on the highlight nodes', async function() {
      await HighlightGenerator.highlightMatches(message, warningClass).call(parentNodeSpy, currMatch, range);
      expect(mockNode.className).toEqual(warningClass);
    });
  });

  describe('#highlightMatch', function () {
    it('generates a node that is styled and positioned', function () {
      var rect = {top: 2, left: 2, height: 10};
      var parentRect = {top: 1, left: 1, height:1};

      var node = HighlightGenerator.highlightMatch(rect, parentRect);
      expect(node).toBeDefined();
      expect(node.nodeName).toEqual('DIV');
      expect(node.style.top).toEqual('8px');
      expect(node.style.left).toEqual('1px');
    });
  });

  describe('#generateHighlightNode', function () {
    it('returns a DIV', function () {
      var node = HighlightGenerator.generateHighlightNode();
      expect(node.nodeName).toEqual('DIV');
    });
  });

  describe('#transformCoordinatesRelativeToParent', function () {
    var subject = function () {
      var rect = {top: 30, left: 2, height: 10};
      var parentRect = {top: 1, left: 1, height: 100};
      return HighlightGenerator.transformCoordinatesRelativeToParent(rect, parentRect);
    };

    it('returns the top position relative to the parent top position', function () {
      expect(subject().top).toBeCloseTo(39);
    });

    it('returns the left position relative to the parent left position', function () {
      expect(subject().left).toBeCloseTo(1);
    });
  });

  describe('#setNodeStyle', function () {
    var node;
    beforeEach(function () {
      var rect = {width: 20, height: 12};
      var coords = {top: 8, left: 0};
      node = document.createElement('DIV');
      HighlightGenerator.setNodeStyle(node, rect, coords);
    });

    it('sets the position', function () {
      expect(node.style.top).toEqual('5px');
      expect(node.style.left).toEqual('0px');
      expect(node.style.zIndex).toEqual('10');
      expect(node.style.position).toEqual('absolute');
    });

    it('sets the width to equal the width of the rectangle', function () {
      expect(node.style.width).toEqual('20px');
    });

    it('sets the height to 20% of the height of the rectangle', function () {
      expect(node.style.height).toEqual('2.4px');
    });

    it('sets padding', function () {
      expect(node.style.padding).toEqual('0px');
    });
  });
});
