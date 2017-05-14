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
