define(["jquery","mobile","underscore","backbone","shared/global","shared/service","collection/base","shared/shared","shared/method","shared/enum","text!template/20.0.0/pos/promotion/promotionlist.tpl.html"],function(e,t,o,n,i,c,s,l,h,a,r){var d=n.View.extend({template:o.template(r),tagName:"li",initialize:function(e){this.model.set("cid",this.model.cid),this.$el.attr("id",this.model.cid),this.model.set("CurrencySymbol",i.CurrencySymbol),this.model.set("ImageLocation",this.showImage()),this.$el.html(this.template(this.model.attributes))},events:{click:"select","tap span.promo-checkoption":"OptionChange"},select:function(t){t.preventDefault(),e(t.currentTarget).addClass("selected")},removeSelected:function(){this.$el.removeClass("selected")},render:function(){return this},showImage:function(){return i.ServiceUrl+h.IMAGES+this.model.get("ItemCode")+".png?"+Math.random()},OptionChange:function(e){var t=this;e.preventDefault();var o=this.$(e.currentTarget).hasClass("icon-check-empty"),n=e.currentTarget.id,i=!o,c=new s(t.collection.filter(function(e){return 1==e.get("IsSelected")}.bind(this)));c.each(function(e){e.get("RuleID")!=t.model.get("RuleID")&&(e.set("IsSelected",!1),l.CustomCheckBoxChange("#chkOption-"+e.cid,!0))}),"ALL"==t.model.get("GetType")?t.collection.each(function(e){e.get("RuleID")==t.model.get("RuleID")&&(e.set("IsSelected",o),l.CustomCheckBoxChange("#chkOption-"+e.cid,i))}.bind(this)):(t.model.set("IsSelected",o),l.CustomCheckBoxChange("#"+n,i)),t.collection.each(function(e){0==e.get("IsSelected")&&l.CustomCheckBoxChange("#chkOption-"+e.cid,!0)})},setSelected:function(e){var t=!1;t=!!this.model.get("IsSelected"),l.CustomCheckBoxChange("#chkOption-"+e,!t),this.model.set("IsSelected",t)}});return d});