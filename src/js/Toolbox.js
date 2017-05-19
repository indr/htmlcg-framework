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