define(["jquery","mobile","underscore","backbone","collection/base","shared/global","shared/enum","shared/method","shared/shared","text!template/19.0.0/pos/kit/kitpreview.tpl.html"],function(e,t,i,s,o,l,r,n,d,h){return s.View.extend({template:i.template(h),tagName:"li",initialize:function(){this.$el.attr("data-icon",!1),this.model.set("Price",this.getPrice()),this.model.set("ImageLocation",this.showImage()),this.model.set("CurrencySymbol",l.CurrencySymbol),this.model.set("cid",this.model.cid),this.$el.html(this.template(this.model.attributes)),this.$el.attr("id",this.model.cid),this.groupType=this.options.groupType,this.groupCode=this.options.groupCode},events:{click:"select","tap span.kit-checkoption":"OptionChange"},render:function(){return this},select:function(t){t.preventDefault(),e(t.currentTarget).addClass("selected"),this.model.trigger("selected_option",this.model)},getPrice:function(){return this.model.get("Total")},removeSelected:function(){this.$el.removeClass("selected")},showImage:function(){return l.ServiceUrl+n.IMAGES+this.model.get("ItemCode")+".png?"+Math.random()},OptionChange:function(t){t.preventDefault();var s=this.$(t.currentTarget).hasClass("icon-check-empty"),l=t.currentTarget.id,r=!s;switch(this.groupType){case"Required":this.collection.each(function(e){e.get("GroupCode")==this.groupCode&&e.set({IsSelected:!1,IsDefault:!1})}.bind(this));var n=e("#kit-configurator-preview").find("ul").children();i.each(n,function(t){var i=e(t).find("span").attr("id");d.CustomCheckBoxChange("#"+i,!0)}),d.CustomCheckBoxChange("#"+l,!1),this.model.set({IsSelected:!0,IsDefault:!0});break;default:var h=this.model.get("GroupCode");this.groupCode==h&&(d.CustomCheckBoxChange("#"+l,r),this.model.set({IsSelected:s,IsDefault:s}))}var c=new o(this.collection.filter(function(e){return 1==e.get("IsSelected")&&e.get("GroupCode")==this.groupCode}.bind(this)));this.model.trigger("selected_item",c)},setSelected:function(e){var t=!1;t=this.model.get("IsSelected")&&this.model.get("IsDefault")?this.model.get("IsSelected"):this.model.get("IsSelected")?this.model.get("IsSelected"):this.model.get("IsDefault"),d.CustomCheckBoxChange("#chkOption-"+e,!t),this.model.set("IsSelected",t)}})});