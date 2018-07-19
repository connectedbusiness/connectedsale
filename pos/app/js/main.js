/**
Provides the base Widget class...

@module main
@author Connected Business`
**/
require.config({
	paths:{
		jquery : 'libs/jquery-1.8.2.min',
		mobile : 'libs/jquery.mobile-1.1.0',
		base64 : 'libs/webtoolkit.base64',
        bigdecimal : 'libs/BigDecimal-all-last.min',
		backbone : 'libs/backbone',
		localstorage : 'libs/backbone.localStorage',
		underscore : 'libs/underscore-min',
		text : 'libs/text',	
		template : '../template'
	},
	
	/*shim: {
        backbone     : { deps: ["underscore", "jquery", "mobile"], exports: "Backbone" },
        underscore   : { exports: "_" },
        jqmconfig    : { deps: ["jquery"], exports: "jqmconfig" },
        bootstrapswitch : { deps: ["jquery"], exports: "bootstrapSwitch" }
    }*/
});
require([
  // Load our app module and pass it to our definition function
  'jquery',
  'mobile',
  'router',
  'shared/shared',
  'view/dialog/dialog'  
], function($, $$, Router, Shared, Dialog){
    console.log('init main.js')
    
    if (!(navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/))) {

        //Initialize Dialog Box and Que
        var que = new Array();
        var dialog = null;

        var dialogView = function() {
        	if (dialog == null) dialog = new Dialog();
            dialog.on('dialog-close', messageQue);
            return dialog;
        }
        
	    var messageQue = function () {
	        que.shift();
	        if (que.length == 0) return;
	        var params = que[0];
             
	        if (params.type == "alert") dialogView().AlertMsg(params.msg, params.title, params.ereceiver);
	        else dialogView().ConfirmDialog(params.msg, params.ereceiver, params.title);
	    }
	   
	    navigator.__proto__.notification = {
	        alert: function (msg, ereceiver, title, buttons) { 
	            que.push({ msg: msg, title: title, ereceiver: ereceiver, type: "alert" });
	            if (que.length == 1) dialogView().AlertMsg(msg, title, ereceiver);
	            
	        },
	        confirm: function (msg, ereceiver, title, buttons) { 
	            que.push({ msg: msg, title: title, ereceiver: ereceiver, type: "confirm" });
	            if (que.length == 1) dialogView().ConfirmDialog(msg, ereceiver, title);
	        }
	    }

	} else {

        //Testing for Keyboard Detection
	    var keyboardEvents = {
	        show: function () {
	            if (!navigator.notification.isOverrideAlert) return;
	            navigator.keyboardIsVisible = true;
	            Shared.ToggleNotificationPosition(true);
	        },
	        hide: function () { 
	            if (!navigator.notification.isOverrideAlert) return;
	            navigator.keyboardIsVisible = false;
	            Shared.ToggleNotificationPosition();
	        }
	    }

	    window.plugins.keyboard.on("KeyboardDidShow", keyboardEvents, "show");
	    window.plugins.keyboard.on("KeyboardDidHide", keyboardEvents, "hide");

	}
     
	navigator.keyboardIsVisible = false;
	navigator.notification.isOverrideAlert = false;

	var originalAlert = navigator.notification.alert;
	navigator.notification._alert = originalAlert;
	navigator.notification.overrideAlert = function (val) {
	    if (!val) {
	        navigator.notification.isOverrideAlert = false;
	        navigator.notification.alert = originalAlert;
	    }
	    else {
	        navigator.notification.isOverrideAlert = true;
	        navigator.notification.alert = function (msg, ereceiver, title, buttons, preventOverride) {
	            if (preventOverride) {
	                navigator.notification._alert(msg, ereceiver, title, buttons, preventOverride);
	                return;
	            }
	            Shared.ShowNotification(msg, true, null, true);
	        }
	    }
	}

  Router.initialize();
});