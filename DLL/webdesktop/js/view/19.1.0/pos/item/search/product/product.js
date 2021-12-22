define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","text!template/19.1.0/pos/item/search/product/product.tpl.html"],function(e,t,i,o,s,n,l){var r=o.View.extend({_template:i.template(l),tagName:"li",events:{tap:"Add","tap #add-lookup":"Selected"},render:function(){return this.CheckDefaultPrice(this.model),this.RoundOffUnitsInStock(this.model),this.SetDescription(this.model),this.model.set({CurrencySymbol:s.CurrencySymbol}),this.$el.html(this._template(this.model.toJSON())),this},SetDescription:function(e){var t=e.get("ItemDescription"),i=e.get("ItemName");i=n.Escapedhtml(i),t=n.Escapedhtml(t),e.set({ItemDescription:t,ItemName:i,CategoryCode:n.Escapedhtml(e.get("CategoryCode")||""),CategoryDescription:n.Escapedhtml(e.get("CategoryDescription")||"")},{silent:!0})},RoundOffUnitsInStock:function(e){var t=e.get("UnitsInStock"),i=t.toString().split(".");t=i[1]>0?t.toFixed(2):parseFloat(t),e.set({UnitsInStock:t},{silent:!0})},CheckDefaultPrice:function(e){var t=e.get("RetailPrice"),i=e.get("WholesalePrice");switch(s.DefaultPrice){case"Retail":e.set({Price:t.toFixed(2)},{silent:!0});break;case"Wholesale":e.set({Price:i.toFixed(2)},{silent:!0})}s.DefaultPrice||e.set({Price:t.toFixed(2)},{silent:!0})},Selected:function(e){e.stopPropagation(),this.model.select()},Add:function(e){e.preventDefault(),this.model.add()}});return r});