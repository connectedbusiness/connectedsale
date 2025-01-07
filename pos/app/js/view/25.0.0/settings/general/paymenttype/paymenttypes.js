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
  'view/25.0.0/settings/general/paymenttype/paymenttype',
  'text!template/25.0.0/settings/general/paymenttype/paymenttypes.tpl.html',
  'text!template/25.0.0/settings/general/paymenttype/search.tpl.html',
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

      if (Global.isBrowserMode) Shared.ApplyListScroll();
      else this.myScroll = new iScroll('scroll-wrapper');
    },

    LoadPaymentType: function(model) {
      var paymentTypePreference = new PaymentTypeView({
        model: model
      });
      this.$("#paymenttypesListPreference").append(paymentTypePreference.render().el);
      this.$("#paymenttypesListPreference").listview("refresh");
    },

    SetSelected: function(paymentTypeCode){      
      this.collection.each(function(paymenttype){
        if (paymenttype.get("PaymentTypeCode") === paymentTypeCode){
           $("<img class='ui-li-icon' style ='height:25px;width:27px;top:7px;'/>").attr({
            src: "img/check@2x.png"
          }).prependTo($('#' + paymenttype.cid));
          $("#paymenttypesListPreference").listview("refresh");
        }
      });
    }

  });
  return PaymentTypePreference;
});
