define(["jquery","mobile","underscore","backbone","shared/shared","view/16.0.0/pos/item/header-info/shipto/shipto","text!template/16.0.0/pos/item/header-info/shipto/shiptos.tpl.html","js/libs/iscroll.js"],function(e,t,i,o,s,r,h){var n=o.View.extend({_template:i.template(h),initialize:function(){this.Show(),this.collection.on("reset",this.LoadItems,this),e("#shipto-content").trigger("create")},LoadItems:function(){s.BlurItemScan(),this.GroupByShipToName(this.collection),e("#shiptoListContainer").listview("refresh"),this.myScroll?this.myScroll.refresh():this.myScroll=new iScroll("shipto-content",{hScroll:!1})},GroupByShipToName:function(t){var o=t.pluck("ShipToName"),h=i.groupBy(o,function(e){return e.charAt(0).toUpperCase()});for(var n in h)e("#shiptoListContainer").append("<li data-role='list-divider'>"+n+"</li>"),t.each(function(t){var i=t.get("ShipToName");t.set({DisplayShipToName:s.Escapedhtml(i)}),i.charAt(0).toUpperCase()===n.toUpperCase()&&(this.shiptoView=new r({model:t}),e("#shiptoListContainer").append(this.shiptoView.render().el))})},Show:function(){this.$el.html(this._template)}});return n});