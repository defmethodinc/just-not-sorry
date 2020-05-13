import { Component } from 'preact';

import fastdom from 'fastdom';
import fastdomPromised from 'fastdom/extensions/fastdom-promised';

const HIGHLIGHT_YPOS_ADJUSTMENT = 3;
const myFastdom = fastdom.extend(fastdomPromised);

export default class HighlightGenerator extends Component {
  constructor() {
    super();
  }

  static highlightMatches(message, warningClass, parentNode) {
    return (currMatch, rangeToHighlight) => {
      return myFastdom
        .measure(() => {
          let parentRect = parentNode.getBoundingClientRect();
          let rectsToHighlight = rangeToHighlight.getClientRects();
          let highlightNodes = [];
          for (let i = 0; i < rectsToHighlight.length; i++) {
            let highlightNode = HighlightGenerator.highlightMatch(
              rectsToHighlight[i],
              parentRect
            );
            highlightNode.title = message;
            highlightNode.className = warningClass;
            highlightNodes.push(highlightNode);
          }
          return highlightNodes;
        })
        .then(function (highlightNodes) {
          myFastdom.mutate(function () {
            highlightNodes.forEach(function (highlightNode) {
              parentNode.appendChild(highlightNode);
            });
          });
        });
    };
  }

  static highlightMatch(rect, parentRect) {
    let highlightNode = HighlightGenerator.generateHighlightNode();
    let coords = HighlightGenerator.transformCoordinatesRelativeToParent(
      rect,
      parentRect
    );
    HighlightGenerator.setNodeStyle(highlightNode, rect, coords);
    return highlightNode;
  }

  static generateHighlightNode() {
    return document.createElement('div');
  }

  static transformCoordinatesRelativeToParent(
    rect,
    parentRect
  ) {
    let coords = {};
    coords.top = rect.top - parentRect.top + rect.height;
    coords.left = rect.left - parentRect.left;
    return coords;
  }

  static setNodeStyle(node, rect, coords) {
    node.style.top = coords.top - HIGHLIGHT_YPOS_ADJUSTMENT + 'px';
    node.style.left = coords.left + 'px';
    node.style.width = rect.width + 'px';
    node.style.height = rect.height * 0.2 + 'px';
    node.style.zIndex = 10;
    node.style.position = 'absolute';
    node.style.padding = '0px';
  }
}


