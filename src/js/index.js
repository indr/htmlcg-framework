'use strict';

module.exports = function HtmlCg ($, window, document, navigator) {
  var TAG = 'HtmlCg: ';

  var Parser = require('./Parser');
  var State = require('./State');
  var utils = require('./utils')($, window, document, navigator);
  var WindowAdapter = require('./WindowAdapter')(window);

  // Detect debug mode
  var isDebug = utils.isDebug();
  console.debug(TAG + 'Debug mode ' + isDebug);

  // Set window/document title
  if (window && document) {
    var filename = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
    document.title = filename + ' - ' + document.title;
  }

  // Create toolbox in debug mode
  var toolbox = null;
  if (isDebug) {
    var Toolbox = require('./Toolbox')($, window, document, utils);
    toolbox = new Toolbox();
  }

  function run (template, opts) {
    new WindowAdapter(template, opts);
  }

  window.HtmlCg = {
    isDebug: isDebug,
    run: run,
    Parser: Parser,
    State: State,
    toolbox: toolbox
  };

  return window.HtmlCg;
}((window.jQuery || window.Zepto), window, (window ? window.document : undefined), navigator);
