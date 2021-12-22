define(["jquery","mobile","underscore","backbone","shared/global","shared/enum","shared/shared","text!template/19.1.0/pos/item/header-info/salesrep/salesrepdetail.tpl.html"],function(e,t,i,s,n,o,l,r){return s.View.extend({template:i.template(r),tagName:"li",events:{"tap span.salesrep-checkoption":"OptionChange","click .salesrep-commission":"ToggleEvents","change #changeCommission-input":"ChangeCommissionInput"},initialize:function(){this.model.on("check",this.SetSelected,this),this.isSameSalesRepCodeWithCustomer(),this.model.set("cid",this.model.cid),this.$el.html(this.template(this.model.attributes)),this.$el.attr("data-icon",!1),this.$el.attr("id",this.model.cid),l.Input.Integer(this.$el.find("#changeCommission-input")),this.commissionInput=this.$el.find("#changeCommission-input"),this.CommissionDisplay=this.$el.find("#commission-display")},render:function(){return this},isSameSalesRepCodeWithCustomer:function(){if(null==n.CurrentCustomer.CurrentSalesRep){var e="";if(null==n.SalesRepList||l.IsNullOrWhiteSpace(n.SalesRepList)){if(e=n.IsOverrideSalesRep?n.SalesRepGroupCode:null==n.CurrentCustomer.SalesRepCode?n.CurrentCustomer.SalesRepGroupCode:n.CurrentCustomer.SalesRepCode,e==this.model.get("SalesRepGroupCode"))return this.model.set("RepSplit",100),!0;this.model.set("RepSplit",0)}else{var t=i.find(n.SalesRepList,function(e){return e.SalesRepGroupCode==this.model.get("SalesRepGroupCode")}.bind(this));if(null!=t)return this.model.set("RepSplit",t.RepSplit),!0;this.model.set("RepSplit",0)}}else{var t=i.find(n.CurrentCustomer.CurrentSalesRep,function(e){return e.get("SalesRepGroupCode")==this.model.get("SalesRepGroupCode")}.bind(this));if(null!=t)return this.model.set("RepSplit",t.get("RepSplit")),!0;this.model.set("RepSplit",0)}},OptionChange:function(e){e.preventDefault();var t=this.$(e.currentTarget).hasClass("icon-check-empty"),i=e.currentTarget.id,s=!t;l.CustomCheckBoxChange("#"+i,s),s?this.model.trigger("unselected",this.model):this.model.trigger("selected",this.model)},SetSelected:function(e){var t=this.isSameSalesRepCodeWithCustomer();l.CustomCheckBoxChange("#chkOption-"+e,!t),t&&this.model.trigger("selected",this.model)},ToggleEvents:function(e){e.preventDefault(),this.commissionInput.is(":hidden")&&(this.commissionInput.show().focus(),this.CommissionDisplay.hide(),this.trigger("onEditMode",this.$el.attr("id")))},ChangeCommissionInput:function(e){e.preventDefault();var t=e.currentTarget.value;this.commissionInput.hide(),this.CommissionDisplay.show(),this.$el.find("h5").html(t+"%"),this.model.set("RepSplit",t)},ResetCommissionInput:function(e){e.preventDefault(),e.currentTarget.value=""}})});