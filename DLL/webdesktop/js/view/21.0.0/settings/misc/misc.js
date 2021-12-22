define(["jquery","mobile","underscore","backbone","shared/global","shared/method","shared/service","collection/preferences","text!template/21.0.0/settings/misc/misc.tpl.html","js/libs/ui.checkswitch.min.js"],function(e,t,i,a,n,r,s,l,c){var o=a.View.extend({_template:i.template(c),initialize:function(){this.render()},render:function(){this.InitializeAllowBlindClose(),this.FetchPreference()},InitializeAllowBlindClose:function(){n.trackDrawerBalanceState=n.TrackDrawerBalance,1==n.Preference.BlindClose&&1==n.TrackDrawerBalance?n.IsOnLoad=!1:n.IsOnLoad=!0},InitializeDisplay:function(){this.$el.html(this._template(this.preferenceCollection.at(0).toJSON())),this.ToggleCheckboxes(),this.$("#settings-misc").trigger("create")},FetchPreference:function(){this.preferenceCollection||(this.preferenceCollection=new l);var e=this;this.preferenceCollection.url=n.ServiceUrl+s.POS+r.GETPREFERENCEBYWORKSTATION+n.POSWorkstationID,this.preferenceCollection.fetch({success:function(t,i){e.ResetPreferenceCollection(i.Preference)}})},ResetPreferenceCollection:function(e){this.preferenceCollection.reset(e),this.InitializeDisplay()},Save:function(){if(this.preferenceCollection){this.UpdatePreference();var e=this,t=this.preferenceCollection.at(0);t.url=n.ServiceUrl+s.POS+r.UPDATEPREFERENCE,t.save(null,{success:function(t,i){e.SaveCompleted()}})}},SaveCompleted:function(){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.trigger("SaveCompleted",this)},ToggleCheckboxes:function(){var t=this,a=this.preferenceCollection.at(0),r=["AutoSignOutUser","TrackDrawerBalance","BlindClose","UseCashDrawer"];i.each(r,function(i){var r="#"+i,s=CheckSwitch(r);switch(i){case"AutoSignOutUser":this.autoSignOutUser=s;break;case"TrackDrawerBalance":this.trackDrawerBalance=s;break;case"BlindClose":this.blindClose=s;break;case"UseCashDrawer":this.useCashDrawer=s}a.get(i)?(s.on(),e("#BlindClose-li").removeClass("ui-disabled")):(s.off(),e("#BlindClose-li").addClass("ui-disabled")),"TrackDrawerBalance"===i&&s.bind({"checkSwitch:on":function(e){n.trackDrawerBalanceState=!0,t.DisableBlindClose(),t.trackDrawerBalance_change(!0)},"checkSwitch:off":function(e){n.trackDrawerBalanceState=!1,t.DisableBlindClose(),t.trackDrawerBalance_change(!1)}}),"BlindClose"===i&&s.bind({"checkSwitch:off":function(e){t.AllowBlindClose()}})})},AllowBlindClose:function(){1==n.trackDrawerBalanceState&&0==n.AdministratorRole&&0==n.IsOnLoad&&1==n.Preference.BlindClose&&(e("#BlindClose-container > h1 > span").removeClass("ui_check_switch_off").addClass("ui_check_switch_on"),e("#BlindClose-container > h1 > span .ui_check_switch_slider").css("margin-left","0px"),e("#BlindClose").attr("checked",!0),navigator.notification.alert("You are not authorized to change this setting.",null,"Action Not Allowed","OK")),n.IsOnLoad=!1},DisableBlindClose:function(t){trackDrawerBalance.getState()?(e("#BlindClose-li").removeClass("ui-disabled"),0==n.AdministratorRole&&1==n.Preference.BlindClose&&(e("#BlindClose-container > h1 > span").removeClass("ui_check_switch_off").addClass("ui_check_switch_on"),e("#BlindClose-container > h1 > span .ui_check_switch_slider").css("margin-left","0px"),e("#BlindClose").attr("checked",!0))):(e("#BlindClose-li").addClass("ui-disabled"),e("#BlindClose").attr("checked",!1),e("#BlindClose-container > h1 > span").removeClass("ui_check_switch_on").addClass("ui_check_switch_off"),e("#BlindClose-container > h1 > span .ui_check_switch_slider").css("margin-left","-50px"))},UpdatePreference:function(){var e=this.preferenceCollection.at(0),t=["AutoSignOutUser","TrackDrawerBalance","BlindClose","UseCashDrawer"];i.each(t,function(t){var i=!1;switch(t){case"AutoSignOutUser":i=this.autoSignOutUser.getState(),e.set({AutoSignOutUser:i});break;case"TrackDrawerBalance":i=this.trackDrawerBalance.getState(),e.set({TrackDrawerBalance:i}),n.TrackDrawerBalance=i;break;case"BlindClose":i=this.blindClose.getState(),e.set({BlindClose:i}),n.Preference.BlindClose=i;break;case"UseCashDrawer":i=this.useCashDrawer.getState(),e.set({UseCashDrawer:i})}}),this.preferenceCollection.reset(e)},trackDrawerBalance_change:function(e){if(n.Preference.TrackDrawerBalance&&n.Status.IsOpen&&!e){n.PromptCloseWorkstation=!0;var t="Warning! This workstation is still open, you'll be asked to close this workstation after you save your changes.";console.log(t),navigator.notification.alert(t,null,"Workstation Still Open","OK")}else n.PromptCloseWorkstation=!1}});return o});