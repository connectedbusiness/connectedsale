define(["jquery","mobile","underscore","backbone","view/19.2.0/pos/itemdetail/accessory/accessory","text!template/19.2.0/pos/itemdetail/accessory/accessories.tpl.html","js/libs/iscroll.js"],function(e,t,s,i,r,o){var c=i.View.extend({_template:s.template(o),initialize:function(){this.Show(),this.LoadItems(this.collection),e("#accessory-content").trigger("create")},LoadItems:function(t){this.GroupByCustomerName(t),e("#accessoryListContainer").listview(),this.myScroll?this.myScroll.refresh():this.myScroll=new iScroll("accessory-content",{hScroll:!1})},GroupByCustomerName:function(t){var i=t.pluck("ItemName"),o=s.groupBy(i,function(e){return e.charAt(0).toUpperCase()});for(var c in o)e("#accessoryListContainer").append("<li data-role='list-divider'>"+c.charAt(0)+"</li>"),t.each(function(t){var s=t.get("ItemName");s.charAt(0).toUpperCase()===c.toUpperCase()&&(this.accessoryview=new r({model:t}),e("#accessoryListContainer").append(this.accessoryview.render().el))})},Show:function(){this.$el.html(this._template)}});return c});