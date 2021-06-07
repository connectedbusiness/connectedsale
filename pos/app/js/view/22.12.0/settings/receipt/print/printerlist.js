define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'view/22.12.0/settings/receipt/print/printerlistvalue',
  'text!template/22.12.0/settings/receipt/print/printerlist.tpl.html',
  'js/libs/iscroll.js',
], function($, $$, _, Backbone, Global, Shared, PrinterListValue, template) {
  var PrinterList = Backbone.View.extend({
    _template: _.template(template),

    initialize: function() {
      $("#settings-default-printer").remove();
      this.render();
    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);
      $("#right-pane-content").before(this._search);
      this.$el.trigger("create");

      this.LoadPrinters();

      if (Global.isBrowserMode) Shared.ApplyListScroll();
      else this.myScroll = new iScroll('scroll-wrapper');

      this.SetSelected();
    },

    SetSelected: function(defaultPrinter) {
      if (defaultPrinter) {
        this.collection.forEach(function(item) {
          if (item.get("Printer") === defaultPrinter) {
            $("<img class='ui-li-icon' style ='height:25px;width:27px;'/>").attr({
              src: "img/check@2x.png"
            }).prependTo($('#' + item.cid));
            $("#printer-list").listview("refresh");
          }
        });
      }
    },

    LoadPrinters: function() {
      this.collection.forEach(function(model) {
        this.LoadPrinterListValue = new PrinterListValue({
          model: model
        });
        this.$("#printer-list").append(this.LoadPrinterListValue.render().el);
        this.$("#printer-list").listview("refresh");
      });
    }

  });
  return PrinterList;
});
