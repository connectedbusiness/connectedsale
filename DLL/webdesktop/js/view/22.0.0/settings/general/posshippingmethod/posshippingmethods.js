define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","view/22.0.0/settings/general/posshippingmethod/posshippingmethod","text!template/22.0.0/settings/general/posshippingmethod/posshippingmethods.tpl.html","text!template/22.0.0/settings/general/posshippingmethod/search.tpl.html","js/libs/iscroll.js"],function(e,t,i,s,o,n,r,h,p){var l=s.View.extend({_template:i.template(h),_search:i.template(p),initialize:function(){e("#settings-posshippingmethod-search").remove(),this.render()},render:function(){e("#back-general").show(),this.$el.html(this._template),this.$el.trigger("create"),this.collection.each(this.LoadLocations,this),o.isBrowserMode?n.ApplyListScroll():this.myScroll=new iScroll("scroll-wrapper")},LoadLocations:function(e){this.locationPreference=new r({model:e}),this.$("#posshippingMethodListPreference").append(this.locationPreference.render().el),this.$("#posshippingMethodListPreference").listview("refresh")},SetSelected:function(t){this.collection.each(function(i){i.get("ShippingMethodCode")===t&&(e("<img class='ui-li-icon' style ='height:25px;width:27px;top:7px;'/>").attr({src:"img/check@2x.png"}).prependTo(e("#"+i.cid)),e("#posshippingMethodListPreference").listview("refresh"))})}});return l});