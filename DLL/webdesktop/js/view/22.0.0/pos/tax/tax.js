define(["jquery","mobile","underscore","backbone","shared/global","text!template/22.0.0/pos/tax/tax.tpl.html"],function(e,t,i,l,s,d){return l.View.extend({template:i.template(d),tagName:"li",isSelected:!1,initialize:function(){this.$el.html(this.template(this.model.attributes)),this.$el.attr("id",this.model.cid),this.$el.attr("data-icon",!1),this.$el.find(".chk").hide();var e=window.sessionStorage.getItem("selected_taxcode");e=null===e?s.ShipTo.TaxCode:e,e===this.model.get("TaxCode")&&(this.isSelected=!0,this.$el.find(".chk").show())},render:function(){return this},events:{click:"selected"},selected:function(e){e.preventDefault(),this.model.trigger("selected",this.model),this.$el.parent().find(".chk").hide(),this.$el.find(".chk").show()}})});