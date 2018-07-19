
/**
 * PRODUCT PAGE
 * @author MJFIGUEROA | 04-17-2013
 * Required: el, collection 
 */
define([
    'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
    'shared/method',
    'shared/service',
    'shared/shared',
    'collection/preferences',
	'view/19.0.0/products/category/categories',
    'view/19.0.0/products/products/products-form',
    'view/19.0.0/products/openingbalance/openingbalance-form',
    'view/19.0.0/products/unitmeasure/unitmeasure',
    'view/19.0.0/products/iwanto/iwanto',
    'view/19.0.0/products/departments/departments',
    'view/19.0.0/products/location/locations',    
    'view/19.0.0/products/receivestocks/stocks',
    'view/19.0.0/products/receivestocks/stocks',
	'text!template/19.0.0/products/products.tpl.html',
    'text!template/19.0.0/products/products-header.tpl.html',
    'js/libs/format.min.js'
], function ($, $$, _, Backbone, Global, Method, Service, Shared,
            PreferenceCollection,
            CategoriesView, ProductsFormView, OpeningBalanceFormView, UnitMeasureView, IwantoView, DepartmentsView, LocationsView, ReceiveStocksView, StockAdjustmentView,
            ProductsTemplate, HeaderTemplate) {


    var Forms = {
        Products: "Products",
        AdjustStock: "AdjustStock",
        OpeningBalance: "Opening Balance",
        Locations: "Locations",
        Categories: "Categories",
        Departments: "Departments",
        UOM: "Unit of Measure",
        ReceiveStocks: "Receive Stock",
        AdjustmentStocks :"Adjust Stock"

    }

    var ClassID = {
        Body: ".products-page .body",
        Header: ".products-page .header" 
        //ModalPanelContainer: ".products-page .modal-panel-container",
    }

    var currentInstance;
    var queuedForm;
    
    var doChangeForm = function (button) {
        if (button === 1) {
            if (!queuedForm) { window.location.hash = 'dashboard'; return; }
            if (currentInstance.CurrentForm != queuedForm) {
            	currentInstance.LoadForm(queuedForm);
            }  
        }
    };

    var ProductsView = Backbone.View.extend({

        _products: _.template(ProductsTemplate),
        _header: _.template(HeaderTemplate),

        events: {
            "tap .products-page .header .menu #products": "btnClick_Products",
            "tap .products-page .header #back": "btnClick_Back",
            "tap #iwantto ": "ShowIwantoOptions",
            "tap #viewCategories" : "btnClick_Categories",
            "tap #viewDepartments" : "btnClick_Departments",
            "tap #viewUOM": "btnClick_UOM",
            "tap #receivestock" : "btnClick_ReceiveStocks",
            "tap #viewLocation": "btnClick_Locations",
            "tap #viewOpeningBalance" : "btnClick_OpeningBalance",
            "tap #adjuststock" : "btnClick_AdjustmentStock"
        },

        btnClick_Back: function (e) { e.preventDefault(); this.ChangeFormWithValidation(); },
        btnClick_Products: function (e) { e.preventDefault(); this.ChangeFormWithValidation(Forms.Products); },
        btnClick_Categories: function (e) { e.preventDefault(); this.ChangeFormWithValidation(Forms.Categories); },
        btnClick_Departments : function (e) { e.preventDefault(); this.ChangeFormWithValidation(Forms.Departments); },
        btnClick_UOM: function (e) { e.preventDefault(); this.ChangeFormWithValidation(Forms.UOM); },
        btnClick_Locations: function (e) { e.preventDefault(); this.ChangeFormWithValidation(Forms.Locations); },
        btnClick_ReceiveStocks : function(e) { e.preventDefault(); this.ChangeFormWithValidation(Forms.ReceiveStocks); },
        btnClick_OpeningBalance: function(e) { e.preventDefault(); this.ChangeFormWithValidation(Forms.OpeningBalance);  },
        btnClick_AdjustmentStock: function(e) { e.preventDefault(); this.ChangeFormWithValidation(Forms.AdjustmentStocks);  },


  
        initialize: function () {
            currentInstance = this;

            navigator.__proto__.escapedhtml = function (string) {
                var entityMap = {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': '&quot;',
                    "'": '&#39;',
                    "/": '&#x2F;'
                };
                return String(string).replace(/[&<>"'\/]/g, function (s) {
                    return entityMap[s];
                });
            };
                      
        },

        render: function () {
            this.$el.html(this._products);
            return this;
        },

        InitializeChildViews: function () {
            this.CurrentForm = Forms.Products;
            this.$(ClassID.Header).html(this._header());
            this.LoadForm(Forms.Products);
            this.InitializeIwantoPopOver();
            this.InitializePreference();
            navigator.notification.overrideAlert(true); //Notification
        },
        
        InitializeIwantoPopOver : function(){
        	 var self = this;
			 $(document).on('tap',function(e) {
			   var src = $(e.target);
			
			   if(src.hasClass('touchpop') === false) {
			 	  self.outsideMenuHandler();
			   }
			});
        },

        outsideMenuHandler : function(){
        	$("#iwantoViewContainer").hide();
		},

		ShowIwantoOptions : function(){
			if(!this.iwantoView){
				this.iwantoView = new IwantoView({
						el : $("#iwantoViewContainer")
					});
				this.iwantoView.InitializeChildViews();	
			}
			
			$("#iwantoViewContainer").show();
		},

        LoadForm: function (_formName) {
            Global.FormHasChanges = false;
            this.SetHeaderTitle(_formName);
            this.CurrentForm = _formName;
            switch (_formName) {
                case Forms.Products:
                    this.InitializeProducts();
                    this.productsFormView.Show();
                    this.productsFormView.InitializeChildViews();
                    break;
                case Forms.Categories:
                    this.InitializeCategories();
                    this.categoriesView.Show();
                    this.outsideMenuHandler();
                    break;
                case Forms.Departments:
                	this.InitializeDepartments();
                	this.departmentsView.Show();
                    break;
                case Forms.UOM:
               		this.InitializeUOM();
               		this.unitMeasureView.Show();
               		break;
                 case Forms.Locations:
                    this.InitializeLocations();
                    this.locationsView.Show();
                    break;
                 case Forms.ReceiveStocks:
                    this.InitializeReceiveStocks();
                    this.receiveStocksView.Show("In");
                    break;

                 case Forms.OpeningBalance: 
                 	this.InitializeOpeningBalance();
                 	this.openingBalanceFormView.Show();
                 	this.openingBalanceFormView.InitializeChildViews();
                 	break;
                 case Forms.AdjustmentStocks:
                    this.InitializeStockAdjustment();
                    this.stockAdjustmentView.Show("Out");
                    break;
            }
        },

        ChangeFormWithValidation: function (_formName) {
            queuedForm = _formName;
            if (this.CurrentForm == _formName) return;
            if (this.CurrentForm == Forms.Products) this.CheckFormMode(this.productsFormView);
            if (this.CurrentForm == Forms.Categories) this.CheckFormMode(this.categoriesView);
            if (this.CurrentForm == Forms.Departments) this.CheckFormMode(this.departmentsView );
            if (this.CurrentForm == Forms.UOM) this.CheckFormMode(this.unitMeasureView);
            if (this.CurrentForm == Forms.Locations) this.CheckFormMode(this.locationsView);
           	if (this.CurrentForm == Forms.ReceiveStocks) this.CheckFormMode(this.receiveStocksView);
            if (this.CurrentForm == Forms.OpeningBalance) this.CheckFormMode(this.openingBalanceFormView);
            if (this.CurrentForm == Forms.AdjustmentStocks) this.CheckFormMode(this.stockAdjustmentView);

        },

        CheckFormMode: function (view) {
            if (!view) { doChangeForm(1); return; }
            if (!view.HasChanges) { doChangeForm(1); return; }
            if (!view.HasChanges()) { doChangeForm(1); return; }
            if (view.UnloadConfirmationMessage) {
                navigator.notification.confirm(view.UnloadConfirmationMessage, doChangeForm, "Confirmation", ['Yes','No']);
            } else {
                navigator.notification.confirm("Do you want to cancel changes?", doChangeForm, "Confirmation", ['Yes','No']);
            };
        },

        IsUserAdmin: function () {
            if(!Global.UserRole) return true;
            if(Global.UserRole.length == 0) return true;
            for (i in Global.UserRole) {
                if(Global.UserRole[i].RoleCode == Global.UserInfo.RoleCode) return true;
            }
            return false;
        },

        SetHeaderTitle: function (val) {
            $(".header-content #title").html(val);
        },

        InitializeCategories: function () {
            if(!this.IsNullOrWhiteSpace(this.categoriesView)){
            	this.categoriesView.unbind();
            }
            this.categoriesView = new CategoriesView({
                el: $(ClassID.Body),
                IsReadOnly: !this.IsUserAdmin()
           });
        },
    
       	InitializeDepartments: function () {
           if(!this.IsNullOrWhiteSpace(this.departmentsView)){
           		this.departmentsView.unbind();
           }
           	this.departmentsView = new DepartmentsView({
           	    el: $(ClassID.Body),
           	    IsReadOnly: !this.IsUserAdmin()
            });

        },
        
        InitializeProducts: function () {
            this.productsFormView = new ProductsFormView({
                el: $(ClassID.Body),
                IsReadOnly: !this.IsUserAdmin()
            });
        },
        
        InitializeUOM : function() {
	        this.unitMeasureView = new UnitMeasureView({
	            el: $(ClassID.Body),
	            IsReadOnly: !this.IsUserAdmin()
		    });		
        },

		InitializeLocations: function () {
			//if(!this.locationsView){
				this.locationsView = new LocationsView({
				    el: $(ClassID.Body),
				    IsReadOnly: !this.IsUserAdmin()
				});		
			//}
				
		},

		InitializeReceiveStocks: function () {// added by JJLUZ for unbinding views
		    if(this.receiveStocksView){
			    this.receiveStocksView.unbind();
			    this.receiveStocksView = null;
			}

			this.receiveStocksView = new ReceiveStocksView({
			    el: $(ClassID.Body),
			    IsReadOnly: !this.IsUserAdmin()
			});	
				
		},

		InitializeStockAdjustment: function () {
		    if (this.stockAdjustmentView) {
		        this.stockAdjustmentView.unbind();
		        this.stockAdjustmentView = null;
		    }

			this.stockAdjustmentView = new StockAdjustmentView({
			    el: $(ClassID.Body),
			    IsReadOnly: !this.IsUserAdmin()
			});	
		},
		
		InitializeOpeningBalance: function () {			
            this.openingBalanceFormView = new OpeningBalanceFormView({
                el: $(ClassID.Body),
                IsReadOnly: !this.IsUserAdmin()
            });
        },
        
        SetSelectedModel : function (view) {	
        	
        },
        
 		IsNullOrWhiteSpace : function(str){
			if(!str){
				return true;
			}
			if(str === "" || str === null || str === undefined){
				return true;
			}
			return false;
		},

		InitializePreference : function() {
		    var self = this;
			this.preferenceCollection = new PreferenceCollection();
			this.preferenceCollection.url = Global.ServiceUrl + Service.POS + Method.GETPREFERENCEBYWORKSTATION + Global.POSWorkstationID;
			this.preferenceCollection.fetch({ 
				success : function(collection, response){ 
					if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator(); 
                    self.ResetCustomerPreference(response.CustomerPreference);                                        
				},
				error : function(collection, error, response){
					if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
					collection.RequestError(error, "Error");
					Shared.Products.RequestTimeOut();
				} 
			});
		},

        ResetCustomerPreference : function(customerPreference){
            Global.CustomerPreference = customerPreference;
        }

    });
    return ProductsView;
});



