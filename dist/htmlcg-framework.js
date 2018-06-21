(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
  "name": "htmlcg-framework",
  "version": "0.3.1",
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
    "browserify": "^16.2.2",
    "del": "^3.0.0",
    "gulp": "^3.9.1",
    "gulp-rename": "^1.2.2",
    "gulp-uglify": "^3.0.0",
    "vinyl-buffer": "^1.0.0",
    "vinyl-source-stream": "^2.0.0"
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
      data = typeof data === 'object' ? data : Parser.parseData(data);
      invoke.call(self, 'onUpdate', data || {});
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

module.exports = function ($, window, document, utils) {
  return function Toolbox (opts) {
    opts = opts || {};
    opts.api = Array.isArray(opts.api) ? opts.api : [];

    var TAG = 'HtmlCg/Toolbox: ';
    var self = this;

    var filename = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
    var KEY = 'htmlcg.toolbox.' + filename + '.';

    var loadOnPlay = true;

    function btnPlayOnClick () {
      if (loadOnPlay) {
        btnUpdateOnClick();
        loadOnPlay = false;
      }
      window.play();
    }

    function btnInvokeOnClick () {
      var value = self.$toolbox.find('[name="selectInvoke"]').val();
      window.localStorage.setItem(KEY + '.selectInvoke', value);
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
        '<td><button type="button" name="btnPlay">Play</button></td>' +
        '<td><button type="button" name="btnNext">Next</button></td>' +
        '<td><button type="button" name="btnStop">Stop</button></td>' +
        '</tr><tr>' +
        '<td colspan="2"><select name="selectInvoke"></select></td>' +
        '<td><button type="button" name="btnInvoke">Invoke</button></td>' +
        '</tr><tr>' +
        '<td colspan="3"><textarea name="inputUpdate" id="htmlcg_input_update" rows="5"></textarea></td>' +
        '</tr><tr>' +
        '<td colspan="3"><button type="button" name="btnUpdate">Update</button></td>' +
        '</tr></table>' +
        '</div>' + // modal-body
        '<div class="modal-footer"><a href="https://github.com/indr/htmlcg-framework">htmlcg-framework@' + utils.version + '</a></div>' +
        '</div></div></div>'
      ).appendTo('body');

      var map = function (name) { return '<option value="' + name + '">' + name + '</option>'; };

      var options = opts.api.map(map);
      if (options.length > 0) {
        options.push('<option disabled="disabled">---</option>');
      }
      options = options.concat([ 'play', 'stop', 'next', 'update' ].map(map));

      self.$toolbox.find('[name="selectInvoke"]').append(options.join());

      self.$toolbox.find('button[name="btnPlay"]').click(btnPlayOnClick);
      self.$toolbox.find('button[name="btnNext"]').click(function () { window.next();});
      self.$toolbox.find('button[name="btnStop"]').click(function () { window.stop(); });
      self.$toolbox.find('button[name="btnInvoke"]').click(btnInvokeOnClick);
      self.$toolbox.find('button[name="btnUpdate"]').click(btnUpdateOnClick);

      self.$toolbox.find('.htmlcg-dialog-title').text(document.title);

      // Set/reset position
      self.$toolbox.css('top', Math.max(0, Math.min(window.innerHeight - self.$toolbox.outerHeight(), parseInt(window.localStorage.getItem(KEY + '.top')) || Number.MAX_VALUE)));
      self.$toolbox.css('left', Math.max(0, Math.min(window.innerWidth - self.$toolbox.outerWidth(), parseInt(window.localStorage.getItem(KEY + '.left')) || Number.MAX_VALUE)));

      // Restore input values
      self.$toolbox.find('[name="selectInvoke"]').val(window.localStorage.getItem(KEY + '.selectInvoke'));
      var data = window.localStorage.getItem(KEY + '.inputUpdate');
      self.$toolbox.find('[name="inputUpdate"]').val(data && data.length > 0 ? data : opts.data);

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
    opts.api = Array.isArray(opts.api) ? opts.api : [];

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

module.exports = (function ($, window, document) {
  var Parser = require('./Parser');
  var State = require('./State');
  var utils = require('./utils')($, window);
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
  window.HtmlCg.run = function (template, opts) {
    return new HtmlCg(template, opts);
  };

  // Return constructor
  return HtmlCg;
}((window.jQuery || window.Zepto), window, (window ? window.document : undefined)));

},{"./Parser":2,"./State":3,"./Toolbox":5,"./WindowAdapter":6,"./utils":8}],8:[function(require,module,exports){
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

},{"../../package.json":1}]},{},[7]);
