define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/enum","shared/shared","model/base","text!template/19.2.0/pos/payment/gift.tpl.html","view/spinner"],function(t,i,e,s,a,n,r,l,d,o,h,f){var u={PinHeader:".container-headerPIN ",PinBody:".giftPINDetails ",PinEntry:".container-giftEPIN ",PinConfirm:".container-giftCPIN ",InputPINE:"#giftEPIN ",InputPINC:"#giftCPIN ",InputTotal:"#giftTotal ",InputAvailable:"#giftAvailable ",InputSerial:"#giftSerial ",InputApply:"#giftApply ",Message:".giftMessage i ",PINDetails:".giftPINDetails ",Verify:"#btnVerify  "},c=s.View.extend({_template:e.template(h),events:{"change #giftSerial":"txtSerial_change","change #giftEPIN":"txtEPIN_change","keypress #giftEPIN":"txtEPIN_keypress","change #giftCPIN":"txtCPIN_change","tap #btnVerify":"btnVerify_tap","change #giftApply":"txtApply_change","tap #ask-pin-btn":"AskPIN_tapped","tap #stop-asking-btn":"StopAsking_tapped"},initialize:function(){this.ResetAll(),this.render(),d.Focus(u.InputSerial)},render:function(){return a.ViewRecipient="Payment",this.$el.html(this._template),this.$el.css("width","385px"),this.$el.find("input").css("float","right"),this.$el.find("input").css("margin-bottom","5px"),this.$el.find("label").css("float","left"),this.ToggleDetails(),this.DisplayCredit(!0),this.$el},AskPIN_tapped:function(i){i.preventDefault(),t(".ask-pin-btn").attr("id","stop-asking-btn"),t("#giftEPIN").trigger("focusout"),t("#giftCPIN").trigger("focusout"),t("#giftEPIN").trigger("blur"),t("#giftCPIN").trigger("blur"),t("#giftEPIN").attr("readonly","readonly"),t("#giftEPIN").addClass("ui-disabled"),t("#giftCPIN").attr("readonly","readonly"),t("#giftCPIN").addClass("ui-disabled"),g();var e=this.GetFormType();this.trigger("askToEnterPIN",e,this)},StopAsking_tapped:function(t){t.preventDefault(),this.$(".ask-pin-btn").attr("id","ask-pin-btn"),p(),this.trigger("stopAskingPIN","Recharge",this)},GetFormType:function(){return this.IsActivated&&this.HasPin?"PIN":this.IsActivated&&!this.HasPin?"New PIN":"Activate"},PopulatePINFields:function(i){if(i||(i=a.PIN),t(u.InputPINE).val(i).change(),t(u.InputPINC).val(i).change(),p(),this.HasPin&&this.IsActivated){if(""==this.$el.find(u.InputPINE).val())return;this.txtEPIN_change(),this.VerifyPIN()}},txtSerial_change:function(t){t.preventDefault(),this.ValidateSerial()},txtEPIN_change:function(t){this.gift&&""!=this.$el.find(u.InputPINE)&&(this.IsActivated?this.HasPin?this.Message("Press OK to verify PIN."):this.Message("Please Enter PIN."):this.Message("Please Re-Enter PIN to Confirm."),this.$el.find(u.InputPINC).val(""),this.gift.set({PIN:Base64.encode(this.$el.find(u.InputPINE).val())}),this.EnableKeypadDone(!1))},txtEPIN_keypress:function(t){if(13===t.keyCode&&this.IsCard&&this.IsActivated&&this.HasPin){if(""==this.$el.find(u.InputPINE).val())return;this.txtEPIN_change(),this.VerifyPIN()}},txtCPIN_change:function(t){this.CheckPIN(),this.EnableKeypadDone(!1)},btnVerify_tap:function(t){t.preventDefault(),this.IsWaiting()||(this.IsActivated&&this.HasPin?this.VerifyPIN():this.ActivateGift())},txtApply_change:function(t){if(""!=this.$el.find(u.InputApply).val())return this.$el.find(u.InputApply).val()>this.credit.get("CreditAvailableRate")?(this.Message("Maximum amount allowed is "+a.CurrencySymbol+" "+this.credit.get("CreditAvailableRate").toFixed(2)+".","red"),this.$el.find(u.InputApply).val(""),void this.$el.find(u.Message).fadeOut()):void this.credit.set({AmountToUse:this.$el.find(u.InputApply).val()})},ResetAll:function(t){this.IsCard=!1,this.HasPin=!1,this.IsActivated=!1,this.IsPinOK=!1,this.Verified=!1,this.AvailableCredit=0,this.gift=new o,this.credit=new o,this.$el.find(u.InputPINE).val(""),this.$el.find(u.InputPINC).val(""),this.DisplayCredit(!0),this.ToggleDetails()},CheckPIN:function(){return!!this.gift&&(this.HasPin||""==this.$el.find(u.InputPINE)||this.$el.find(u.InputPINE).val()==this.$el.find(u.InputPINC).val()?(this.Message("Press OK to Activate Card."),!0):(this.Message("Activation PIN does not match.","red"),!1))},Show:function(){this.$el.show(),this.render(),d.Focus(u.InputSerial),gift-card-input},Close:function(){},ToggleDetails:function(){this.IsCard?(this.EnableKeypadDone(this.Verified),this.$el.find(u.PinBody).show(),this.IsActivated&&this.HasPin?(this.$(u.PinHeader).hide(),this.$(u.PinEntry).show(),this.$(u.PinConfirm).hide(),this.$(u.PINDetails).removeClass("giftPINDetails-activate")):(this.$(u.PinHeader).show(),this.$(u.PinEntry).show(),this.$(u.PinConfirm).show(),this.$(u.PINDetails).addClass("giftPINDetails-activate")),d.Focus(u.InputPINE)):(this.$(u.PinHeader).hide(),this.$(u.PinBody).hide(),this.EnableKeypadDone(this.gift&&this.gift.get("SerialLotNumber")))},EnableKeypadDone:function(t){t?(this.$("#keypad-done-btn").removeClass("ui-disabled"),this.$(u.InputPINE).addClass("ui-disabled"),this.$(u.InputPINE).attr("readonly","readonly"),this.$(u.Verify).addClass("ui-disabled"),this.$("#ask-pin-btn").addClass("ui-disabled")):(this.$("#keypad-done-btn").addClass("ui-disabled"),this.$(u.InputPINE).removeClass("ui-disabled"),this.$(u.InputPINE).removeAttr("readonly"),this.$(u.Verify).removeClass("ui-disabled"),this.$("#ask-pin-btn").removeClass("ui-disabled"),this.Verified=!1)},Hide:function(){t("#main-transaction-blockoverlay").hide(),this.$el.html(""),this.$el.hide()},Message:function(t,i,e){t||(t=""),i||(i="black"),this.$el.find(u.Message).hide(),this.$el.find(u.Message).html(t),this.$el.find(u.Message).css("color",i),e?this.$el.find(u.Message).show():this.$el.find(u.Message).fadeIn()},ValidateSerial:function(){this.ResetAll();var t=this.$el.find(u.InputSerial).val();if(t&&""!=t){this.Message("Validating Serial Number...",null,!0);var i=this;this.gift=new o,this.gift.set({SerialLotNumber:t}),this.gift.url=a.ServiceUrl+n.SOP+r.GETGIFTDETAILBYSERIAL,this.gift.save(this.gift,{success:function(t,e){i.ValidateSerialSuccess(e)},error:function(t,e,s){i.ValidateSerialError(e,s)}})}},ValidateSerialSuccess:function(t){this.$el.find(u.InputPINE).val(""),this.$el.find(u.InputPINC).val(""),this.DisplayCredit(!0),t?t.IsReturned?(this.ResetAll(),this.Message(t.ItemType+" already been returned.","red")):(this.IsActivated=t.IsActivated||!1,t.PIN&&""!=t.PIN?this.HasPin=!0:this.HasPin=!1,"Gift Card"==t.ItemType?(this.IsCard=!0,this.LoadGiftDetails(),this.Message("Please Enter the PIN.")):(this.IsCard=!1,this.LoadGiftDetails(),this.Message("Enter Amount to Use.")),this.ToggleDetails()):(this.ResetAll(),this.Message("Serial Number does not exist.","red"))},ValidateSerialError:function(t,i){this.Message("Unable to validate serial number.","red"),this.ResetAll()},LoadGiftDetails:function(){var t=this;this.credit=new o,this.credit.set(t.gift.attributes),this.credit.url=a.ServiceUrl+n.SOP+r.GETGIFTCREDITS,this.credit.save(this.credit,{success:function(i,e){t.LoadGiftDetailsSuccess(e)},error:function(i,e,s){t.LoadGiftDetailsError(e,s)}})},LoadGiftDetailsSuccess:function(t){return t?this.IsActivated&&t.CustomerCode!=a.CustomerCode?(this.Message("Gift Certificate/Card does not belong to current customer.","red"),void this.ResetAll()):(this.credit=new o,this.credit.set(t),void(this.IsCard||this.DisplayCredit())):(this.ResetAll(),void this.Message("Unable to load credits.","red"))},LoadGiftDetailsError:function(t,i){this.ResetAll(),this.Message("Unable to load credits.","red")},SetCreditsAvailable:function(t,i){this.$el.find(u.InputAvailable).val(a.CurrencySymbol+" "+t.toFixed(2)),this.$el.find(u.InputTotal).val(a.CurrencySymbol+" "+i.toFixed(2)),this.trigger("changeKeypadAmount",t)},formatAmount:function(t){var i=t.replace(",",""),e=i.replace(",",""),s=format("#,##0.00",e.replace(",",""));return s},DisplayCredit:function(t){if(t)return void this.SetCreditsAvailable(0,0);var i=this.credit.get("CreditAvailableRate")||0,e=this.credit.get("TotalRate")||0;this.SetCreditsAvailable(i,e),this.TriggerEvents("GiftVerified",this.credit)},ActivateGift:function(t,i,e){if(this.CheckPIN()||!this.IsCard){var s=this,r=new o;r.set(this.gift.attributes);var l=!1;this.IsCard&&!this.HasPin&&(l=!0);var d=this.gift.get("CreditCode");r.set({SetPIN:l,CustomerCode:a.CustomerCode,CreditCode:d}),r.url=a.ServiceUrl+n.SOP+"activategift/",r.save(r,{success:function(a,n){return n&&n.ErrorMessage&&""!=n.ErrorMessage?(navigator.notification.alert(n.ErrorMessage,null,"Activation Error","OK"),void s.DisplayCredit(!0)):(s.$("input").blur(),s.IsActivated=!0,s.IsPinOK=!0,s.HasPin=!0,s.Verified=!0,s.EnableKeypadDone(!0),s.ToggleDetails(),s.Message("Gift Card/Certificate Activated!"),void(t&&i?t[i].apply(t,e):s.DisplayCredit()))},error:function(t,i,e){navigator.notification.alert("An error was encountered when trying to Activate Gift Card/Certificate.",null,"Activation Error","OK"),s.Message("Gift Card/Certificate Activation Error!","red"),s.DisplayCredit(!0)}})}},VerifyPIN:function(){this.$("input").blur();var t=this,i=new o;i.set(this.gift.attributes),i.url=a.ServiceUrl+n.SOP+"validategiftpin/",i.save(i,{success:function(i,e){return e&&e.ErrorMessage&&""!=e.ErrorMessage?(navigator.notification.alert(e.ErrorMessage,null,"PIN Error","OK"),void t.DisplayCredit(!0)):(t.IsPinOK=e.Value||!1,void(t.IsPinOK?(t.Verified=!0,t.Message("Gift Card Verified!"),t.EnableKeypadDone(!0),t.DisplayCredit()):(t.Message("Invalid PIN. Please try again.","red"),t.DisplayCredit(!0))))},error:function(i,e,s){navigator.notification.alert("An error was encountered when trying to verify PIN.",null,"PIN Error","OK"),t.Message("Gift Card PIN Verification Error!","red"),t.DisplayCredit(!0)}})},ValidateGift:function(t,i,e,s){if(!this.gift||!this.credit)return!1;if(this.IsCard&&!this.Verified)return navigator.notification.alert("Gift Card is not yet Verified.",null,"Gift Card","OK"),!1;var n=this.credit.get("CreditAvailableRate")||0;if(n<=0)return navigator.notification.alert("Gift Card/Certificate Does not have credit available.",null,"Credit Check","OK"),!1;if(n<t)return navigator.notification.alert("Maximum amount allowed is "+a.CurrencySymbol+" "+n.toFixed(2)+".",null,"Credit Check","OK"),!1;return!(!this.IsActivated&&!this.IsCard)||(this.ActivateGift(i,e,s),!1)},TriggerEvents:function(t,i){this.trigger(t,i)},IsWaiting:function(){var i=t(u.InputSerial).hasClass("ui-disabled");return i&&navigator.notification.alert("Waiting for the customer to enter pin.",null,"Invalid Action","OK"),i}}),g=function(){var i=document.getElementById("stop-asking-btn");_spinner=f,_spinner.opts.left=10,_spinner.opts.radius=3,_spinner.opts.lines=9,_spinner.opts.length=4,_spinner.opts.width=3,_spinner.opts.color="#000",_spinner.spin(i,"Cancel"),t("#stop-asking-btn .ui-btn-text").text("Cancel"),t(".ask-pin-btn").css("text-align","center"),t("#giftSerial").addClass("ui-disabled"),t("#giftSerial").attr("readonly","readonly")},I=function(){_spinner=f,_spinner.stop()},p=function(){t(".ask-pin-btn").attr("id","ask-pin-btn"),t(".ask-pin-btn .ui-btn-text").text("Allow User To Enter Pin"),t(".ask-pin-btn").css("text-align","center"),I(),t("#giftEPIN").removeClass("ui-disabled"),t("#giftCPIN").removeClass("ui-disabled"),t("#giftSerial").removeClass("ui-disabled"),t("#giftSerial").removeAttr("readonly","readonly"),t("#giftEPIN").removeAttr("readonly","readonly"),t("#giftCPIN").removeAttr("readonly","readonly")};return c});