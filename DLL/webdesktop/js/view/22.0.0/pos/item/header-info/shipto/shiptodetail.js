define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","view/19.0.0/pos/item/header-info/shipto/shiptoform","text!template/19.0.0/pos/item/header-info/shipto/shiptodetail.tpl.html"],function(e,t,i,o,s,h,r,d){var n=o.View.extend({_template:i.template(d),events:{"tap #editShipto":"buttonTapEdit"},buttonTapEdit:function(e){e.preventDefault(),s.EditShipToLoaded=!1,this.InitializeShipToForm()},initialize:function(){this.render()},render:function(){var e=this.model.get("ShipToName"),t="";h.IsNullOrWhiteSpace(this.model.get("Address"))||(t=this.model.get("Address"),t=t.substr(0,40)+"..."),this.model.set({DisplayAddress:t,FormattedShipToName:h.Escapedhtml(e)}),this.$el.html(this._template(this.model.toJSON())),this.$el.trigger("create")},InitializeShipToForm:function(){e("#shipto").remove(),e("#headerInfoContainer").append("<div id='FormContainer'></div>");var t=new r({el:e("#FormContainer"),FormType:"Edit Ship To"});t.on("updatedShipto",this.ProcessShipTo,this),t.on("formLoaded",this.EditShipTo,this),e("#main-transaction-blockoverlay").show()},ProcessShipTo:function(e){this.trigger("ProcessShipTo",e)},EditShipTo:function(e){e&&e.EditShipTo(this.model)}});return n});