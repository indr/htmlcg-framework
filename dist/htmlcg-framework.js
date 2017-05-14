(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports={
  "name": "htmlcg-framework",
  "version": "0.1.0",
  "description": "Framework to create HTML templates for CasparCG",
  "main": "app/index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/indr/htmlcg-framework.git"
  },
  "keywords": [
    "casparcg",
    "framework",
    "html"
  ],
  "author": "Reto Inderbitzin",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/indr/htmlcg-framework/issues"
  },
  "homepage": "https://github.com/indr/htmlcg-framework#readme",
  "devDependencies": {
    "browserify": "^14.3.0",
    "del": "^2.2.2",
    "gulp": "^3.9.1",
    "gulp-rename": "^1.2.2",
    "gulp-uglify": "^2.1.2",
    "vinyl-buffer": "^1.0.0",
    "vinyl-source-stream": "^1.1.0"
  }
}

},{}],2:[function(require,module,exports){
'use strict';

function parseData (jsonOrXmlString) {
  if (typeof jsonOrXmlString !== 'string') {
    return null;
  }
  if (jsonOrXmlString.length <= 0) {
    return null;
  }
  if (jsonOrXmlString.match(/^</)) {
    return parseTemplateDataXml(jsonOrXmlString);
  }
  if (jsonOrXmlString.match(/^\{|\[/)) {
    return JSON.parse(jsonOrXmlString);
  }
  console.warn(TAG + 'Unknown data format: ' + jsonOrXmlString.substr(0, 20));
  return null;
}

function parseXml (xmlString) {
  // http://stackoverflow.com/questions/7949752/cross-browser-javascript-xml-parsing
  if (window && window.DOMParser && typeof XMLDocument !== 'undefined') {
    return new DOMParser().parseFromString(xmlString, "text/xml");
  } else { // Internet Explorer
    var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    xmlDoc.loadXML(xmlString);
    return xmlDoc;
  }
}

function parseTemplateDataXml (xmlString) {
  var result = {};
  var xmlDoc = parseXml(xmlString);
  var componentDatas = xmlDoc.getElementsByTagName('componentData');
  for (var i = 0; i < componentDatas.length; i++) {
    var id = componentDatas[ i ].id;
    result[ id ] = componentDatas[ i ].firstChild.attributes.value.value;
  }
  return result;
}

module.exports = {
  parseData: parseData,
  parseXml: parseXml,
  parseTemplateDataXml: parseTemplateDataXml
};

},{}],3:[function(require,module,exports){
'use strict';

var State = {
  NEW: 0,
  LOADED: 1,
  PLAYING: 2,
  STOPPED: 4
};

module.exports = State;

},{}],4:[function(require,module,exports){
'use strict';

var Parser = require('./Parser');
var State = require('./State');

function TemplateAdapter (template) {
  var TAG = 'HtmlCg/TemplateAdapter: ';
  var self = this;

  self.template = template;
  self.state = State.NEW;

  function load () {
    console.debug(TAG + 'template.load()');
    if (self.state !== State.NEW) {
      console.debug(TAG + 'Invalid state ' + self.state);
      return;
    }

    self.state = State.LOADED;
    return invoke.bind(self, 'onLoad');
  }

  function play () {
    console.debug(TAG + 'template.play()');
    if (self.state !== State.LOADED && self.state !== State.STOPPED) {
      console.debug(TAG + 'Invalid state ' + self.state);
      return;
    }

    self.state = State.PLAYING;
    return invoke.bind(self, 'onPlay');
  }

  function stop () {
    console.debug(TAG + 'template.stop()');
    if (self.state !== State.PLAYING) {
      console.debug(TAG + 'Invalid state ' + self.state);
      return;
    }

    self.state = State.STOPPED;
    return invoke.bind(self, 'onStop');
  }

  function next () {
    console.debug(TAG + 'template.next()');
    if (self.state !== State.PLAYING) {
      console.debug(TAG + 'Invalid state ' + self.state);
      return;
    }

    return invoke.bind(self, 'onNext');
  }

  function update (data) {
    console.debug(TAG + 'template.update()', data);

    return function (data) {
      // console.debug(TAG + 'Parsing data', data);
      data = Parser.parseData(data);
      invoke.call(self, 'onUpdate', data);
    }.bind(self, data);
  }

  function invoke (name, data) {
    console.debug(TAG + 'template.' + name + '()');
    if (self.template && typeof self.template[ name ] === 'function') {
      // console.debug(TAG + 'Calling template.' + name + '()');
      self.template[ name ].apply(self.template, [ data ]);
    } else {
      // console.warn(TAG + 'Template function ' + name + ' not defined');
    }
  }

  function wrap (obj, origFn, fn) {
    return function () {
      var nextFn = fn.apply(self, arguments);
      if (!nextFn) {
        return;
      }
      if (origFn && typeof origFn === 'function') {
        origFn.apply(obj, arguments);
      } else {
        nextFn();
      }
    }
  }

  template.state = function () {return self.state};
  template.load = wrap(template, template.load, load);
  template.play = wrap(template, template.play, play);
  template.stop = wrap(template, template.stop, stop);
  template.next = wrap(template, template.next, next);
  template.update = wrap(template, template.update, update);

  return template;
}

module.exports = TemplateAdapter;


},{"./Parser":2,"./State":3}],5:[function(require,module,exports){
'use strict';

module.exports = function ($, window, document) {
  return function Toolbox () {
    var TAG = 'HtmlCg/Toolbox: ';
    var self = this;

    var filename = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
    var KEY = 'htmlcg.toolbox.' + filename + '.';

    function btnInvokeOnClick () {
      var value = self.$toolbox.find('[name="inputInvoke"]').val();
      window.localStorage.setItem(KEY + '.inputInvoke', value);
      window.eval(value.replace(/[^a-z0-9]/ig, '') + '()');
    }

    function btnUpdateOnClick () {
      var value = self.$toolbox.find('[name="inputUpdate"]').val();
      window.localStorage.setItem(KEY + '.inputUpdate', value);
      window.update(value);
    }

    $(function () {
      var $body = $('body');
      $body.addClass('debug');

      // console.debug(TAG + 'Appending debug toolbox');
      self.$toolbox = $('<div id="htmlcg-toolbox" class="htmlcg-toolbox"><div class="modal-dialog"><div class="modal-content">' +
        '<div class="modal-header"><div class="htmlcg-dialog-title">htmlcg</div></div>' +
        '<div class="modal-body">' +
        '<table><tr>' +
        '<td><button type="button" name="btnPlay" onclick="play()">Play</button></td>' +
        '<td><button type="button" name="btnNext" onclick="next()">Next</button></td>' +
        '<td><button type="button" name="btnStop" onclick="stop()">Stop</button></td>' +
        '</tr><tr>' +
        '<td colspan="2"><input type="text" name="inputInvoke" id="htmlcg_input_invoke"></td>' +
        '<td><button type="button" name="btnInvoke">Invoke</button></td>' +
        '</tr><tr>' +
        '<td colspan="3"><textarea name="inputUpdate" id="htmlcg_input_update" rows="5"></textarea></td>' +
        '</tr><tr>' +
        '<td colspan="3"><button type="button" name="btnUpdate">Update</button></td>' +
        '</tr></table>' +
        '</div>' + // modal-body
        '</div></div></div>'
      ).appendTo('body');

      self.$toolbox.find('[name="btnInvoke"]').click(btnInvokeOnClick);
      self.$toolbox.find('[name="btnUpdate"]').click(btnUpdateOnClick);

      self.$toolbox.find('.htmlcg-dialog-title').text(document.title);

      // Set/reset position
      self.$toolbox.css('top', Math.max(0, Math.min(window.innerHeight - self.$toolbox.outerHeight(), parseInt(window.localStorage.getItem(KEY + '.top')) || Number.MAX_VALUE)));
      self.$toolbox.css('left', Math.max(0, Math.min(window.innerWidth - self.$toolbox.outerWidth(), parseInt(window.localStorage.getItem(KEY + '.left')) || Number.MAX_VALUE)));

      // Restore input values
      self.$toolbox.find('[name="inputInvoke"]').val(window.localStorage.getItem(KEY + '.inputInvoke'));
      self.$toolbox.find('[name="inputUpdate"]').val(window.localStorage.getItem(KEY + '.inputUpdate'));

      // Make toolbox draggable
      self.$toolbox.find('div.modal-header').css('cursor', 'move').on("mousedown", function (e) {
        var $drag = self.$toolbox.addClass('draggable');
        var z_idx = $drag.css('z-index'),
          drg_h = $drag.outerHeight(),
          drg_w = $drag.outerWidth(),
          pos_y = $drag.offset().top + drg_h - e.pageY,
          pos_x = $drag.offset().left + drg_w - e.pageX;
        $drag.css('z-index', 1000).parents().on("mousemove", function (e) {
          $('.draggable').offset({
            top: e.pageY + pos_y - drg_h,
            left: e.pageX + pos_x - drg_w
          });
        });
        e.preventDefault(); // disable selection
      }).on("mouseup", function () {
        self.$toolbox.removeClass('draggable');
        window.localStorage.setItem(KEY + '.top', self.$toolbox.css('top'));
        window.localStorage.setItem(KEY + '.left', self.$toolbox.css('left'));
      });
    });
  }
};
},{}],6:[function(require,module,exports){
'use strict';

/**
 * htmlcg-framework
 *
 * Copyright (c) 2017 Reto Inderbitzin <mail@indr.ch>
 *
 * For the full copyright and licence information, please view
 * the LICENSE file that was distributed with this source code.
 */

module.exports = function (window) {
  var TemplateAdapter = require('./TemplateAdapter');

  function WindowAdapter (template, opts) {
    var TAG = 'HtmlCg/WindowAdapter: ';

    opts = opts || {};
    opts.api = opts.api || [];

    var self = this;

    template = new TemplateAdapter(template);
    template.load();

    function invoke (name, data) {
      console.debug(TAG + 'window.' + name + '()');
      if (template && typeof template[ name ] === 'function') {
        // console.debug(TAG + 'Calling template.' + name + '()');
        template[ name ](data);
      } else {
        console.warn(TAG + 'Template function ' + name + ' not defined');
      }
    }

    // See https://github.com/CasparCG/Server/blob/master/modules/html/producer/html_producer.cpp#L501
    [ 'play', 'stop', 'next', 'update' ].concat(opts.api).forEach(function (name) {
      console.debug(TAG + 'Defining window.' + name + '()');
      window[ name ] = invoke.bind(self, name);
    });
  }

  return WindowAdapter;
};

},{"./TemplateAdapter":4}],7:[function(require,module,exports){
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
    document.title = filename + ' - ' + document.title + ' - htmlcg ' + utils.version;
  }

  // Create toolbox in debug mode
  var toolbox = null;
  if (isDebug) {
    var Toolbox = require('./Toolbox')($, window, document);
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

},{"./Parser":2,"./State":3,"./Toolbox":5,"./WindowAdapter":6,"./utils":8}],8:[function(require,module,exports){
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

},{"../../package.json":1}]},{},[7]);
