define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","collection/preferences","view/22.0.0/settings/modal/modal","view/22.0.0/settings/dejavoo/protocol/protocol","text!template/22.0.0/settings/dejavoo/dejavoo.tpl.html","js/libs/iscroll.js","js/libs/ui.checkswitch.min.js"],function(e,t,o,n,i,a,r,c,s,l,v,h){var d=n.View.extend({_template:o.template(h),events:{"tap #dejavoo-protocol-btn":"buttonPOSPreference_tap","tap #DejavooEnabled, #DejavooTransactionPrintReceipt, #DejavooTransactionSignature":"Chkbox_click","change #DejavooConnectionStatusPort, #DejavooTransactionReferenceID, #DejavooTransactionRegisterID":"TextNumber_Changed"},buttonPOSPreference_tap:function(e){e.preventDefault(),this.InitializeProtocolModal(this.preferenceCollection.at(0))},Save:function(){switch(this.selectedPage){case"Dejavoo":this.UpdateDejavooPreference()}this.backToMain&&this.SaveCompleted()},initialize:function(){this.render()},InitializeProtocolModal:function(t){this.settingsModal=new l({el:e("#settings-modal-container"),model:t,preferencetype:"DejavooConnectionProtocol",general:this}),this.settingsModal.protocolView.on("selected",function(e){this.preferenceCollection.at(0).set({DejavooConnectionProtocol:e.selectedProtocol}),this.$("#DejavooConnectionProtocol").text(e.selectedProtocol)},this)},Chkbox_click:function(e){e.preventDefault();var t="#"+e.currentTarget.id,o=this.GetCheckState(t);this.SetChkState(e.currentTarget.id,!o)},GetCheckState:function(t){return!!e(t).hasClass("icon-ok-sign")},ToggleCheckbox:function(t,o){o?(e("#"+t).addClass("icon-ok-sign").css("color",""),e("#"+t).removeClass("icon-circle-blank")):(e("#"+t).addClass("icon-circle-blank").css("color","#DADADA"),e("#"+t).removeClass("icon-ok-sign"))},SetChkState:function(e,t){var o=this;switch(e){case"DejavooEnabled":o.dejavooEnabled=t;break;case"DejavooTransactionPrintReceipt":o.dejavooTransactionPrintReceipt=t;break;case"DejavooTransactionSignature":o.dejavooTransactionSignature=t}o.ToggleCheckbox(e,t)},ToggleCheckboxes:function(){var e=this,t=this.preferenceCollection.at(0),n=["DejavooEnabled","DejavooTransactionPrintReceipt","DejavooTransactionSignature"];o.each(n,function(o){switch(o){case"DejavooEnabled":e.dejavooEnabled=t.attributes.DejavooEnabled;break;case"DejavooTransactionPrintReceipt":e.dejavooTransactionPrintReceipt=t.attributes.DejavooTransactionPrintReceipt;break;case"DejavooTransactionSignature":e.dejavooTransactionSignature=t.attributes.DejavooTransactionSignature}t.get(o)?e.SetChkState(o,!0):e.SetChkState(o,!1)})},UpdatePreference:function(){var t=this,n=t.preferenceCollection.at(0),i=["DejavooEnabled","DejavooTransactionPrintReceipt","DejavooTransactionSignature"];o.each(i,function(e){var o=!1;switch(e){case"DejavooEnabled":o=t.dejavooEnabled,n.set({DejavooEnabled:o});break;case"DejavooTransactionPrintReceipt":o=t.dejavooTransactionPrintReceipt,n.set({DejavooTransactionPrintReceipt:o});break;case"DejavooTransactionSignature":o=t.dejavooTransactionSignature,n.set({DejavooTransactionSignature:o})}}),n.set({DejavooConnectionTerminal:e("#DejavooConnectionTerminal").val(),DejavooConnectionCGIPort:e("#DejavooConnectionCGIPort").val(),DejavooConnectionAuthKey:e("#DejavooConnectionAuthKey").val(),DejavooConnectionStatusPort:e("#DejavooConnectionStatusPort").val(),DejavooTransactionFrequency:e("#DejavooTransactionFrequency").val(),DejavooTransactionReferenceID:e("#DejavooTransactionReferenceID").val(),DejavooTransactionRegisterID:e("#DejavooTransactionRegisterID").val()}),this.preferenceCollection.reset(n)},InitializeDisplay:function(){console.log("Initialize Display"),this.SetSelectedPage("Dejavoo");var t=this.preferenceCollection.at(0);e("#right-pane-content").html(""),e("#right-pane-content").css("padding",""),this.$el.html(this._template(t.toJSON())),this.ToggleCheckboxes()},render:function(){this.FetchPreference()},InitializePreferences:function(){this.preferences||(this.preferences=new s)},InitializePreferenceCollection:function(){this.preferenceCollection||(this.preferenceCollection=new s)},FetchPreference:function(){var e=this;this.InitializePreferenceCollection(),this.InitializePreferences(),this.preferences.url=i.ServiceUrl+a.POS+r.GETPREFERENCEBYWORKSTATION+i.POSWorkstationID,this.preferences.fetch({success:function(t,o){e.ResetPreferenceCollection(o.Preference)},error:function(e,t,o){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Retrieving Workstation Preference")}})},UpdateDejavooPreference:function(){if(this.preferenceCollection&&0!==this.preferenceCollection.length&&this.preferences&&0!==this.preferences.length){this.UpdatePreference();var e=this,t=this.preferences.at(0);t.set({Preference:this.preferenceCollection.at(0)}),t.url=i.ServiceUrl+a.POS+r.UPDATEPREFERENCE,t.save(null,{success:function(t,o){e.SaveCompleted()},error:function(e,t,o){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Saving Workstation Preference")}})}},SetSelectedPage:function(e){this.selectedPage=e},SaveCompleted:function(){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),console.log("SaveDejavoo"),this.trigger("SaveCompleted",this)},ResetPreferenceCollection:function(e){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.preferenceCollection.reset(e),this.InitializeDisplay()},TextNumber_Changed:function(e){var t=e.srcElement;t&&t.value.length>t.maxLength&&(t.value=t.value.slice(0,t.maxLength))}});return d});