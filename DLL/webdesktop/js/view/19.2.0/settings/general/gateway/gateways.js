define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","view/19.2.0/settings/general/gateway/gateway","text!template/19.2.0/settings/general/gateway/gateways.tpl.html","text!template/19.2.0/settings/general/gateway/search.tpl.html","js/libs/iscroll.js"],function(e,t,a,i,s,r,l,n,c){var h=i.View.extend({_template:a.template(n),_search:a.template(c),initialize:function(){e("#settings-gateway-search").remove(),this.render()},render:function(){e("#back-general").show(),this.$el.html(this._template),this.$el.trigger("create"),this.collection&&this.collection.each(this.LoadGateways,this),s.isBrowserMode?r.ApplyListScroll():this.myScroll=new iScroll("scroll-wrapper")},LoadGateways:function(e){this.gatewayPreference=new l({model:e}),this.$("#gatewaysListPreference").append(this.gatewayPreference.render().el),this.$("#gatewaysListPreference").listview("refresh")},SetSelected:function(t){this.collection.each(function(a){a.get("MerchantLogin")===t&&(e("<img class='ui-li-icon' style ='height:25px;width:27px;top:7px;'/>").attr({src:"img/check@2x.png"}).prependTo(e("#"+a.cid)),e("#gatewaysListPreference").listview("refresh"))})}});return h});