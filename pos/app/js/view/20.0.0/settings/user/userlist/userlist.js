define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'view/20.0.0/settings/user/userlist/userlistvalue',
  'view/20.0.0/settings/user/usermaintenance/maintainuser',
  'text!template/20.0.0/settings/user/userlist/userlist.tpl.html',
  'text!template/20.0.0/settings/user/userlist/search.tpl.html',
  'js/libs/iscroll.js',
], function($, $$, _, Backbone, Global, Shared, UserListValuePreference, maintainUserView, template, searchTemplate) {
  var UserListPreference = Backbone.View.extend({
    _template: _.template(template),
    _search: _.template(searchTemplate),

    events: {
      "tap li": "ShowSelectedUser"
    },

    initialize: function() {       
      $("#settings-user-container").remove();
      this.render();
    },

    RemoveSearchContainer: function() {      
      $("#settings-user-container").remove();
    },

    render: function() {         
      console.log('userlist');
      // this.myScroll = new iScroll('right-pane-content');
      this.$el.html(this._template);
      $("#user-left-pane-content").before(this._search);
      // this.$el.trigger("create");
      this.collection.each(this.LoadUserListValue, this);

      if (Global.isBrowserMode) Shared.ApplyListScroll();
      else this.myScroll = new iScroll('scroll-wrapper');
    },

    BindToForm: function(mainView) {
      //this.mainView = mainView;
    },

    SetSelected: function(selectedReportCode) {

    },

    ShowSelectedUser: function(model) {
      /*
	    	if(!this.maintainUserView){
		    	this.maintainUserView = new maintainUserView({
		    		el : $("#right-pane-content"),
		    		model : model
		    	});
		    	this.maintainUserView.InitailizeChildViews();
		    	this.maintainUserView.BindToMain(this.mainView);
	    	}else{
	    		this.maintainUserView.Show(model);
	    		this.maintainUserView.InitailizeChildViews();
	    		this.maintainUserView.BindToMain(this.mainView);
	    	}*/

    },

    LoadUserListValue: function(model) {      
      this.userListValuePref = new UserListValuePreference();
      this.$("#user-list-preference").append(this.userListValuePref.render(model).el);
      // this.$("#user-list-preference").listview("refresh");
      this.userListValuePref.on('selected', this.ShowSelectedUser, this);

    }

  });
  return UserListPreference;
});
