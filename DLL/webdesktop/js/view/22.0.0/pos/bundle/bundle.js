define(["jquery","mobile","underscore","backbone","shared/global","shared/enum","text!template/22.0.0/pos/bundle/bundle.tpl.html"],function(e,t,i,r,l,s,o){return r.View.extend({template:i.template(o),tagName:"li",initialize:function(){this.$el.attr("data-icon",!1),this.model.set("Price",this.getPrice()),this.$el.html(this.template(this.model.attributes)),this.$el.attr("id",this.model.cid)},events:{click:"select"},render:function(){return this},select:function(t){t.preventDefault(),this.model.trigger("resetSelected"),e(t.currentTarget).addClass("selected"),this.model.get("ItemType")===s.ItemType.MatrixGroup?this.model.trigger("selected_matrix",this.model):this.model.trigger("selected_stock",this.model)},getPrice:function(){var e=l.CurrentCustomer.DefaultPrice?l.CurrentCustomer.DefaultPrice:l.Preference.CustomerDefaultPrice;return"Retail"===e?l.CurrencySymbol+this.model.get("RetailPrice").toFixed(2):l.CurrencySymbol+this.model.get("WholeSalePrice").toFixed(2)},removeSelected:function(){this.$el.removeClass("selected")}})});