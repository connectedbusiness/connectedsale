define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","text!template/16.0.0/products/receivestocks/lookup/product.tpl.html"],function(e,t,i,s,l,n,o){var r=s.View.extend({_template:i.template(o),tagName:"li",events:{tap:"Add","tap #add-lookup":"Selected"},render:function(){return this.CheckDefaultPrice(this.model),this.RoundOffUnitsInStock(this.model),this.SetDescription(this.model),this.model.set({CurrencySymbol:l.CurrencySymbol}),this.$el.html(this._template(this.model.toJSON())),this},SetDescription:function(e){var t=38,i=e.get("ItemDescription"),s=e.get("ItemName"),l="<br>";if(i.length>t){var o=i.substr(0,t-1),r=i.substr(t-1,i.length-1);r.length>t&&(r=i.substr(t-1,t-1)+"..."),i=n.Escapedhtml(o)+l+n.Escapedhtml(r),l=""}else i=n.Escapedhtml(i);s=n.Escapedhtml(s),e.set({ItemDescriptionDisplay:i,ItemNameDisplay:s},{silent:!0})},RoundOffUnitsInStock:function(e){var t=e.get("UnitsInStock"),i=t.toString().split(".");t=i[1]>0?t.toFixed(2):parseFloat(t),e.set({UnitsInStock:t},{silent:!0})},CheckDefaultPrice:function(e){var t=e.get("RetailPrice"),i=e.get("WholesalePrice");switch(l.DefaultPrice){case"Retail":e.set({Price:t.toFixed(2)},{silent:!0});break;case"Wholesale":e.set({Price:i.toFixed(2)},{silent:!0})}l.DefaultPrice||e.set({Price:t.toFixed(2)},{silent:!0})},Selected:function(e){e.stopPropagation(),this.model.select()},Add:function(e){e.preventDefault(),this.model.add()}});return r});