define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","view/19.2.0/pos/item/header-info/customer/customerform","text!template/19.2.0/pos/item/header-info/customer/customerdetail.tpl.html"],function(t,e,s,o,i,r,n,m){var d=o.View.extend({_template:s.template(m),events:{"tap #customer-edit":"buttonTapEdit"},buttonTapEdit:function(t){t.preventDefault(),console.log("edit customer"),i.EditCustomerLoaded=!1,this.InitializeCustomerForm()},initialize:function(){this.render()},InitializeCustomerForm:function(){t("#customer").remove(),t("#headerInfoContainer").append("<div id='FormContainer'></div>");var e=new n({el:t("#FormContainer"),FormType:"Edit Customer"});e.on("updatedCustomer",this.ProcessCustomer,this),e.on("formLoaded",this.EditCustomer,this),t("#main-transaction-blockoverlay").show()},render:function(){this.AssignFormattedName();var t="";r.IsNullOrWhiteSpace(this.model.get("Address"))||(t=this.model.get("Address"),t=t.substr(0,40)+"..."),this.model.set({DisplayAddress:t,OutstandingPoints:Math.round(this.model.attributes.OutstandingPoints)}),this.$el.html(this._template(this.model.toJSON())),this.$el.trigger("create")},AssignFormattedName:function(){var t=this.model.get("CustomerName"),e=r.Escapedhtml(t);t.length>40&&(e=r.Escapedhtml(t.substring(0,40))),this.model.set({FormattedCustomerName:e})},ProcessCustomer:function(t){this.trigger("ProcessCustomer",t)},EditCustomer:function(t){t&&t.EditCustomer(this.model)}});return d});