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
  'view/19.0.0/settings/general/posshippingmethod/posshippingmethod',
  'text!template/19.0.0/settings/general/posshippingmethod/posshippingmethods.tpl.html',
  'text!template/19.0.0/settings/general/posshippingmethod/search.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Shared, LocationPreference, LocationsTemplate, SearchTemplate) {
  var LocationsPreference = Backbone.View.extend({
    _template: _.template(LocationsTemplate),
    _search: _.template(SearchTemplate),
    initialize: function() {
      $("#settings-posshippingmethod-search").remove();
      this.render();
    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);

      //$("#right-pane-content").before( this._search );

      this.$el.trigger("create");
      this.collection.each(this.LoadLocations, this);

      if (Global.isBrowserMode) Shared.ApplyListScroll();
      else this.myScroll = new iScroll('scroll-wrapper');
    },

    LoadLocations: function(model) {
      this.locationPreference = new LocationPreference({
        model: model
      });
      this.$("#posshippingMethodListPreference").append(this.locationPreference.render().el);
      this.$("#posshippingMethodListPreference").listview("refresh");
    },

    SetSelected: function(locations){
      this.collection.each(function(location){
        if (location.get("ShippingMethodCode") === locations){
           $("<img class='ui-li-icon' style ='height:25px;width:27px;top:7px;'/>").attr({
            src: "img/check@2x.png"
          }).prependTo($('#' + location.cid));
          $("#posshippingMethodListPreference").listview("refresh");
        }
      });
    }

  });
  return LocationsPreference;
});
