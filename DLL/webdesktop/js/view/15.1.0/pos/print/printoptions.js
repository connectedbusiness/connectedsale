define(["jquery","mobile","underscore","backbone","shared/global","text!template/15.1.0/pos/print/printoptions.tpl.html"],function(t,e,i,n,c,s){var o=n.View.extend({_template:i.template(s),events:{"tap .print-no-btn":"btnNo_tap","tap .print-yes-btn":"btnYes_tap","change input:checkbox":"checkbox_change","keyup #emailaddress-input":"inputEmailAddress_keyup"},initialize:function(){this.render()},render:function(){this.$el.html(this._template({CustomerEmail:this.GetEmailAddress()})),this.ToggleFields(),this.EnableDisableControls(),this.$("#printOptionsBody").trigger("create")},Close:function(){this.Hide(),t("#main-transaction-blockoverlay").hide()},Show:function(){this.render(),this.$el.show()},Hide:function(){this.$el.hide()},btnNo_tap:function(t){t.preventDefault(),this.RejectPrintOptions()},btnYes_tap:function(t){t.preventDefault(),this.AcceptPrintOptions()},GetEmailAddress:function(){return null!=this.TransactionToPrint?this.TransactionToPrint.get("DefaultContactEmail")||"":c.DefaultContactEmail||""},AcceptPrintOptions:function(){this.SetPrintOptions(),this.trigger("PrintReceipt",this.TransactionToPrint,!0,this)},RejectPrintOptions:function(){c.PreviousReprintValue=!1,this.trigger("PrintReceipt",this.TransactionToPrint,!1,this)},checkbox_change:function(){this.EnableDisableControls()},inputEmailAddress_keyup:function(t){13===t.keyCode&&(this.$("#emailaddress-input").blur(),this.AcceptPrintOptions())},SetPrintOptions:function(){c.PrintOptions.PrintReceipt=document.getElementById("print-checkbox").checked,c.PrintOptions.SilentPrint=document.getElementById("silent-checkbox").checked,c.PrintOptions.EmailReceipt=document.getElementById("email-checkbox").checked,c.PrintOptions.EmailAddress="",c.PrintOptions.EmailReceipt&&(c.PrintOptions.EmailAddress=this.$("#emailaddress-input").val())},SetTransactionToPrint:function(t){this.TransactionToPrint=t},ToggleFields:function(){document.getElementById("print-checkbox").checked=!0,document.getElementById("silent-checkbox").checked=c.Preference.AutoPrintReceipt,document.getElementById("email-checkbox").checked=c.Preference.AutoEmailReceipt},EnableDisableControls:function(){var t=document.getElementById("print-checkbox").checked;switch(t){case!0:this.$("#silent-checkbox").removeAttr("disabled");break;case!1:document.getElementById("silent-checkbox").checked=!1,this.$("#silent-checkbox").attr("disabled","disabled")}switch(t=document.getElementById("email-checkbox").checked){case!0:this.$("#emailaddress-input").removeAttr("readonly");break;case!1:this.$("#emailaddress-input").attr("readonly","readonly")}}});return o});