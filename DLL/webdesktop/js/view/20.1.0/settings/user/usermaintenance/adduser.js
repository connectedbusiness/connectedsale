define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","collection/userroles","collection/useraccounts","collection/preferences","model/lookupcriteria","model/useraccount","text!template/20.1.0/settings/user/usermaintenance/adduserform.tpl.html"],function(e,s,t,i,o,r,n,a,d,c,l,u,h){var g=!1,v=i.View.extend({_template:t.template(h),events:{"click #save-btn":"saveUserTapped","blur #user-code":"CheckUserCodeAvailability"},initialize:function(){this.render()},render:function(){console.log(o.POSWorkstationID),this.InitializeDisplay(),this.GenerateNewUserSchema(),this.FetchUserRoles(),this.changeModalSize()},InitializeDisplay:function(){this.SetSelectedPage("User"),this.$el.html(this._template()),this.$el.trigger("create")},GenerateNewUserSchema:function(){var e=this;this.userSchemaModel=new u,this.userSchemaModel.url=o.ServiceUrl+r.POS+n.GETNEWUSERACCOUNTSCHEMA,this.userSchemaModel.fetch({success:function(s,t,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.SetUserAccountSchema(t)},error:function(e,s,t){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(s,"Error Retrieving User Schema")}})},SetUserAccountSchema:function(e){this.dnsName=e.DNSName,this.ipAddress=e.IPAddress,this.countryCode=e.CountryCode,this.LanguageCode=e.LanguageCode,this.RoleCode=e.RoleCode},saveUserTapped:function(e){e.preventDefault(),this.IsReadyToSave()&&this.saveNewUser()},saveNewUser:function(){var e=this,s=new u;this.userRoleCollection||(this.userRoleCollection=new a),s.set(e.NewAttribute()),s.on("sync",this.NewUserAdded,this),s.on("error",this.SaveFailed,this),s.url=o.ServiceUrl+r.POS+n.CREATEUSERACCOUNT,s.save()},NewUserAdded:function(e,s,t){return o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),s.ErrorMessage?void this.NotifyMsg(s.ErrorMessage,"Error Saving New User"):(s.ProductRightsMessage&&this.NotifyMsg(s.ProductRightsMessage,"Error assigning product rights"),void this.trigger("NewUserAdded",this))},FetchUserRoles:function(e){var s=new l,t=100;this.userRoleCollection||(this.userRoleCollection=new a),s.set({StringValue:e}),s.on("sync",this.FetchSuccess,this),s.on("error",this.FetchSaveError,this),s.url=o.ServiceUrl+r.POS+n.USERROLELOOKUP+t,s.save()},FetchSuccess:function(e,s,t){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.userRoleCollection.reset(s.UserRoles),this.PopulateUseRoleElement()},PopulateUseRoleElement:function(){this.index=0,this.userRoleCollection.length<=0?console.log("no user roles retrieved."):(e('#role-code > option[val !=""]').remove(),this.userRoleCollection.each(this.SetRoleOptions,this),e("#role-code").prop("selectedIndex",this.defaultRoleIndex))},SetRoleOptions:function(s){var t=s.get("RoleCode");e("#role-code").append(new Option(t,t)),"Administrator"===t&&(this.defaultRoleIndex=this.index,e("#role-code").trigger("change")),this.index++},Save:function(){this.SaveCompleted()},SetSelectedPage:function(e){this.selectedPage=e},SaveCompleted:function(e,s,t){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.trigger("SaveCompleted",this)},SaveFailed:function(e,s,t){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(s,"Error User Account")},NewAttribute:function(){var e=this,s={UserCode:this.userCode,RoleCode:this.roleCode,UserName:this.userName,UserPassword:e.EncryptPassword(this.password),IsActive:!0,DNSName:this.dnsName,IPAddress:this.ipAddress,CountryCode:this.countryCode,LanguageCode:this.LanguageCode,IsEncrypted:!1,ProductEdition:"Connected Sale"};return s},IsReadyToSave:function(){return this.GetElementValues(),""===this.userCode?(this.NotifyMsg("User ID is required.","Missing Input."),!1):""===this.userName?(this.NotifyMsg("User Name is required.","Missing Input."),!1):""===this.password?(this.NotifyMsg("Password is required.","Missing Input."),!1):""===this.confirmPassword?(this.NotifyMsg("Please confirm password.","Missing Input."),!1):this.password.length<5?(this.NotifyMsg("Password is too short.","Password Validation."),!1):this.hasWhiteSpace(this.userCode)?(this.NotifyMsg("User Code must not contain whitespaces.","Invalid Entry"),!1):this.password!==this.confirmPassword?(this.NotifyMsg("Passwords don't matched","Invalid Password"),!1):!!g||(this.NotifyMsg("User ID Already Exist.","Invalid User Name"),!1)},GetElementValues:function(){this.userCode=e("#user-code").val(),this.roleCode=e("#role-code").val(),this.userName=e("#user-name").val(),this.password=e("#password1").val(),this.confirmPassword=e("#confirm-password").val()},clearFields:function(){e("#user-code").val()="",e("#role-code").val()="",e("#user-name").val()="",e("#password1").val()="",e("#confirm-password").val()=""},CheckUserCodeAvailability:function(){var s=e("#user-code").val(),t=this,i=new l;i.url=o.ServiceUrl+r.POS+n.VALIDATEUSERCODE,i.set({StringValue:s}),e("#btn-save").addClass("ui-disabled"),i.save(null,{success:function(e,s,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.AssignUserCodeAvailability(s),t.EnableSaveButton()},error:function(e,s,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(s,"Error Retrieving User Code"),t.EnableSaveButton()}})},EnableSaveButton:function(){e("#btn-save").removeClass("ui-disabled")},AssignUserCodeAvailability:function(e){g=e},hasWhiteSpace:function(e){return e.indexOf(" ")>=0},hasSpecialCharacters:function(e){},EncryptPassword:function(e){return Base64.encode(e)},NotifyMsg:function(e,s){console.log(e),navigator.notification.alert(e,null,s,"OK")},changeModalSize:function(){e("#settings-modal-container").addClass("settings-modal-userMaintenance-template"),e("#settings-modal").css("width","auto"),e("#settings-modal").css("min-height","410px")}});return v});