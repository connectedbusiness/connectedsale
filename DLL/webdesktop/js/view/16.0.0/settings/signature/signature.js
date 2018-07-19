define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","collection/preferences","text!template/16.0.0/settings/signature/signature.tpl.html","js/libs/ui.checkswitch.min.js"],function(e,r,i,t,n,c,a,u,o){var s=t.View.extend({_template:i.template(o),events:{"tap #RequireSignatureOnCheck, #RequireSignatureOnCreditCard, #RequireSignatureOnOpenAccount, #RequireSignatureOnOrder":"Chkbox_click"},initialize:function(){this.render()},render:function(){this.FetchPreference()},InitializeDisplay:function(){this.preferenceCollection.at(0).set({AllowCouponSearch:n.Preference.AllowCouponSearch}),this.$el.html(this._template(this.preferenceCollection.at(0).toJSON())),this.ToggleCheckboxes(),this.$("#settings-signature").trigger("create")},InitializePreferences:function(){this.preferences||(this.preferences=new u)},InitializePreferenceCollection:function(){this.preferenceCollection||(this.preferenceCollection=new u)},FetchPreference:function(){var e=this;this.InitializePreferences(),this.InitializePreferenceCollection(),this.preferences.url=n.ServiceUrl+c.POS+a.GETPREFERENCEBYWORKSTATION+n.POSWorkstationID,this.preferences.fetch({success:function(r,i){e.ResetPreferenceCollection(i.Preference)},error:function(e,r,i){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(r,"Error Retrieving Workstation Preference")}})},Chkbox_click:function(e){e.preventDefault();var r="#"+e.currentTarget.id,i=this.GetCheckState(r);this.SetChkState(e.currentTarget.id,!i)},GetCheckState:function(r){return!!e(r).hasClass("icon-ok-sign")},ToggleCheckbox:function(r,i){i?(e("#"+r).addClass("icon-ok-sign").css("color",""),e("#"+r).removeClass("icon-circle-blank")):(e("#"+r).addClass("icon-circle-blank").css("color","#DADADA"),e("#"+r).removeClass("icon-ok-sign"))},SetChkState:function(e,r){var i=this;switch(e){case"RequireSignatureOnCheck":i.requireSignatureOnCheck=r;break;case"RequireSignatureOnCreditCard":i.requireSignatureOnCreditCard=r;break;case"RequireSignatureOnOpenAccount":i.requireSignatureOnOpenAccount=r;break;case"RequireSignatureOnOrder":i.requireSignatureOnOrder=r}i.ToggleCheckbox(e,r)},ResetPreferenceCollection:function(e){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.preferenceCollection.reset(e),this.InitializeDisplay()},ToggleCheckboxes:function(){var e=this,r=e.preferenceCollection.at(0),t=["RequireSignatureOnCheck","RequireSignatureOnCreditCard","RequireSignatureOnOpenAccount","RequireSignatureOnOrder"];i.each(t,function(i){switch(i){case"RequireSignatureOnCheck":e.requireSignatureOnCheck=r.attributes.RequireSignatureOnCheck;break;case"RequireSignatureOnCreditCard":e.requireSignatureOnCreditCard=r.attributes.RequireSignatureOnCreditCard;break;case"RequireSignatureOnOpenAccount":e.requireSignatureOnOpenAccount=r.attributes.RequireSignatureOnOpenAccount;break;case"RequireSignatureOnOrder":e.requireSignatureOnOrder=r.attributes.RequireSignatureOnOrder}r.get(i)?e.SetChkState(i,!0):e.SetChkState(i,!1)})},Save:function(){if(this.preferenceCollection&&0!==this.preferenceCollection.length&&this.preferences&&0!==this.preferences.length){this.UpdateCollection();var e=this,r=this.preferences.at(0);r.set({Preference:this.preferenceCollection.at(0)}),r.url=n.ServiceUrl+c.POS+a.UPDATEPREFERENCE,r.save(null,{success:function(r,i){e.SaveCompleted()},error:function(e,r,i){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(r,"Error Updating Signature Preference")}})}},SaveCompleted:function(){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.trigger("SaveCompleted",this)},UpdateCollection:function(){var e=this,r=e.preferenceCollection.at(0),t=["RequireSignatureOnCheck","RequireSignatureOnCreditCard","RequireSignatureOnOpenAccount","RequireSignatureOnOrder"];i.each(t,function(i){var t=!1;switch(i){case"RequireSignatureOnCheck":t=e.requireSignatureOnCheck,r.set({RequireSignatureOnCheck:t});break;case"RequireSignatureOnCreditCard":t=e.requireSignatureOnCreditCard,r.set({RequireSignatureOnCreditCard:t});break;case"RequireSignatureOnOpenAccount":t=e.requireSignatureOnOpenAccount,r.set({RequireSignatureOnOpenAccount:t});break;case"RequireSignatureOnOrder":t=e.requireSignatureOnOrder,r.set({RequireSignatureOnOrder:t})}}),e.preferenceCollection.reset(r)}});return s});