/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'view/15.0.1/settings/general/paymenttype/paymenttype',
  'text!template/15.0.1/settings/general/paymenttype/paymenttypes.tpl.html',
  'text!template/15.0.1/settings/general/paymenttype/search.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Shared, PaymentTypeView, PaymentTypesTemplate, SearchTemplate) {
  var PaymentTypePreference = Backbone.View.extend({
    _template: _.template(PaymentTypesTemplate),
    _search: _.template(SearchTemplate),
    initialize: function() {
      $("#settings-paymenttype-search").remove();
      this.render();
    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);

      //$("#right-pane-content").before( this._search );

      this.$el.trigger("create");
      if(this.collection){
      this.collection.each(this.LoadPaymentType, this);
      }

      if (Global.isBrowserMode) Shared.UseBrowserScroll('#right-pane-content');
      else this.myScroll = new iScroll('right-pane-content');
    },

    LoadPaymentType: function(model) {
      var paymentTypePreference = new PaymentTypeView({
        model: model
      });
      this.$("#paymenttypesListPreference").append(paymentTypePreference.render().el);
      this.$("#paymenttypesListPreference").listview("refresh");
    }

  });
  return PaymentTypePreference;
});
