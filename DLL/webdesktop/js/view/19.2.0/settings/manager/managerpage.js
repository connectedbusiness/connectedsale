define(["jquery","mobile","underscore","backbone","shared/global","shared/method","shared/service","collection/preferences","collection/userroles","view/19.2.0/settings/manager/administrators","view/19.2.0/settings/manager/userroles","view/19.2.0/settings/modal/modal","text!template/19.2.0/settings/manager/managerpage.tpl.html"],function(e,t,i,r,s,n,o,l,a,c,d,h,p){var v=r.View.extend({_template:i.template(p),events:{"tap .administrators-li":"administrators_tap","tap .discountOverrideLevel-li":"discountOverrideLevel_tap","tap .priceChangeOverrideLevel-li":"priceChangeOverrideLevel_tap","tap .transactionVoidOverrideLevel-li":"transactionVoidOverrideLevel_tap","tap .returnsOverrideLevel-li":"returnsOverrideLevel_tap","tap .autoAllocateOverrideLevel-li":"autoAllocateOverrideLevel_tap"},initialize:function(){this.render()},render:function(){this.FetchPreference()},InitializeDisplay:function(){for(var e=this.preferenceCollection.at(0),t="",i=0;i<this.userRoleCollection.length;i++){var r=this.userRoleCollection.at(i).get("RoleCode");t=0===i?r:t+", "+r}e.set({Administrators:t}),this.$el.html(this._template(e.toJSON())),this.$("#settings-manager").trigger("create")},InitializePreferences:function(){this.preferences||(this.preferences=new l)},InitializePreferenceCollection:function(){this.preferenceCollection||(this.preferenceCollection=new l)},InitializeUserRoleCollection:function(){this.userRoleCollection||(this.userRoleCollection=new a)},FetchPreference:function(){var e=this;this.InitializePreferences(),this.InitializePreferenceCollection(),this.InitializeUserRoleCollection(),this.preferences.url=s.ServiceUrl+o.POS+n.GETPREFERENCEBYWORKSTATION+s.POSWorkstationID,this.preferences.fetch({success:function(t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.ResetUserRoleCollection(i.UserRoles),e.ResetPreferenceCollection(i.Preference),e.InitializeDisplay()},error:function(e,t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Retrieving Workstation Preference")}})},ResetUserRoleCollection:function(e){this.userRoleCollection.reset(e)},ResetPreferenceCollection:function(e){this.preferenceCollection.reset(e),s.Preference=e},Save:function(){switch(this.selectedPage){case"Administrators":this.UpdateAdministrators();break;case"OverrideLevel":this.UpdateManagerOverrides();break;default:this.SaveCompleted()}},SetSelectedPage:function(e){this.selectedPage=e},administrators_tap:function(e){e.preventDefault(),this.ShowAdministratorList()},discountOverrideLevel_tap:function(e){e.preventDefault(),this.ShowUserRoleList("Discount")},priceChangeOverrideLevel_tap:function(e){e.preventDefault(),this.ShowUserRoleList("Price")},transactionVoidOverrideLevel_tap:function(e){e.preventDefault(),this.ShowUserRoleList("Void")},returnsOverrideLevel_tap:function(e){e.preventDefault(),this.ShowUserRoleList("Return")},autoAllocateOverrideLevel_tap:function(e){e.preventDefault(),this.ShowUserRoleList("AutoAllocate")},ShowAdministratorList:function(){this.SetSelectedPage("Administrators"),this.settingsModal=new h({el:e("#settings-modal-container"),collection:this.userRoleCollection,preferences:this.preferences,preferencetype:"Admin"}),this.settingsModal.on("ModalClose",this.Save,this),this.settingsModal.administratorsView.on("SaveCompleted",this.SaveCompleted,this)},UpdateAdministrators:function(){this.settingsModal.administratorsView.trigger("UpdateAdmin",this)},UpdateManagerOverrides:function(){this.settingsModal.userRoleView.trigger("UpdateUserOverride",this)},ShowUserRoleList:function(t){this.SetSelectedPage("OverrideLevel"),this.settingsModal=new h({el:e("#settings-modal-container"),userRoleCollection:this.userRoleCollection,preferenceCollection:this.preferenceCollection,preferences:this.preferences,preferencetype:"UserRole",userroletype:t}),this.settingsModal.on("ModalClose",this.Save,this),this.settingsModal.userRoleView.on("SaveCompleted",this.SaveCompleted,this)},SaveCompleted:function(){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.trigger("SaveCompleted",this)}});return v});