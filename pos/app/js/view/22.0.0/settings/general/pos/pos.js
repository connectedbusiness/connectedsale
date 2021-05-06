/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'text!template/19.2.0/settings/general/pos/pos.tpl.html'
], function($, $$, _, Backbone, Global, template) {
  var POSPreference = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "change #radio-Order-POS": "radioOrder_changed",
      "change #radio-Sale-POS": "radioSale_changed",
      "change #radio-Quote-POS": "radioQuote_changed",
      "change #radio-Return-POS": "radioReturn_changed"
    },

    radioSale_changed: function(e) {
      this.selectedTransaction = 0;
      Global.Preference.DefaultPOSTransaction = this.selectedTransaction;

      this.trigger("selected", this);
      this.SetSelected();
    },

    radioOrder_changed: function(e) {
      this.selectedTransaction = 1;
      Global.Preference.DefaultPOSTransaction = this.selectedTransaction;

      this.trigger("selected", this);
      this.SetSelected();
    },
    radioQuote_changed: function(e) {
      this.selectedTransaction = 2;
      Global.Preference.DefaultPOSTransaction = this.selectedTransaction;

      this.trigger("selected", this);
      this.SetSelected();
    },

    radioReturn_changed: function(e) {
      this.selectedTransaction = 3;
      Global.Preference.DefaultPOSTransaction = this.selectedTransaction;

      this.trigger("selected", this);
      this.SetSelected();
    },

    initialize: function() {
      this.render();
    },
    DisableOption: function() {
      if (Global.Preference.AllowSales === false) {
        this.$("#div-Sale-POS").addClass("ui-disabled");
      }
      if (Global.Preference.AllowOrders === false) {
        this.$("#div-Order-POS").addClass("ui-disabled");
      }
      if (Global.Preference.AllowQuotes === false) {
        this.$("#div-Quote-POS").addClass("ui-disabled");
      }
      if (Global.Preference.AllowReturns === false) {
        this.$("#div-Return-POS").addClass("ui-disabled");
      }
    },
    ResetSelected: function() {
      $("#radio-Sale-POS").attr('checked', false).checkboxradio("refresh");
      $("#radio-Order-POS").attr('checked', false).checkboxradio("refresh");
      $("#radio-Quote-POS").attr('checked', false).checkboxradio("refresh");
      $("#radio-Return-POS").attr('checked', false).checkboxradio("refresh");
    },

    SetSelected: function() {
      this.ResetSelected();
      switch (this.selectedTransaction) {
        case 0:
          $('#radio-Sale-POS').attr('checked', true).checkboxradio("refresh");
          break;
        case 1:
          $("#radio-Order-POS").attr('checked', true).checkboxradio("refresh");
          break;
        case 2:
          $("#radio-Quote-POS").attr('checked', true).checkboxradio("refresh");
          break;
        case 3:
          $("#radio-Return-POS").attr('checked', true).checkboxradio("refresh");
          break;
      }

    },
    render: function() {      
      $("#back-general").show();
      this.$el.html(this._template);
      this.$el.trigger("create");
      this.DisableOption();
      this.selectedTransaction = this.model.get("DefaultPOSTransaction");
      this.SetSelected();

    }
  });
  return POSPreference;
})
