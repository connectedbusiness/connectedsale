define(["jquery","mobile","underscore","backbone","text!template/20.1.0/settings/payment/confirmpassword.tpl.html"],function(t,e,s,a,r){var n=a.View.extend({_template:s.template(r),events:{"tap #confirmBtn":"ConfirmPassword_Tap","tap #btn-close":"Close"},Close:function(){this.$el.html(""),this.$el.hide(),this.trigger("closed",this)},Show:function(t){var e="Save Password";t&&(e="Change Password"),this.render(e),this.$("#newmerchantpassword").focus()},render:function(t){this.$el.show(),this.$el.html(this._template({ButtonLabel:t})),this.$("#confirmPasswordContainer").trigger("create")},EncryptPassword:function(t){return Base64.encode(t)},ConfirmPassword_Tap:function(t){t.preventDefault(),t.stopImmediatePropagation(),this.ValidatePassword()},ValidatePassword:function(){var t=this.$("#newmerchantpassword").val(),e=this.$("#confirmmerchantpassword").val();t===e?(t=this.EncryptPassword(t),this.trigger("passwordChanged",t),this.Close()):(navigator.notification.alert("Make sure the passwords are identical.",null,"Password Mismatch","OK"),this.$("#newmerchantpassword").val(""),this.$("#confirmmerchantpassword").val(""),this.$("#newmerchantpassword").focus())}});return n});