define(["jquery","mobile","underscore","backbone","shared/shared","shared/global","view/21.0.0/pos/item/header-info/customer/customer","text!template/21.0.0/pos/item/header-info/customer/customers.tpl.html","js/libs/iscroll.js"],function(e,t,r,o,s,i,n,a){var l=o.View.extend({_template:r.template(a),initialize:function(){this.Show(),this.collection.on("reset",this.LoadItems,this),e("#customer-content").trigger("create"),s.BlurItemScan()},LoadItems:function(){s.BlurItemScan(),this.GroupByCustomerName(this.collection),e("#customerListContainer").listview("refresh"),i.isBrowserMode||(this.myScroll?this.myScroll.refresh():this.myScroll=new iScroll("customer-content",{hScroll:!1}))},GroupByCustomerName:function(t){var o=t.pluck("CustomerName"),i=r.groupBy(o,function(e){return e.charAt(0).toUpperCase()});for(var a in i)e("#customerListContainer").append("<li data-role='list-divider'>"+a+"</li>"),t.each(function(t){var r=t.get("CustomerName");t.set({DisplayCustomerName:s.Escapedhtml(r)}),r.charAt(0).toUpperCase()===a.toUpperCase()&&(this.customerView=new n({model:t}),e("#customerListContainer").append(this.customerView.render().el))})},Show:function(){this.$el.html(this._template)}});return l});