define(["jquery","mobile","underscore","backbone","text!template/15.1.0/pos/coupon/couponitem.tpl.html"],function(e,t,n,i,o){var l=i.View.extend({_template:n.template(o),tagName:"li",events:{tap:"Selected"},render:function(){return this.ManageBinding(),this.$el.html(this._template(this.model.toJSON())),this},ManageBinding:function(){var e="";switch(this.model.get("DiscountType")){case"Amount":e=this.model.get("DiscountAmount");break;default:e=this.model.get("DiscountPercent")}this.model.set({DisplayDiscount:e},{silent:!0})},Selected:function(e){e.preventDefault(),this.model.select()}});return l});