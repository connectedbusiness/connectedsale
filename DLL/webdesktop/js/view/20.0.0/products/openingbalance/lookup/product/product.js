define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","text!template/20.0.0/products/openingbalance/lookup/product/product.tpl.html"],function(e,t,i,l,s,r,n){var o=l.View.extend({_template:i.template(n),tagName:"li",events:{tap:"Add","tap #add-lookup":"Selected"},render:function(){return this.CheckDefaultPrice(this.model),this.SetDescription(this.model),this.model.set({CurrencySymbol:s.CurrencySymbol}),this.$el.html(this._template(this.model.toJSON())),this},SetDescription:function(e){var t=50,i=r.Escapedhtml(e.get("ItemName")),l=r.Escapedhtml(e.get("ItemDescription")),s="<br>";if(l.length>t){var n=l.substr(0,t-1),o=l.substr(t-1,l.length-1);o.length>t&&(o=l.substr(t-1,t-1)+"..."),l=n+s+o,s=""}this.model.set({ItemDescription:l,ItemName:i},{silent:!0})},CheckDefaultPrice:function(e){var t=e.get("RetailPrice");e.set({Price:t.toFixed(2)},{silent:!0})},Selected:function(e){e.stopPropagation(),this.model.select()},Add:function(e){e.preventDefault(),this.model.select()}});return o});