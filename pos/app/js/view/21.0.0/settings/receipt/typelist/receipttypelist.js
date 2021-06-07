define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'view/21.0.0/settings/receipt/typelist/receipttypevalue',
  'text!template/21.0.0/settings/receipt/typelist/receipttypelist.tpl.html',
  'text!template/21.0.0/settings/receipt/typelist/search.tpl.html',
  'js/libs/iscroll.js',
], function($, $$, _, Backbone, Global, Shared, ReceiptTypeValuePreference, template, searchTemplate) {
  var ReceiptTypeListPreference = Backbone.View.extend({
    _template: _.template(template),
    _search: _.template(searchTemplate),

    initialize: function() {
      $("#settings-report-search").remove();
      this.render();
    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);
      $("#right-pane-content").before(this._search);
      this.$el.trigger("create");
      this.collection.each(this.LoadReceiptTypeValue, this);

      if (Global.isBrowserMode) Shared.ApplyListScroll();
      else this.myScroll = new iScroll('scroll-wrapper');

      this.SetSelected();
    },

    SetSelected: function(selectedReportCode) {
      //_selectedReportCode = this.GetSelectedReportCode();
      this.collection.each(function(receipt) {
        if (receipt.get("ReportCode") === selectedReportCode) {
          $("<img class='ui-li-icon' style ='height:25px;width:27px;'/>").attr({
            src: "img/check@2x.png"
          }).prependTo($('#' + receipt.cid));
          $("#receipt-list-preference").listview("refresh");
        }
      });
    },

    LoadReceiptTypeValue: function(model) {
      this.ReceiptTypeValuePref = new ReceiptTypeValuePreference({
        model: model
      });
      this.$("#receipt-list-preference").append(this.ReceiptTypeValuePref.render().el);
      this.$("#receipt-list-preference").listview("refresh");
    }

  });
  return ReceiptTypeListPreference;
});
