define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","model/base","collection/base","view/15.1.0/settings/payment/confirmpassword","text!template/15.1.0/settings/payment/payment.tpl.html"],function(e,t,i,n,r,a,s,o,c,d,l){var h=n.View.extend({_template:i.template(l),events:{"focus #merchantpassword":"merchantPassword_Focus","change #merchantlogin":"merchantLogin_Change","change #carddevicetype":"selectDeviceType_change"},isPreferenceSaved:!1,isPaymentGatewaySaved:!1,merchantLogin_Change:function(e){e.preventDefault(),this.HasChanges=!0},merchantPassword_Focus:function(e){e.preventDefault(),this.ShowConfirmPassword()},selectDeviceType_change:function(e){e.preventDefault();var t=this.$("#carddevicetype option:selected").val();this.preferenceCollection.at(0).set({CardDeviceType:t})},initialize:function(){this.render()},render:function(){this.FetchCreditCard()},ChangePassword:function(e){this.newMerchantPassword=e,this.HasChanges=!0,this.Save()},ConfirmPasswordViewClosed:function(){e("#settings-blockoverlay").hide()},FetchCreditCard:function(){var e=this;this.InitializeCreditCard(),this.paymentGatewayModel.set({AssemblyName:"Interprise.Presentation.Customer.PaymentGateway.ITGPIv2",Gateway:"Interprise.Presentation.Customer.PaymentGateway.ITGPIv2.InterpriseGatewayControl",MerchantLogin:"",IsEncrypted:!0,AllowSale:!0,IsVault:!0,PasswordPlaceholder:""}),this.paymentGatewayModel.url=r.ServiceUrl+a.POS+s.GETCREDITCARDGATEWAY,this.paymentGatewayModel.save(null,{success:function(t,i,n){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.InitializeDisplay()},error:function(e,t,i){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(error,"Error Retrieving Payment Gateway Settings")}})},FetchPreference:function(){var e=this;this.InitializePreference(),this.preferenceCollection.url=r.ServiceUrl+a.POS+s.GETPREFERENCEBYWORKSTATION+r.POSWorkstationID,this.preferenceCollection.fetch({success:function(t,i){e.ResetPreferenceCollection(i.Preference)},error:function(e,t,i){}})},HasDeviceChanges:function(){return this.preferenceCollection.at(0).get("CardDeviceType")!=this.preferenceCollection.at(0).previous("CardDeviceType")},HasPassword:function(){return null!=this.paymentGatewayModel&&null!=this.paymentGatewayModel.get("MerchantPassword")&&""!=this.paymentGatewayModel.get("MerchantPassword")},InitializeDisplay:function(){this.HasPassword()&&this.paymentGatewayModel.set({PasswordPlaceholder:"***********"}),this.$el.html(this._template(this.paymentGatewayModel.toJSON())),this.$("#settings-creditcard").trigger("create"),this.HasChanges=!1},InitializeCreditCard:function(){this.paymentGatewayModel||(this.paymentGatewayModel=new o)},InitializePreference:function(){this.preferenceCollection||(this.preferenceCollection=new c)},LoadCardDeviceType:function(){var e=this.preferenceCollection.at(0).get("CardDeviceType");this.$("#carddevicetype-container").show(),this.$("#carddevicetype-container > div.ui-select").attr("style","width:35%;"),this.$("#carddevicetype option[value='"+e+"']").attr("selected",!0),this.$("#carddevicetype").selectmenu("refresh",!0)},ResetPreferenceCollection:function(e){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.preferenceCollection.reset(e),this.FetchCreditCard()},Save:function(){if(this.paymentGatewayModel){if(0==this.HasChanges)return void this.SaveCompleted();var e=this,t=this.$("#merchantlogin").val(),i="",n=!1;null!=this.newMerchantPassword&&(i=this.newMerchantPassword,n=!0),this.paymentGatewayModel.set({MerchantLogin:t,ChangePassword:n,NewMerchantPassword:i,IsEncrypted:!0,AllowSale:!0,IsVault:!0}),this.paymentGatewayModel.url=r.ServiceUrl+a.POS+"updatecreditcardgateway/",this.paymentGatewayModel.save(null,{success:function(t,i){e.SaveCompleted(),e.isPaymentGatewaySaved=!0,this.HasChanges=!1},error:function(e,t,i){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Updating Payment Gateway Settings"),this.HasChanges=!1}})}},SaveCompleted:function(){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.isPreferenceSaved=!1,this.isPaymentGatewaySaved=!1,this.trigger("SaveCompleted",this)},ShowConfirmPassword:function(){if(e("#settings-blockoverlay").show(),!t){var t=new d({el:e("#confirmPasswordContainer")});t.on("passwordChanged",this.ChangePassword,this),t.on("closed",this.ConfirmPasswordViewClosed,this)}t.Show(this.HasPassword())},UpdatePreference:function(){if(!this.HasDeviceChanges()){var e=this,t=new o;t.set({Preference:this.preferenceCollection.at(0)}),t.url=r.ServiceUrl+a.POS+s.UPDATEPREFERENCE,t.save(null,{success:function(t,i){e.SaveCompleted()},error:function(e,t,i){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Saving Workstation Preference")}})}}});return h});