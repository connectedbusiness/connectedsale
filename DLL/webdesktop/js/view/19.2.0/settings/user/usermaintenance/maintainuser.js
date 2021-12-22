define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/base","model/useraccount","model/lookupcriteria","collection/userroles","view/19.2.0/settings/user/usermaintenance/confirmpassword","text!template/19.2.0/settings/user/usermaintenance/maintainuser.tpl.html"],function(e,t,s,o,i,r,n,a,d,l,c,u,h,g){var w=null,p=o.View.extend({_template:s.template(g),events:{"tap #saveBtn ":"Save_Tap","tap #removeBtn ":"Remove_Tap","tap #password ":"Password_Tap","keydown #userName":"TriggerHasChanged","change #drpRoleCode":"TriggerHasChanged"},TriggerHasChanged:function(){return this.allowToProceed?void(this.HasChanges||(this.trigger("attributeChanged"),this.HasChanges=!0)):void(this.allowToProceed=!0)},BindToMain:function(e){this.mainView=e},Show:function(){this.render()},BackToUserAccounts:function(){this.unbind(),this.remove()},initialize:function(){w=this},render:function(){this.SetSelectedPage("User"),this.$el.html(this._template(this.model.toJSON())),this.$el.trigger("create"),e("#back-general").show(),this.InitializeUserRole(),this.changeModalSize()},InitailizeChildViews:function(){},SetSelectedPage:function(e){this.selectedPage=e},InitializeUserAccount:function(){this.$("#userID").val(this.model.get("UserCode")),this.$("#userName").val(this.model.get("UserName"))},InitializeUserRole:function(){var e=new c,t=100;e.on("sync",this.LoadUserRoleSuccess,this),e.on("error",this.LoadUserRoleFailed,this),e.url=i.ServiceUrl+r.POS+n.USERROLELOOKUP+t,e.save()},LoadUserRoleSuccess:function(e,t){return i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.get("ErrorMessage")?void navigator.notification.alert(t.ErrorMessage,null,"Saving Error","OK"):(this.userRoleCollection||(this.userRoleCollection=new u),this.userRoleCollection.reset(t.UserRoles),void this.LoadUserRoles())},LoadUserRoleFailed:function(e,t,s){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),navigator.notification.alert("An error was encounter when trying to load user role!",null,"Saving Error","OK")},LoadUserRoles:function(){e('#drpRoleCode > option[val !=""]').remove();var t=this;this.userRoleCollection.length>0&&(this.userRoleCollection.each(function(e){var s=e.get("RoleCode");t.$("#drpRoleCode").append(new Option(s,s))}),this.allowToProceed=!1,e("#drpRoleCode").val(this.model.get("RoleCode")).trigger("change"))},Password_Tap:function(t){t.preventDefault(),e("#confirmPasswordContainer").html("");var s=new h({el:e("#confirmPasswordContainer")});s.on("passwordChanged",this.ChangePassword,this),s.model=this.model,s.Show(),s.InitailizeChildViews()},ChangePassword:function(e){var t=e;this.passWord=t,this.trigger("attributeChanged")},Save_Tap:function(e){e.preventDefault(),this.ValidateFields(),i.IsAtionTap=!0},IsNullOrWhiteSpace:function(e){return!e||(""===e||null===e||void 0===e)},SetUserAccountFields:function(){this.userName=this.$("#userName").val(),this.userCode=this.model.get("UserCode"),this.roleCode=this.$("#drpRoleCode").val(),this.confirmPassword=this.$("#confirm-password").val(),this.dnsName=this.model.get("DNSName"),this.ipAddress=this.model.get("IPAddress"),this.countryCode=this.model.get("CountryCode"),this.LanguageCode=this.model.get("LanguageCode"),this.passwordIV=this.model.get("UserPasswordIV"),this.passwordSalt=this.model.get("UserPasswordSalt"),this.currentPassword=this.model.get("UserPassword"),this.WebSiteCode=this.model.get("WebSiteCode")},ValidateFields:function(){return this.SetUserAccountFields(),this.IsNullOrWhiteSpace(this.userCode)===!0?void navigator.notification.alert("Please input User Name.",null,"User Name is Required.","OK"):this.IsNullOrWhiteSpace(this.roleCode)===!0?void navigator.notification.alert("Please select Type.",null,"Type is Required.","OK"):void navigator.notification.confirm("Are you sure want to Update this User Account?",this.doCheckIfLoggedIn,"Confirmation",["Yes","No"])},SetParameters:function(){return parameters},IsUserLoggedIn:function(){this.SetUserAccountFields();var e=this,t=new d;t.url=i.ServiceUrl+r.POS+n.CHECKUSERLOGGEDIN,t.set({UserCode:this.userCode}),t.save(null,{success:function(t,s,o){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.CheckIfLoggedIn(s)}})},CheckIfLoggedIn:function(e){e?this.WarnUser():this.SaveUserAccount()},WarnUser:function(){navigator.notification.confirm("This account is currently logged in on other location. Do you still want to update this account?",this.doUpdate,"Confirmation",["Yes","No"])},SaveUserAccount:function(){var e=this;this.SetUserAccountFields(),jsonPassEncr=this.SetPasswordAndEncrypted(this.passWord),this.updateUserAccount||(this.updateUserAccount=new l),this.isActive=!0,this.updateUserAccount.set({WebSiteCode:this.WebSiteCode,UserName:this.userName,UserPassword:jsonPassEncr.UserPassword,UserPasswordIV:this.passwordIV,UserPasswordSalt:this.passwordSalt,UserCode:this.userCode,RoleCode:this.roleCode,IsActive:!0,DNSName:this.dnsName,IPAddress:this.ipAddress,CountryCode:this.countryCode,LanguageCode:this.LanguageCode,IsEncrypted:jsonPassEncr.IsEncrypted});var e=this;null!=this.updateUserAccount&&(this.updateUserAccount.url=i.ServiceUrl+r.POS+n.UPDTEUSERACCOUNT,this.updateUserAccount.save(null,{success:function(t,s,o){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.UpdateCompleted(s)}}),this.updateUserAccount=null)},doCheckIfLoggedIn:function(e){1===e&&w.IsUserLoggedIn()},doUpdate:function(e){1===e&&w.SaveUserAccount()},doRemove:function(e){return 1===e?void w.RemoveUserAccount():void 0},UpdateCompleted:function(e){if(this.IsNullOrWhiteSpace(e.ErrorMessage))if(e.UserCode.toLowerCase()==i.Username.toLowerCase())if(i.UserInfo.RoleCode=e.RoleCode,this.IsNullOrWhiteSpace(this.passWord)||i.Password===this.passWord)a.ShowNotification("Saving Successful.",!1,null,!0),this.passWord=null,this.trigger("userUpdated",this);else{i.Password=this.passWord,this.passWord=null;var t=this;a.ShowNotification("Saving Successful.",!1,null,!0),navigator.notification.alert("New password has been saved. You will need to relogin your account.",t.ProcessLogout,"Account Updated","OK",!0)}else a.ShowNotification("Saving Successful.",!1,null,!0),this.passWord=null,this.trigger("userUpdated",this);else navigator.notification.alert(e.ErrorMessage,null,"Saving Failed","OK"),i.IsAtionTap=!1},ProcessLogout:function(){e("<h5>Logging Out...</h5>").appendTo(e("#spin"));var t=new d;t.url=i.ServiceUrl+r.POS+n.SIGNOUT,t.save(null,{wait:!0,success:function(){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator();var e=window.location.href.split("#")[0];e+="#login",window.location.href=e},error:function(e,t,s){e.RequestError(t,"Error Logging out.")}})},EncryptPassword:function(e){return Base64.encode(e)},Remove_Tap:function(e){e.preventDefault(),this.SetUserAccountFields(),i.IsAtionTap=!0,this.CheckIfAllowedToDelete()&&navigator.notification.confirm("Are you sure want to Remove this User Account?",this.doRemove,"Confirmation",["Yes","No"])},CheckIfAllowedToDelete:function(){var e=this.userCode;if("admin"===e)this.NotifyMsg("Cannot delete this user account.","Unable to delete");else{if(i.Username!==e)return!0;this.NotifyMsg("This user account is currently logged in. Unable to delete.","Unable to delete")}return!1},SetPasswordAndEncrypted:function(){var e,t=!1;return this.IsNullOrWhiteSpace(this.passWord)===!1?(e=this.passWord,e=this.EncryptPassword(e),t=!1):(e=this.currentPassword,t=!0),{UserPassword:e,IsEncrypted:t}},RemoveUserAccount:function(){var e={};this.SetUserAccountFields(),e=this.SetPasswordAndEncrypted(this.passWord),removeUserAccount=new l,this.isActive=!1,removeUserAccount.set({UserName:this.userName,UserPassword:e.UserPassword,UserPasswordIV:this.passwordIV,UserPasswordSalt:this.passwordSalt,UserCode:this.userCode,RoleCode:this.roleCode,IsActive:!1,DNSName:this.dnsName,IPAddress:this.ipAddress,CountryCode:this.countryCode,LanguageCode:this.LanguageCode,IsEncrypted:e.IsEncrypted,WebSiteCode:this.WebSiteCode}),removeUserAccount.url=i.ServiceUrl+r.POS+n.DELETEUSERACCOUNT,removeUserAccount.on("sync",this.RemoveCompleted,this),removeUserAccount.on("error",this.RemoveFailed,this),removeUserAccount.save()},RemoveCompleted:function(e,t,s){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t?navigator.notification.alert("Unable to Remove Account. "+t.ErrorMessage,null,"Remove Failed"):(a.ShowNotification("User Account Successfully Removed.",!1,null,!0),this.trigger("userDeleted"))},RemoveFailed:function(e,t,s){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),navigator.notification.alert("An error was encountered during deletion of user account!",null,"Deleting Error","OK")},Close:function(){this.mainView.InitializeUserSettings(),this.unbind()},NotifyMsg:function(e,t){console.log(e),navigator.notification.alert(e,null,t,"OK")},changeModalSize:function(){e("#settings-modal-container").addClass("settings-modal-userMaintenance-template"),e("#settings-modal").css("width","auto"),e("#settings-modal").css("min-height","410px")}});return p});