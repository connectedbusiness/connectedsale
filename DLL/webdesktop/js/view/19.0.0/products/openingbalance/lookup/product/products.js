define(["jquery","mobile","underscore","backbone","shared/global","view/19.0.0/products/openingbalance/lookup/product/product","text!template/19.0.0/products/openingbalance/lookup/product/products.tpl.html","js/libs/iscroll.js"],function(e,t,o,r,i,n,l){var c=r.View.extend({initialize:function(){this.$el.html(o.template(l))},RefreshList:function(e){this.collection=e,this.render()},render:function(){e("#lookup-content").trigger("create"),e("#productListContainer").html(""),this.GroupCollection(),e("#productListContainer").listview("refresh"),i.isBrowserMode||(this.myScroll?this.myScroll.refresh():this.myScroll=new iScroll("lookup-content",{hScroll:!1}))},GroupCollection:function(e){this.GroupByItemName()},GroupByItemName:function(){var t=this.collection,r=t.pluck("ItemName"),i=o.groupBy(r,function(e){return e.charAt(0).toUpperCase()});for(var l in i)e("#productListContainer").append("<li data-role='list-divider'>"+l+"</li>"),t.each(function(t){var o=t.get("ItemName");o.charAt(0).toUpperCase()===l.toUpperCase()&&(this.productView=new n({model:t}),e("#productListContainer").append(this.productView.render().el))})}});return c});