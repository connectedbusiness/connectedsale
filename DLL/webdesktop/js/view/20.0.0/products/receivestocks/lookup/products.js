define(["jquery","mobile","underscore","backbone","shared/global","view/20.0.0/products/receivestocks/lookup/product","text!template/20.0.0/products/receivestocks/lookup/products.tpl.html","js/libs/iscroll.js"],function(e,t,o,r,i,n,c){var l=r.View.extend({initialize:function(){this.$el.html(o.template(c))},render:function(){e("#lookup-content").trigger("create");var t=this.collection.sortVar;this.GroupCollection(t),e("#productListContainer").listview("refresh"),i.isBrowserMode||(this.myScroll?this.myScroll.refresh():this.myScroll=new iScroll("lookup-content",{hScroll:!1}))},GroupCollection:function(e){switch(e){case"ItemName":this.GroupByItemName();break;case"CategoryCode":this.GroupByCategoryCode()}},GroupByItemName:function(){var t=this.collection;t.each(function(e){"Service"!==e.get("ItemType")&&"Non-Stock"!==e.get("ItemType")||e.destroy()});var r=t.pluck("ItemName"),i=o.groupBy(r,function(e){return e.charAt(0).toUpperCase()});for(var c in i)e("#productListContainer").append("<li data-role='list-divider'>"+c+"</li>"),t.each(function(t){var o=t.get("ItemName");o.charAt(0).toUpperCase()===c.toUpperCase()&&(this.productView=new n({model:t}),e("#productListContainer").append(this.productView.render().el))})},GroupByCategoryCode:function(){var t=this.collection,r=t.pluck("CategoryCode"),i=o.groupBy(r,function(e){return null===e?e="No Category":e});for(var c in i)e("#productListContainer").append("<li data-role='list-divider'>"+c+"</li>"),t.each(function(t){var o=t.get("CategoryCode");o===c?(this.productView=new n({model:t}),e("#productListContainer").append(this.productView.render().el)):"No Category"===c&&null===o&&(this.productView=new n({model:t}),e("#productListContainer").append(this.productView.render().el))})}});return l});