define(["jquery","mobile","underscore","backbone","shared/enum","shared/service","shared/method","shared/global","shared/shared","model/lookupcriteria","collection/base","view/19.2.0/pos/pickup/pickupitem","text!template/19.2.0/pos/pickup/pickuplist.tpl.html","js/libs/iscroll.js"],function(e,i,t,o,r,l,s,n,c,h,d,u,a){var p=o.View.extend({events:{},_template:t.template(a),initialize:function(){this.on("update-list",this.updateCollection,this),this.show()},render:function(){return this.$el.html(this._template),this.show(),this.loadPickups(),this.$el},show:function(){this.$el.show()},hide:function(){this.$el.hide()},printPickingTicket:function(e){this.trigger("print-picking-ticket",e)},readyForInvoice:function(e){this.trigger("ready-for-invoice",e)},updateCollection:function(e,i){if(this.orderCollection&&0!=this.orderCollection.length){var t=null;this.orderCollection.each(function(o){e==o.get("SalesOrderCode")&&(i&&o.trigger("printed"),t=o)}),!i&&t&&(t.trigger("destroy"),this.orderCollection.remove(t)),this.orderCollection&&0==this.orderCollection.length&&this.resetOrderCollection(null)}},loadPickups:function(){this.RefreshMyScroll(!0),this.$el.find("#pickup-list-ul").html(this.setDefaultDisplay("Loading..."));var e=this,i=new h,t="100";i.set({CriteriaString:"",DateTimeTicks:0,IsTrackStorePickUp:n.Preference.IsTrackStorePickUp,PickupStage:"4",WarehouseCode:n.Preference.DefaultLocation}),i.url=n.ServiceUrl+l.SOP+s.ORDERLOOKUP+t,i.save(null,{success:function(i,t){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.resetOrderCollection(t.SalesOrders)},error:function(e,i,t){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()}})},RefreshMyScroll:function(e){if(!n.isBrowserMode)return e&&this.myScroll?(this.myScroll.destroy(),void(this.myScroll=null)):void(this.myScroll?this.myScroll.refresh():this.myScroll=new iScroll("pickup-list",{vScrollbar:!0,vScroll:!0,snap:!1,momentum:!0,zoom:!1}))},resetOrderCollection:function(e){this.orderCollection||(this.orderCollection=new d,this.orderCollection.off("print-picking-ticket"),this.orderCollection.on("print-picking-ticket",this.printPickingTicket,this),this.orderCollection.off("ready-for-invoice"),this.orderCollection.on("ready-for-invoice",this.readyForInvoice,this),this.orderCollection.off("refresh-scroll"),this.orderCollection.on("refresh-scroll",this.RefreshMyScroll,this)),this.orderCollection.reset(e),this.$el.find("#pickup-list-ul").html(""),0==this.orderCollection.length&&this.$el.find("#pickup-list-ul").html(this.setDefaultDisplay("No New Pickup Order Found.")),this.displayPickups()},setDefaultDisplay:function(e){return'<li class="no-record"><div>'+e+"</div></li> "},displayPickups:function(){var e=this;this.orderCollection.each(function(i){e.addOne(i)}),this.RefreshMyScroll()},addOne:function(e){var i=this,t=document.createElement("li");i.$el.find("#pickup-list-ul").append(t);new u({el:t,model:e})}});return p});