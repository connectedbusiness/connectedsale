define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","text!template/19.1.0/pos/manageroverride/manageroverride.tpl.html"],function(e,t,i,r,s,n,a){var d=r.View.extend({_template:i.template(a),events:{"tap .right-popover-btn":"btnDone_tap","tap .left-popover-btn":"btnClose_tap","keypress .password-input":"password_keypress"},render:function(){this.$el.html(this._template),this.$("#managerOverrideBody").trigger("create"),this.$("#managerOverrideBody > div > #username-input").focus()},Close:function(){this.$("input").blur(),this.Hide(),this.trigger("CloseClicked",this)},Show:function(){this.render(),this.$el.show(),this.IsHidden=!1,n.BlurItemScan()},SetFocusedField:function(){this.$("#username-input").focus()},Hide:function(){this.IsHidden=!0,this.$el.hide(),n.FocusToItemScan()},ValidateFields:function(){var e=this.$("#username-input").val(),t=this.$("#password-input").val();return null===e||""===e?(console.log("Username is required."),navigator.notification.alert("Username is required.",null,"Override Failed","OK"),!1):null!==t&&""!==t||(console.log("Password is required."),navigator.notification.alert("Password is required.",null,"Override Failed","OK"),!1)},AcceptManagerOverride:function(){var e=this.$("#username-input").val(),t=this.$("#password-input").val();this.trigger("ManagerOverrideAccepted",e,t,this)},btnDone_tap:function(e){this.IsHidden||(e.preventDefault(),this.ValidateFields()&&this.AcceptManagerOverride())},btnClose_tap:function(e){this.IsHidden||(e.preventDefault(),this.Close())},password_keypress:function(e){if(!this.IsHidden){var t=this.$("#password-input").val();""!==t&&null!==t&&13===e.keyCode&&(this.$("#password-input").blur(),this.ValidateFields()&&this.AcceptManagerOverride())}}});return d});