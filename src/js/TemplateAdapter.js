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

