/**
 * @author PR.Ebron
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'text!template/dialog/dialog.tpl.html'
  //'js/libs/datepicker.js',
], function($, $$, _, Backbone, Global, Shared, template) {

  var DialogView = Backbone.View.extend({
    _template: _.template(template),

    render: function() {
      $('#dialog-box').html();
      $('#dialog-box').html(this._template);
      return this;
    },

    Unbind: function() {
      this.unbind();
      this.remove();
    },

    AlertMsg: function(msg, title, action) {
      var _elem = document.activeElement;
      Global.PrevActiveElemId = _elem.id;

      var self = this;

      this.render();
      $("#dialog-box").dialog({
        title: title,
        position: ['center', 'center'],
        resizable: false,
        height: 'auto',
        maxHeight: 500,
        width: 400,
        maxWidth: 400,
        modal: true,
        buttons: {
          OK: function() {
            $(this).dialog("close");
            self.RemoveOverLay();
            self.FocusOnItemScan();
            if (action) action();
          }
        },
        close: function() {
          self.trigger('dialog-close');
        }
      });
      $("#dialog-box p").html(msg);
      this.ManageDialogStyle();
    },

    ConfirmDialog: function(msg, action, title, buttons) {
      var _elem = document.activeElement;
      Global.PrevActiveElemId = _elem.id;

      var self = this;
      this.render();

      this.buttonClicked = false;

      $("#dialog-box").dialog({
        title: title,
        position: ['center', 'center'],
        resizable: false,
        width: 400,
        maxWidth: 400,
        height: 200,
        maxHeight: 200,
        modal: true,
        buttons: {
          Yes: function() {
            self.buttonClicked = true;
            $(this).dialog("close");
            action(1);
            self.FocusOnItemScan();
          },
          No: function() {
            self.buttonClicked = true;
            $(this).dialog("close");
            action(0);
            self.FocusOnItemScan();
          },
        },
        close: function() {
          self.trigger('dialog-close');
          if (self.buttonClicked) return;
          action(0);
          self.FocusOnItemScan();
        }
      });
      $("#dialog-box p").html(msg);
      this.ManageDialogStyle();
      //console.log($("#dialog-box").dialog( "isOpen" ))
    },

    ManageDialogStyle: function() {
      $(".ui-widget-overlay").css("z-index", "99998");
      $(".ui-dialog").css("z-index", "99999");
    },

    RemoveOverLay: function() {
      //$(".ui-widget-overlay").remove();
    },

    FocusOnItemScan: function() {
      //console.log(Global.PrevActiveElemId);
      if (!Global.PrevActiveElemId) return;
      if (Global.PrevActiveElemId == "search-input" || Global.PrevActiveElemId == "kiosk-search-input") {
        if (Global.IsOnItemDetail) return;
        Shared.FocusToItemScan();
        this.unbind();
      }
    },

  });

  var initializeDialog = function() {
    return new DialogView();
  };

  return DialogView;
});
