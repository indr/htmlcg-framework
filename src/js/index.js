'use strict';

module.exports = (function ($, window, document, navigator) {
  var Parser = require('./Parser');
  var State = require('./State');
  var utils = require('./utils')($, window, document, navigator);
  var WindowAdapter = require('./WindowAdapter')(window);

  // Set window/document title
  if (window && document) {
    var filename = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
    document.title = filename + ' - ' + document.title;
  }

  function HtmlCg (template, opts) {
    var TAG = 'HtmlCg: ';
    opts = opts || {};

    // Detect debug mode
    var isDebug = utils.isDebug();
    console.debug(TAG + 'Debug mode ' + isDebug);

    // Create toolbox in debug mode
    this.toolbox = null;
    if (isDebug) {
      var Toolbox = require('./Toolbox')($, window, document, utils);
      this.toolbox = new Toolbox(opts);
    }

    new WindowAdapter(template, opts);

    return {
      isDebug: isDebug,
      Parser: Parser,
      State: State,
      toolbox: this.toolbox
    };
  }

  // Make HtmlCg available on window object
  window.HtmlCg = HtmlCg;

  // Return constructor
  return HtmlCg;
}((window.jQuery || window.Zepto), window, (window ? window.document : undefined), navigator));
