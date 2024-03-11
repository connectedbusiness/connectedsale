/**
 * Connected Business | 08-6-2012
 * Required: el
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'view/24.0.0/pos/keypad/keypad',
  'text!template/24.0.0/pos/drawerbalance/openingamount.tpl.html',
], function($, $$, _, Backbone, Global, Shared, KeypadView, template) {

  var OpeningAmountView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap #keypad-done-btn": "btnSave_tap"
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html(this._template({
        PaymentType: Global.PaymentType
      }));
      this.InitializePaymentDetail();
      $("#main-transaction-blockoverlay").show();
      Shared.BlurItemScan();
    },

    InitializePaymentDetail: function() {
      this.InitializeKeypadView();
    },

    Close: function() {
      this.Hide();
      $("#main-transaction-blockoverlay").hide();
    },

    Show: function() {
      this.render();
      this.$el.show();
    },

    Hide: function() {
      $(document).unbind('keydown');
      this.$el.html("");
      this.$el.hide();
    },

    btnSave_tap: function(e) {
      e.preventDefault();
      this.trigger("SaveAmount", this.GetAmount());
      this.Close();
    },

    InitializeKeypadView: function() {
      if (this.keypadView) {
        this.keypadView.remove();
      }

      this.keypadView = new KeypadView({
        el: $(".keypad")
      });
      this.keypadView.on('enterTriggered', function() {
        $('#keypad-done-btn').tap();
      }, this)
      this.keypadView.Show();
    },

    GetAmount: function() {
      if (this.keypadView) {
        return this.keypadView.GetAmount();
      }
      return 0;
    }

  });

  return OpeningAmountView;
});
