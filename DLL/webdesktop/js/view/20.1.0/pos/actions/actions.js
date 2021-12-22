define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","model/base","text!template/20.1.0/pos/actions/actions.tpl.html"],function(e,t,i,s,a,n,o,r){var c,h="",l=s.View.extend({_template:i.template(r),className:"popover",id:"actions-popover",attributes:{style:"display:none"},events:{"tap a":"CheckTransaction"},Selected:function(e){switch(e){case"settings":window.location.hash="settings";break;case"logout":this.trigger("LogOut",this);break;case"opencashdrawer":this.trigger("OpenCashDrawer",this);break;case"closeworkstation":this.trigger("CloseWorkstation",this);break;case"printtape":this.trigger("PrintWorkstationReport",this);break;case"backtodashboard":window.location.hash="dashboard",this.trigger("stopSignalR",this)}},CheckTransaction:function(e){return e&&(e.preventDefault(),h=e.currentTarget.id),c=this,this.hasOpenTransaction?void navigator.notification.confirm("The current transaction will be cancelled if you continue. Do you want to continue?",d,"Cancel Transaction","Yes,No"):void this.Selected(h)},render:function(){var e=n.GetVersionAttributes(a.ServerVersion),t=e.Major+"."+e.Minor;a.ServerVersion;return this.$el.html(this._template({Version:t})),this.Close(),this},Close:function(){this.Hide()},Show:function(){this.ToggleDisplay(),this.$el.show(),this.$el.trigger("create")},Hide:function(){this.$el.hide()},ToggleDisplay:function(){switch(a.Preference.TrackDrawerBalance){case!0:this.$("#closeworkstation").show();break;case!1:this.$("#closeworkstation").hide()}a.Preference.IsAllowViewZXTape?this.$("#printtape").show():a.AdministratorRole||a._HasStations&&!a._HasAdmins?this.$("#printtape").show():this.$("#printtape").hide()},SetHasOpenTransaction:function(e){this.hasOpenTransaction=e}}),d=function(e){1===e&&c.trigger("VoidTransaction",c)};return l});