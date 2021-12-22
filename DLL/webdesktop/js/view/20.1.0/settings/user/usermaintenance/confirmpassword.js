define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/useraccount","collection/userroles","text!template/20.1.0/settings/user/usermaintenance/confirmpassword.tpl.html"],function(s,e,t,r,o,i,a,n,d,l,c){var h=r.View.extend({_template:t.template(c),events:{"tap #confirmBtn":"ConfirmPassword_Tap","tap #btn-done ":"Close"},initialize:function(){},Close:function(){s("#confirmPasswordContainer").removeClass("confirmPasswordContainer"),this.$el.html(""),this.$el.hide(),s("#settings-blockoverlay").css("z-index","999"),s("#MUConfirmPassword").css("z-index","2000")},Show:function(){this.render(),s("#settings-blockoverlay").css("z-index","2001"),s("#MUConfirmPassword").css("z-index","2002")},render:function(){this.$el.show(),this.$el.html(this._template(this.model.toJSON()))},InitailizeChildViews:function(){s("#confirmPasswordContainer").addClass("confirmPasswordContainer"),s("#confirmPasswordContainer").trigger("create")},SetCurrentUserAccountFields:function(){this.userName=this.model.get("UserName"),this.userCode=this.model.get("UserCode"),this.roleCode=this.model.get("RoleCode"),this.passwordIV=this.model.get("UserPasswordIV"),this.passwordSalt=this.model.get("UserPasswordSalt"),this.currentPassword=this.model.get("UserPassword"),this.password=this.$("#current-password").val()},EncryptPassword:function(s){return Base64.encode(s)},ConfirmPassword_Tap:function(e){e.preventDefault(),e.stopImmediatePropagation();var t=s("#current-password").val();this.IsNullOrWhiteSpace(t)===!0?navigator.notification.alert("Please input Current Password.",null,"Required","OK"):this.ValidateCurrentPassword()},ValidateCurrentPassword:function(){var s=this;this.SetCurrentUserAccountFields(),this.userAccountModel||(this.userAccountModel=new d),this.userAccountModel.set({UserName:this.userName,UserPassword:this.password,UserPasswordIV:this.passwordIV,UserPasswordSalt:this.passwordSalt,UserCode:this.userCode,RoleCode:this.roleCode,IsActive:!0}),this.userAccountModel.url=o.ServiceUrl+i.POS+a.VALIDATECURRENTPASSWORD,this.userAccountModel.save(null,{success:function(e,t){s.CheckEncryptedPassword(t)}})},CheckEncryptedPassword:function(e){e===!0?this.ValidatePassword():(navigator.notification.alert("Current Password is Invalid.",null,"Error","OK"),s("#current-password").val(""))},IsNullOrWhiteSpace:function(s){return""===s||null===s||void 0===s},ValidatePassword:function(){var s=this.$("#cp-password").val(),e=this.$("#confirm-password").val();this.IsNullOrWhiteSpace(s)?navigator.notification.alert("Please input password.",null,"Required","OK"):s.length<5?(navigator.notification.alert("Password is too short.",null,"Password Validation","OK"),this.$("#cp-password").val(""),this.$("#confirm-password").val("")):this.IsNullOrWhiteSpace(e)?navigator.notification.alert("Please input confirm password.",null,"Required","OK"):s===e?(n.ShowNotification("Password has been changed.",!1,null,!0),this.newPassword=s,this.trigger("passwordChanged",s),this.Close()):(navigator.notification.alert("Password did not match.",null,"Error","OK"),this.$("#cp-password").val(""),this.$("#confirm-password").val(""),this.$("#cp-password").focus())}});return h});