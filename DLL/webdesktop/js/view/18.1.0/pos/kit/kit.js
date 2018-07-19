define(["jquery","mobile","underscore","backbone","shared/global","shared/enum","text!template/18.1.0/pos/kit/kit.tpl.html","shared/method"],function(e,t,i,l,s,r,o,d){return l.View.extend({template:i.template(o),tagName:"li",initialize:function(){this.$el.attr("data-icon",!1),this.model.set("Price",this.getPrice()),this.model.set("ImageLocation",this.showImage()),this.model.set("CurrencySymbol",s.CurrencySymbol),this.model.set("cid",this.model.cid),this.$el.html(this.template(this.model.attributes)),this.$el.attr("id",this.model.cid)},events:{click:"select"},render:function(){return this},select:function(t){t.preventDefault();var i=this.$el.hasClass("selected");i||(this.model.trigger("resetSelected"),e(t.currentTarget).addClass("selected"),this.model.trigger("selected_option",this.model))},getPrice:function(){return"number"==typeof this.model.get("Price")?this.model.get("Price"):0},removeSelected:function(){this.$el.removeClass("selected")},showImage:function(){return s.ServiceUrl+d.IMAGES+this.model.get("ItemKitCode")+".png?"+Math.random()},setSelectedPrice:function(e){var t=e.reduce(function(e,t){return e+t.get("Total")},0);this.$el.find("#item-price-"+this.model.cid).find("#h5-"+this.model.cid).html(s.CurrencySymbol+" "+t)}})});