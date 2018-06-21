'use strict';

module.exports = function ($, window) {
  var TAG = 'HtmlCg/Utils: ';

  function isDebug () {
    return window && window.location && (window.location.search.match(/[?&]debug=([^&$]+)/) || [])[1] === 'true'
  }

  var version = require('../../package.json').version;

  return {
    isDebug: isDebug,
    version: version
  }
};
