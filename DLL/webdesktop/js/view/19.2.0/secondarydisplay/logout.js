define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/base","text!template/19.2.0/secondarydisplay/logout.tpl.html"],function(e,o,t,r,s,i,n,a,l,u){var c=r.View.extend({_template:t.template(u),events:{"tap #logout-cancel":"buttonCancel_tap","tap #logout-submit":"buttonSubmit_tap","keyup #logout-password":"keyupSubmit"},buttonCancel_tap:function(e){e.preventDefault(),this.Close()},buttonSubmit_tap:function(e){e.preventDefault(),this.PerformAction()},keyupSubmit:function(e){e.preventDefault(),13===e.keyCode&&this.PerformAction()},render:function(){return this.$el.html(this._template),this.Close(),this},AcceptManagerOverride:function(e,o){var t=this,r=s.Username,a=s.Password,l=new OverrideModel;s.Username=e,s.Password=o,l.url=s.ServiceUrl+i.POS+n.MANAGEROVERRIDE+s.POSWorkstationID+"/"+s.OverrideMode,l.save(null,{success:function(e,o){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.AcceptManagerOverrideCompleted(e,o)},error:function(e,o,t){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(o,"Error Saving Manager Override")}}),s.Username=r,s.Password=a},BackToDashboard:function(){window.location.hash="dashboard"},Close:function(){e("#logout-password").val(""),this.Hide(),e("#main-transaction-blockoverlay").hide()},Hide:function(){this.$el.hide(),a.FocusToItemScan()},IsNullOrWhiteSpace:function(e){return!e||(""===e||null===e||void 0===e)},PerformAction:function(){var e,o=!1,r=this,a=this.$("#logout-username").val(),u=this.$("#logout-password").val(),c=[],d="";if(e=s.Username,d=s.Password,this.IsNullOrWhiteSpace(a.toLowerCase())||this.IsNullOrWhiteSpace(u.toLowerCase()))this.$("#logout-password").val(""),this.$("#logout-username").val(""),navigator.notification.alert("Missing fields, Please try again.",null,"Missing Fields","OK"),this.$("#logout-username").focus();else{a.toLowerCase()!==s.UserInfo.UserCode.toLowerCase()&&0!==s.UserRole.length||(o=!0);var g=new l;g.url=s.ServiceUrl+i.POS+n.SIGNOUTWITHPERMISSION+o,t.each(s.UserRole,function(e){e.RoleCode.toLowerCase()==s.UserInfo.RoleCode.toLowerCase()&&o||c.push(e)}),s.Username=a,s.Password=u,g.set({UserRoles:c}),g.save(g,{success:function(e,o,t){r.IsNullOrWhiteSpace(o.ErrorMessage)?(r.Close(),"SECONDARYDISPLAY"===r.logoutMode&&(console.log("SECONDARYDISPLAY"),r.trigger("stop",this))):(this.$("#logout-password").val(""),this.$("#logout-username").val(""),o.ErrorMessage.indexOf("permission")>-1?navigator.notification.alert(o.ErrorMessage+" Please try again.",null,"User Permission","OK"):navigator.notification.alert(o.ErrorMessage+" Please try again.",null,o.ErrorMessage,"OK"),r.$("#kiosk-username").focus())}}),s.Username=e,s.Password=d}},ProcessLogout:function(){var e=new l;e.url=s.ServiceUrl+i.POS+n.SIGNOUT,e.save(null,{success:function(){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator();var e=window.location.href.split("#")[0];e+="#login",window.location.href=e},error:function(e){navigator.notification.alert("An error occured while trying to sign out. Please try again.",null,"Error Signing Out","OK"),s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()}})},SetLogoutMode:function(e){this.logoutMode=e},Show:function(o){this.SetLogoutMode(o),this.$el.show(),this.$("#logoutformContent").trigger("create"),this.$("#logout-username").focus(),e("#main-transaction-blockoverlay").show()}});return c});