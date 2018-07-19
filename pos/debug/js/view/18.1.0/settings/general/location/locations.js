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
  'view/18.1.0/settings/general/location/location',
  'text!template/18.1.0/settings/general/location/locations.tpl.html',
  'text!template/18.1.0/settings/general/location/search.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Shared, LocationPreference, LocationsTemplate, SearchTemplate) {
  var LocationsPreference = Backbone.View.extend({
    _template: _.template(LocationsTemplate),
    _search: _.template(SearchTemplate),
    initialize: function() {
      $("#settings-location-search").remove();
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
      this.$("#locationsListPreference").append(this.locationPreference.render().el);
      this.$("#locationsListPreference").listview("refresh");
    },

    SetSelected: function(locations){
      this.collection.each(function(location){
        if (location.get("WarehouseCode") === locations){
           $("<img class='ui-li-icon' style ='height:25px;width:27px;top:7px;'/>").attr({
            src: "img/check@2x.png"
          }).prependTo($('#' + location.cid));
          $("#locationsListPreference").listview("refresh");
        }
      });
    }

  });
  return LocationsPreference;
});
