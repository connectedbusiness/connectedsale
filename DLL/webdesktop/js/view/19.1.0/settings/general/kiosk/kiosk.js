define(["jquery","mobile","underscore","shared/global","backbone","text!template/19.1.0/settings/general/kiosk/kiosk.tpl.html"],function(e,t,i,a,r,s){var d=r.View.extend({_template:i.template(s),events:{"change #radio-Order-Kiosk":"radioOrder_changed","change #radio-Sale-Kiosk":"radioSale_changed"},radioOrder_changed:function(e){this.defaultTransaction=0,this.trigger("selected",this),this.SetSelected()},radioSale_changed:function(e){this.defaultTransaction=1,this.trigger("selected",this),this.SetSelected()},initialize:function(){this.render()},ResetSelected:function(){e("#radio-Order-Kiosk").attr("checked",!1).checkboxradio("refresh"),e("#radio-Sale-Kiosk").attr("checked",!1).checkboxradio("refresh")},SetSelected:function(){switch(this.ResetSelected(),this.defaultTransaction){case 0:e("#radio-Order-Kiosk").attr("checked",!0).checkboxradio("refresh");break;case 1:e("#radio-Sale-Kiosk").attr("checked",!0).checkboxradio("refresh")}},render:function(){e("#back-general").show(),this.$el.html(this._template),this.$el.trigger("create"),this.DisableOption(),this.defaultTransaction=this.model.get("KioskDefaultTransaction"),this.SetSelected()},DisableOption:function(){a.Preference.AllowSales===!1&&this.$("#div-Sale-Kiosk").addClass("ui-disabled"),a.Preference.AllowOrders===!1&&this.$("#div-Order-Kiosk").addClass("ui-disabled")}});return d});