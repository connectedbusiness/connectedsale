
/**
 * @author alexis.banaag
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'view/25.1.0/pos/seriallot/list/list',
  'text!template/25.1.0/pos/seriallot/list/lists.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Shared, ListView, Template) {
  var ULContainer = "#serialList";

  var ListsView = Backbone.View.extend({
    template: _.template(Template),

    scrollAttrib: {
      vScrollbar: false,
      vScroll: true,
      snap: false,
      momentum: true,
      hScrollbar: true,

    },

    initialize: function() {
      var self = this;

      this.render();
      this.serialCollection = this.options.serial;
      var flag = false;

      this.collection.each(function(model) {
        var toBeSearched = self.serialCollection.find(function(serial) {
          return serial.get("SerialLotNumber") == model.get("SerialLotNumber");
        });

        if (!toBeSearched) self.RenderListView(model);
      });

      if ($("#serialList li").length == 0) {
        this.Hide();
        this.trigger('hideSerialList');
      }
    },

    render: function() {
      this.$el.append(this.template);
      this.$(ULContainer).listview();
      this.LoadScroll();
    },

    Hide: function() {
      this.$("p").hide();
      this.$("#serialLot-list").hide();
    },

    LoadScroll: function() {
      var self = this;

      if (Global.isBrowserMode) Shared.UseBrowserScroll('#serialLot-list');
      else {
        if (!this.myScroll) {
          this.myScroll = new iScroll('serialLot-list', this.scrollAttrib);
        } else {
          //setTimeout(function () {
          //    self.myScroll.refresh();
          //}, 500);
          this.myScroll.refresh();
        }
      }
    },

    ProcessSelectedSerial: function(model) {
      this.trigger('selected', model);

      this.collection.remove(model);
      this.RefreshListView();
      this.LoadScroll();
    },

    RefreshListView: function() {
      this.$(ULContainer).listview("refresh");
    },

    RenderListView: function(model) {
      var listView = new ListView({
        model: model
      });

      listView.on('selected', this.ProcessSelectedSerial, this);

      this.$(ULContainer).append(listView.render().el);

      this.RefreshListView();
      this.LoadScroll();
    }
  });

  return ListsView;
})
