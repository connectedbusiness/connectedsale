/**
 * Connected Business | 05-1-2012
 */
define([
  	'base64',
  	'shared/global',
  	'backbone'
], function(base64, Global, Backbone) {
	var EncodeAuth = function(user,pass) {
    var _tok = user + ':' + pass,
    _hash = Base64.encode(_tok);
    return "Basic "+ _hash;
  };

	var sendAuthorization = function (xhr) {
		var auth = EncodeAuth(Global.Username, Global.Password);
		xhr.setRequestHeader('Authorization', auth);
	};

	var Collection = Backbone.Collection.extend({
		fetch: function(options) {
			options || (options = {});
      //set default timeout to 5 minutes (60sec * 5min * 1000)
			if (options.timeout == null) options.timeout = 300000;
  		options.beforeSend = sendAuthorization;

 			var isConnected = this.CheckInternet();

  		if( isConnected != 'No network connection' ){
  			if(!Global.isBrowserMode) this.IntializeNetworkIndicator();
  			Backbone.Collection.prototype.fetch.call(this, options);
  		}else{
  			//console.log("ERROR! network related! - collection - fetch");
  			if(options.isLocalStorage == undefined || !options.isLocalStorage){
  				var xhr = Backbone.Collection.prototype.fetch.call(this, options);
    			xhr.abort();
    			return xhr;
  			}else{
  				if(!Global.isBrowserMode) this.IntializeNetworkIndicator();
  				Backbone.Collection.prototype.fetch.call(this, options);
  			}
  		}
  	},

  	paginate: function(perPage, page, remaining){
			page -= 1;
			var collection = this;
			 if(remaining < perPage){
				collection = _(collection.rest(perPage*page));
				collection = _(collection.last(perPage));
			 }else{
				collection = _(collection.rest(perPage*page));
				collection = _(collection.first(perPage));
			}
			return collection.map( function(model){
				 return model
			});
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
      switch(error.statusText) {
        case "timeout":
        //console.log("Request Timed out. Check internet settings and try again.");
          navigator.notification.alert("Request timed out. Check internet settings and try again.",null,errorHeader,"OK");
        break;
        case "abort":
        //console.log("Unable to process request. Please check internet settings.");
          navigator.notification.alert("Unable to process request. Please check your internet settings.",null,errorHeader,"OK");
        break;
        default:
          if(!errorMsg) errorMsg = "The remote server returned an error.";
          navigator.notification.alert(errorMsg, null, errorHeader, "OK");
        break;
      }
	  },

	  IntializeNetworkIndicator : function() {
	    if(!window.plugins){
	      window.plugins = {};
	    }else{
	      window.plugins.cbNetworkActivity = cordova.require(Global.Plugins.ActivityIndicator);
	      window.plugins.cbNetworkActivity.ShowIndicator();
	    }
	  }
  });
  return Collection;
});
