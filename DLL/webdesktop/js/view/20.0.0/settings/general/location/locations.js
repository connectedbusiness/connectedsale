define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","view/20.0.0/settings/general/location/location","text!template/20.0.0/settings/general/location/locations.tpl.html","text!template/20.0.0/settings/general/location/search.tpl.html","js/libs/iscroll.js"],function(e,t,i,o,l,n,s,r,c){var a=o.View.extend({_template:i.template(r),_search:i.template(c),initialize:function(){e("#settings-location-search").remove(),this.render()},render:function(){e("#back-general").show(),this.$el.html(this._template),this.$el.trigger("create"),this.collection.each(this.LoadLocations,this),l.isBrowserMode?n.ApplyListScroll():this.myScroll=new iScroll("scroll-wrapper")},LoadLocations:function(e){this.locationPreference=new s({model:e}),this.$("#locationsListPreference").append(this.locationPreference.render().el),this.$("#locationsListPreference").listview("refresh")},SetSelected:function(t){this.collection.each(function(i){i.get("WarehouseCode")===t&&(e("<img class='ui-li-icon' style ='height:25px;width:27px;top:7px;'/>").attr({src:"img/check@2x.png"}).prependTo(e("#"+i.cid)),e("#locationsListPreference").listview("refresh"))})}});return a});