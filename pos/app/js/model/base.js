/**
 * Connected Business | 05-1-2012
 */
define([
	'backbone',
  	'base64',
  	'shared/global'
], function(Backbone, base64, Global) {
	var EncodeAuth = function(user,pass) {
		var _tok = user + ':' + pass,
		_hash = Base64.encode(_tok);
		return "Basic "+ _hash;
  };

	var sendAuthorization = function (xhr) {
		var auth = EncodeAuth(Global.Username,Global.Password);
		xhr.setRequestHeader('Authorization', auth);
		if (Global.HubConnectionID) xhr.setRequestHeader('HubConnectionID' , Global.HubConnectionID);
	};

	var Model = Backbone.Model.extend({
  		save: function(attributes, options, allowProductType) {
  			this.trigger('before-save');

				this.doSave.apply(this, arguments);
  		},

  		doSave: function(attributes, options, allowProductType) {
  			options || (options = {});

				//set default timeout to 5 minutes (60sec * 5min * 1000)
  			if (options.timeout == null) options.timeout = 300000;
				options.modelcid = this.cid;

				Global.HubConnectionID = (options.connectionID) ? options.connectionID : null;

				options.beforeSend = sendAuthorization;

  			var isConnected = this.CheckInternet();

  			if( isConnected != 'No network connection' ){
  				if(!Global.isBrowserMode) this.IntializeNetworkIndicator();
  				Backbone.Model.prototype.save.call(this, attributes, options);
  			}else{
  				var xhr = Backbone.Model.prototype.save.call(this, attributes, options);
    			xhr.abort();
					return xhr;
  			}
  		},

  		fetch: function(options) {
  			options || (options = {});
  			if (options.timeout == null) options.timeout = 30000;
  			options.beforeSend = sendAuthorization;

  			var isConnected = this.CheckInternet();

  			if( isConnected != 'No network connection' ){
  				if(!Global.isBrowserMode) this.IntializeNetworkIndicator();
  				Backbone.Model.prototype.fetch.call(this, options);
  			}else{
  				var xhr = Backbone.Model.prototype.fetch.call(this, options);
    			xhr.abort();
    			return xhr;
  			}
  		},

  		CheckInternet : function() {
			if( navigator.connection != undefined && navigator.connection.type != undefined){
				var networkState = navigator.connection.type,
			states = {};

				  states[Connection.UNKNOWN]  = 'Unknown connection';
				  states[Connection.ETHERNET] = 'Ethernet connection';
				  states[Connection.WIFI]     = 'WiFi connection';
				  states[Connection.CELL_2G]  = 'Cell 2G connection';
				  states[Connection.CELL_3G]  = 'Cell 3G connection';
				  states[Connection.CELL_4G]  = 'Cell 4G connection';
				  states[Connection.NONE]     = 'No network connection';
				   return this.connectionType = states[networkState];
			}else{
			   //console.log("Browser Mode");
				Global.isBrowserMode = true;
				return this.connectionType = "Browser Mode";
			}

	    },

	    RequestError : function(error, errorHeader, errorMsg){
				switch(error.statusText){
				case "timeout":
					navigator.notification.alert("Request timed out. Check internet settings and try again.", null, errorHeader, "OK", true);
					break;
				case "abort":
					navigator.notification.alert("Unable to process request. Please check your internet settings.", null, errorHeader, "OK", true);
					break;
				default:
					if(!errorMsg) errorMsg = "The remote server returned an error.";
					navigator.notification.alert(errorMsg, null, errorHeader, "OK", true);
					break;
				}
	   	},

			IntializeNetworkIndicator : function() {
	   		if (this.showIndicator == null || this.showIndicator == true) {
	   			if(!window.plugins) window.plugins = {};
					else{
	        	window.plugins.cbNetworkActivity = cordova.require(Global.Plugins.ActivityIndicator);
	        	window.plugins.cbNetworkActivity.ShowIndicator();
	       	}
	   		}
	   	},

	   	SetShowIndicator : function(isShow) {
	   		this.showIndicator = isShow;
	   	}
  });
  return Model;
});
