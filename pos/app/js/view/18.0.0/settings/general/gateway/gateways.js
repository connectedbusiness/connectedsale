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
  'view/16.0.0/settings/general/gateway/gateway',
  'text!template/16.0.0/settings/general/gateway/gateways.tpl.html',
  'text!template/16.0.0/settings/general/gateway/search.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Shared, GatewayPreference, GatewaysTemplate, SearchTemplate) {
  var GatewaysPreference = Backbone.View.extend({
    _template: _.template(GatewaysTemplate),
    _search: _.template(SearchTemplate),
    initialize: function() {
      $("#settings-gateway-search").remove();
      this.render();
    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);

      //$("#right-pane-content").before( this._search );

      this.$el.trigger("create");
      if(this.collection){
      this.collection.each(this.LoadGateways, this);
      }

      if (Global.isBrowserMode) Shared.ApplyListScroll();
      else this.myScroll = new iScroll('scroll-wrapper');
    },

    LoadGateways: function(model) {
      this.gatewayPreference = new GatewayPreference({
        model: model
      });
      this.$("#gatewaysListPreference").append(this.gatewayPreference.render().el);
      this.$("#gatewaysListPreference").listview("refresh");
    },

     SetSelected: function(gatewayCode){      
      this.collection.each(function(gateway){
        if (gateway.get("MerchantLogin") === gatewayCode){
           $("<img class='ui-li-icon' style ='height:25px;width:27px;top:7px;'/>").attr({
            src: "img/check@2x.png"
          }).prependTo($('#' + gateway.cid));
          $("#gatewaysListPreference").listview("refresh");
        }
      });
    }

  });
  return GatewaysPreference;
});
