define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","model/base","view/20.1.0/secondarydisplay/logout","text!template/20.1.0/secondarydisplay/options.tpl.html"],function(t,e,o,n,i,s,r,a,c){var l=n.View.extend({_template:o.template(c),className:"popover",attributes:{style:"display:none"},events:{"tap .btn-action-connectto":"btnClick_ConnectTo","tap .btn-action-dashboard":"btnClick_Dashboard","tap .btn-action-logout":"btnClick_LogOut"},btnClick_ConnectTo:function(t){t.preventDefault(),this.trigger("ShowConnectToOptions",this)},btnClick_Dashboard:function(t){t.preventDefault(),this.ShowAccountForm()},btnClick_LogOut:function(t){t.preventDefault(),this.trigger("LogOut",this)},render:function(){var t=s.GetVersionAttributes(i.ServerVersion),e=t.Major+"."+t.Minor;i.ServerVersion;return this.$el.html(this._template({Version:e})),this.Close(),this},AccountAccepted:function(){this.trigger("BackToDashboard",this)},Close:function(){this.Hide()},Hide:function(){this.$el.hide()},ShowAccountForm:function(){this.secondaryDisplayLogoutView=new a,this.secondaryDisplayLogoutView.unbind(),this.secondaryDisplayLogoutView.on("stop",this.AccountAccepted,this),t("#secondarydisplay-logout").append(this.secondaryDisplayLogoutView.render().el),this.secondaryDisplayLogoutView.Show("SECONDARYDISPLAY")},Show:function(){this.$el.show(),this.$el.trigger("create")}});return l});