'use strict';

module.exports = function ($, window, document, navigator) {
  var TAG = 'HtmlCg/Utils: ';

  function isDebug () {
    var result = false;
    if ($ && window && window.location && document) {
      var isCasparCg = true;
      if (navigator && typeof navigator.userAgent === 'string') {
        // console.log(TAG + 'Navigator: ' + navigator.userAgent);
        isCasparCg = navigator.userAgent.indexOf('Mozilla/') >= 0
          && navigator.userAgent.indexOf('AppleWebKit/') >= 0
          && navigator.userAgent.indexOf('Chrome/') >= 0
          && navigator.userAgent.indexOf('Safari/') >= 0;
      }
      result = !isCasparCg || window.location.search === '?debug';
    }
    return result;
  }

  var version = require('../../package.json').version;

  return {
    isDebug: isDebug,
    version: version
  }
};
