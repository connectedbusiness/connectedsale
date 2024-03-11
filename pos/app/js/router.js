/**
 * Connected Business
 */
 define([
	'backbone',
	'jqm-config',
	'shared/global',
	'shared/shared',
	'view/app',
	'view/dashboard/dashboard'
], function(Backbone, JMobileConfig, Global, Shared, AppView, DashboardView){

	Backbone.View.prototype.close = function () {
	    if (this.beforeClose) {
	        this.beforeClose();
	    }
	    this.remove();
	    this.off();
	};

	var views = [
      	{
			POS: 'view/15.1.0/pos/pos',
			Kiosk: 'view/15.1.0/kiosk/kiosk',
			KioskCustomer: 'view/15.1.0/kiosk/customer/kioskcustomer',
			KioskPayment: 'view/15.1.0/kiosk/payment/kioskpayment',
			SecondaryDisplay: 'view/15.1.0/secondarydisplay/secondarydisplay',
			Products: 'view/15.1.0/products/products',
			Customers: 'view/15.1.0/customers/customers',
			Settings: 'view/15.1.0/settings/settings',
			Reports: 'view/15.1.0/reports/reports'
		},
	 	{
			POS: 'view/16.0.0/pos/pos',
			Kiosk: 'view/16.0.0/kiosk/kiosk',
			KioskCustomer: 'view/16.0.0/kiosk/customer/kioskcustomer',
			KioskPayment: 'view/16.0.0/kiosk/payment/kioskpayment',
			SecondaryDisplay: 'view/16.0.0/secondarydisplay/secondarydisplay',
			Products: 'view/16.0.0/products/products',
			Customers: 'view/16.0.0/customers/customers',
			Settings: 'view/16.0.0/settings/settings',
			Reports: 'view/16.0.0/reports/reports'
		},
        {
			POS: 'view/18.0.0/pos/pos',
			Kiosk: 'view/18.0.0/kiosk/kiosk',
			KioskCustomer: 'view/18.0.0/kiosk/customer/kioskcustomer',
			KioskPayment: 'view/18.0.0/kiosk/payment/kioskpayment',
			SecondaryDisplay: 'view/18.0.0/secondarydisplay/secondarydisplay',
			Products: 'view/18.0.0/products/products',
			Customers: 'view/18.0.0/customers/customers',
			Settings: 'view/18.0.0/settings/settings',
			Reports: 'view/18.0.0/reports/reports'
		},
		{
			POS: 'view/18.1.0/pos/pos',
			Kiosk: 'view/18.1.0/kiosk/kiosk',
			KioskCustomer: 'view/18.1.0/kiosk/customer/kioskcustomer',
			KioskPayment: 'view/18.1.0/kiosk/payment/kioskpayment',
			SecondaryDisplay: 'view/18.1.0/secondarydisplay/secondarydisplay',
			Products: 'view/18.1.0/products/products',
			Customers: 'view/18.1.0/customers/customers',
			Settings: 'view/18.1.0/settings/settings',
			Reports: 'view/18.1.0/reports/reports'
		},
	    {
			POS: 'view/18.2.0/pos/pos',
			Kiosk: 'view/18.2.0/kiosk/kiosk',
			KioskCustomer: 'view/18.2.0/kiosk/customer/kioskcustomer',
			KioskPayment: 'view/18.2.0/kiosk/payment/kioskpayment',
			SecondaryDisplay: 'view/18.2.0/secondarydisplay/secondarydisplay',
			Products: 'view/18.2.0/products/products',
			Customers: 'view/18.2.0/customers/customers',
			Settings: 'view/18.2.0/settings/settings',
			Reports: 'view/18.2.0/reports/reports'
		},
		{
			POS: 'view/19.0.0/pos/pos',
			Kiosk: 'view/19.0.0/kiosk/kiosk',
			KioskCustomer: 'view/19.0.0/kiosk/customer/kioskcustomer',
			KioskPayment: 'view/19.0.0/kiosk/payment/kioskpayment',
			SecondaryDisplay: 'view/19.0.0/secondarydisplay/secondarydisplay',
			Products: 'view/19.0.0/products/products',
			Customers: 'view/19.0.0/customers/customers',
			Settings: 'view/19.0.0/settings/settings',
			Reports: 'view/19.0.0/reports/reports'
		},
		{
			POS: 'view/19.1.0/pos/pos',
			Kiosk: 'view/19.1.0/kiosk/kiosk',
			KioskCustomer: 'view/19.1.0/kiosk/customer/kioskcustomer',
			KioskPayment: 'view/19.1.0/kiosk/payment/kioskpayment',
			SecondaryDisplay: 'view/19.1.0/secondarydisplay/secondarydisplay',
			Products: 'view/19.1.0/products/products',
			Customers: 'view/19.1.0/customers/customers',
			Settings: 'view/19.1.0/settings/settings',
			Reports: 'view/19.1.0/reports/reports'
		},
		{
			POS: 'view/19.2.0/pos/pos',
			Kiosk: 'view/19.2.0/kiosk/kiosk',
			KioskCustomer: 'view/19.2.0/kiosk/customer/kioskcustomer',
			KioskPayment: 'view/19.2.0/kiosk/payment/kioskpayment',
			SecondaryDisplay: 'view/19.2.0/secondarydisplay/secondarydisplay',
			Products: 'view/19.2.0/products/products',
			Customers: 'view/19.2.0/customers/customers',
			Settings: 'view/19.2.0/settings/settings',
			Reports: 'view/19.2.0/reports/reports'
		},
		{
			POS: 'view/20.0.0/pos/pos',
			Kiosk: 'view/20.0.0/kiosk/kiosk',
			KioskCustomer: 'view/20.0.0/kiosk/customer/kioskcustomer',
			KioskPayment: 'view/20.0.0/kiosk/payment/kioskpayment',
			SecondaryDisplay: 'view/20.0.0/secondarydisplay/secondarydisplay',
			Products: 'view/20.0.0/products/products',
			Customers: 'view/20.0.0/customers/customers',
			Settings: 'view/20.0.0/settings/settings',
			Reports: 'view/20.0.0/reports/reports'
		},
		{
			POS: 'view/20.1.0/pos/pos',
			Kiosk: 'view/20.1.0/kiosk/kiosk',
			KioskCustomer: 'view/20.1.0/kiosk/customer/kioskcustomer',
			KioskPayment: 'view/20.1.0/kiosk/payment/kioskpayment',
			SecondaryDisplay: 'view/20.1.0/secondarydisplay/secondarydisplay',
			Products: 'view/20.1.0/products/products',
			Customers: 'view/20.1.0/customers/customers',
			Settings: 'view/20.1.0/settings/settings',
			Reports: 'view/20.1.0/reports/reports'
		},
		{
			POS: 'view/21.0.0/pos/pos',
			Kiosk: 'view/21.0.0/kiosk/kiosk',
			KioskCustomer: 'view/21.0.0/kiosk/customer/kioskcustomer',
			KioskPayment: 'view/21.0.0/kiosk/payment/kioskpayment',
			SecondaryDisplay: 'view/21.0.0/secondarydisplay/secondarydisplay',
			Products: 'view/21.0.0/products/products',
			Customers: 'view/21.0.0/customers/customers',
			Settings: 'view/21.0.0/settings/settings',
			Reports: 'view/21.0.0/reports/reports'
		},
		{
			POS: 'view/23.0.0/pos/pos',
			Kiosk: 'view/23.0.0/kiosk/kiosk',
			KioskCustomer: 'view/23.0.0/kiosk/customer/kioskcustomer',
			KioskPayment: 'view/23.0.0/kiosk/payment/kioskpayment',
			SecondaryDisplay: 'view/23.0.0/secondarydisplay/secondarydisplay',
			Products: 'view/23.0.0/products/products',
			Customers: 'view/23.0.0/customers/customers',
			Settings: 'view/23.0.0/settings/settings',
			Reports: 'view/23.0.0/reports/reports'
		},
		{
			POS: 'view/24.0.0/pos/pos',
			Kiosk: 'view/24.0.0/kiosk/kiosk',
			KioskCustomer: 'view/24.0.0/kiosk/customer/kioskcustomer',
			KioskPayment: 'view/24.0.0/kiosk/payment/kioskpayment',
			SecondaryDisplay: 'view/24.0.0/secondarydisplay/secondarydisplay',
			Products: 'view/24.0.0/products/products',
			Customers: 'view/24.0.0/customers/customers',
			Settings: 'view/24.0.0/settings/settings',
			Reports: 'view/24.0.0/reports/reports'
		}	
	]

	var AppRouter = Backbone.Router.extend({
		routes :{
			""          : "Login",
			"login"     : "Login",
			"dashboard" : "Dashboard",
			"pos"       : "POS",
			"kiosk"     : "Kiosk",
			"customer"  : "KioskCustomer",
			"payment"   : "KioskPayment",
			"secondary" : "Secondary",
			"products"  : "Products",
			"customers" : "Customers",
			"settings"  : "Settings",
			"reports"	: "Reports",
			"research"  : "Research" //For Research Purposes CSL-15575
		},

		Login : function(){
			this.ShowView(new AppView());
		},

		Dashboard : function(){
			this.ShowView(new DashboardView());
		},

		POS : function(){
			this.ShowViewByType("POS");
		},

		Kiosk : function(){
			this.ShowViewByType("Kiosk");
		},

		KioskCustomer : function(){
			this.ShowViewByType("KioskCustomer");
		},

		KioskPayment : function(){
			this.ShowViewByType("KioskPayment");
		},

		Secondary : function() {
			this.ShowViewByType("Secondary");
		},

		Products : function() {
			this.ShowViewByType("Products");
		},

		Customers : function() {
			this.ShowViewByType("Customers");
		},

		Settings : function() {
			this.ShowViewByType("Settings");
		},
		Reports : function() {
			this.ShowViewByType("Reports");
		},
        Research: function () { //For Research Purposes CSL-15575
			this.ShowViewByType("Research");
		},

		ShowViewByType: function(type) {
			var _view;
			var _index = -1;

			var currentServerVersion = Shared.GetVersionAttributes(Global.ServerVersion);
			var serverVersion =  currentServerVersion.Major + "." + currentServerVersion.Minor;
			
			switch (serverVersion) {
				case "15.1" :
					_index = 0;
					break;
				case "16.0" :
					_index = 1;
					break;
				case "18.0" :
					_index = 2;
					break;
				case "18.1" :
					_index = 3;
					break;
				case "18.2" :
					_index = 4;
					break;
				case "19.0" :
					_index = 5;
					break;
				case "19.1" :
					_index = 6;
					break;
				case "19.2" :
					_index = 7;
					break;
				case "20.0" :
					_index = 8;
					break;
				case "20.1" :
					_index = 9;
					break;
				case "21.0" :
					_index = 10;
					break;
			}

			var majorVersion =  currentServerVersion.Major + ".0";
			switch (majorVersion) {
				case "22.0" :
					_index = 11;
					break;
				case "23.0" :
					_index = 12;
					break;
				case "24.0" :
					_index = 13;
					break;
				}

			var _self = this;
			switch (type) {
				case "POS":
					require([views[_index].POS], function(POSView) {
						_self.ShowView(new POSView());
        			});
					break;
				case "Kiosk":
					require([views[_index].Kiosk], function(KioskView) {
						_self.ShowView(new KioskView());
        			});
					break;
				case "KioskCustomer":
					require([views[_index].KioskCustomer], function(KioskCustomerView) {
						_self.ShowView(new KioskCustomerView());
        			});
					break;
				case "KioskPayment":
					require([views[_index].KioskPayment], function(KioskPaymentView) {
						_self.ShowView(new KioskPaymentView());
        			});
					break;
				case "Secondary":
					require([views[_index].SecondaryDisplay], function(SecondaryDisplayView) {
						_self.ShowView(new SecondaryDisplayView());
        			});
					break;
				case "Products":
					require([views[_index].Products], function(ProductsView) {
						_self.ShowView(new ProductsView());
        			});
					break;
				case "Customers":
					require([views[_index].Customers], function(CustomersView) {
						_self.ShowView(new CustomersView());
        			});
					break;
				case "Settings":
					require([views[_index].Settings], function(SettingsView) {
						_self.ShowView(new SettingsView());
        			});
					break;
				case "Reports":
					require([views[_index].Reports], function(ReportsView) {
						_self.ShowView(new ReportsView());
        			});
					break;
			}
		},

		ShowView: function(view) {
	    	if (this.currentView)
	            this.currentView.close();
	        $('#wrapper').html(view.render().el);
	        this.currentView = view;
	        this.currentView.InitializeChildViews();
	        return view;
	    },

	    InitalizeNavigator: function () {
	        console.log("InitalizeNavigator");
	        navigator.__proto__.csServer = 'http://172.16.1.252/csserver/';
	        if (!navigator.csPreventCache) navigator.__proto__.csPreventCache = '?' + parseInt(Math.random() * 1000000);
	        if (!navigator.cs) {
                console.log("navigator.cs LOADED");
	            navigator.__proto__.cs = {
	                toServerPath: function (path, type) {
	                    var extension = '';
	                    var root = '';
	                    switch (type) {
	                        case 'view':
	                            extension = ".js"
	                            root = 'js/';
	                            break;
	                        case 'template':
	                            extension = ".html"
	                            root = 'template/';
	                            break;
	                    }
	                    return navigator.csServer + root + path + extension  + navigator.csPreventCache;
	                }
	            }
	        }
	    }

	});

	var initialize = function(){
    	var app_router = new AppRouter;
    	Backbone.history.start();
  	};
  	return {
    	initialize: initialize
  	};
});
