/**
 * OPENING BALANCE - MAINTENANCE
 * @author PRDEBRON | 05.16.13
 * Required: el, collection 
 */
define([
    'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'shared/service',
	'shared/method',	
    'shared/shared',
    'model/base',
    'model/lookupcriteria',
    'collection/base',
    'view/23.0.0/products/openingbalance/detail/general',
    'view/23.0.0/products/openingbalance/detail/openingbalance',
	'text!template/23.0.0/products/openingbalance/openingbalance-detail.tpl.html'
], function ($, $$, _, Backbone, Global, Service, Method, Shared,
             BaseModel, LookUpCriteriaModel,
             BaseCollection,
             GeneralView, OBView, 
             OpeningBalanceDetailTemplate) {

    var ClassID = {
        Body: ".opening-balance-body div",
        Main: ".opening-balance-body"
    };

    var Tabs = {
        General: "General",
        OpeningBalance: "OpeningBalance",
    };

    var currentInstance;

    var OpeningBalanceDetailView = Backbone.View.extend({

        _openingBalanceDetailTemplate: _.template(OpeningBalanceDetailTemplate),

        events: {
            "tap #general": "tabGeneral_click",
            "tap #btn-cancel": "btnClick_Cancel",
            "tap #btn-finish": "btnClick_Finish",
        },

        tabGeneral_click: function (e) { e.preventDefault(); this.ChangeTab(Tabs.General); },      
        btnClick_Cancel: function (e) { e.preventDefault(); this.trigger('cancel', this); },
        btnClick_Finish: function (e) { e.preventDefault(); this.SaveOpeningBalance(); },

        CurrentTab: "General",

        initialize: function () {
            currentInstance = this;
            this.CurrentTab = Tabs.General;
            this.IsNew = false;
            this.$el.show();
        },

        render: function () {
            if (this.model) this.$el.html(this._openingBalanceDetailTemplate());
            else  { 
                this.$el.html(""); 
                this.$el.html(this._openingBalanceDetailTemplate());
                if(!this.IsNew) this.DisplayNoRecordFound();
            } 
            return this;
        },

        Show: function () {
            this.render();
            this.DisplayWait();
            this.GetItemDetails();
        },

        InitializeChildViews: function () {},

        DisplayWait: function () {
            Shared.Products.DisplayWait(ClassID.Body);
        },

        DisplayError: function () {
            Shared.Products.DisplayError(ClassID.Body);
        },

        DisplayNoRecordFound : function() {
            Shared.Products.DisplayNoRecordFound("#right-panel", "#list-wrapper", this.toBeSearched);
        },

        ChangeTab: function (tabCode) {
            if (this.CurrentTab == tabCode) return;
            if (tabCode == Tabs.General) this.LoadGeneralView();
            if (tabCode == Tabs.OpeningBalance) this.LoadOBView();
            this.CurrentTab = tabCode;
        },

        ChangeDisplayTab: function (tabID) {
            $(".opening-balance-detail-header .tab-active").addClass("tab");
            $(".opening-balance-detail-header .tab").removeClass("tab-active");
            $(tabID).addClass("tab-active");
            $(tabID).removeClass("tab");
        },

        InitializeNewModels: function () {
        	this.InitializeItemModel();
            this.InitializeOBCollection();
        },

        InitializeItemModel: function () {
            this.model = new BaseModel();
        },

        InitializeOBCollection: function () {
            this.obCollection = new BaseCollection();
            var _newModel = new BaseModel();
            _newModel.set(this.NewOBSchema());
            this.obCollection.add(_newModel);
        },
        
        ResetMain: function () {
            $(ClassID.Main).html("<div></div>");
        },

        LoadGeneralView: function () {
            this.ChangeDisplayTab("#general");
            if (!this.model) return;
            this.CurrentTab = Tabs.General;
            if (this.generalView) this.generalView.Close();
            this.ResetMain();
            this.generalView = new GeneralView({ el: ClassID.Body });
            this.generalView.el = ClassID.Body;
            this.generalView.model = this.model;
            this.generalView.IsNew = this.IsNew;
            this.DisplayWait();
            this.generalView.Show();
        },

        LoadOBView: function () {
            this.ChangeDisplayTab("#openingbalance");
            if (!this.obCollection) return;
            if (this.obView) this.obView.Close();
            this.obView = new OBView({ el: ClassID.Body });
            this.obView.on('itemLookup', this.TriggerItemLookUp, this);
            this.obView.on('itemChanged', this.LoadNewOBSchemaByItemCode, this);
            this.obView.collection = this.obCollection;
            this.obView.NewOBSchema = this.NewOBSchema();
            this.obView.IsNew = this.IsNew;            
            this.DisplayWait();
            if(this.IsNew) { this.LoadLocation(); return; }
            this.obView.Show();
        },
        
        TriggerItemLookUp: function () {
           	console.log('ob-detail itemLookup');
           	this.trigger('itemLookup');
           	this.GetCurrentOBDetails();
        },
        
        GetCurrentOBDetails: function () {
        	this.currentOBCID 	= this.obView.currentCID;
        	this.currentOBModel = this.currentmodel
        },
        
        GetItemDetails: function () {
            if (!this.model) { $(ClassID.Body).html(""); return;}
            this.LoadGeneralView();
        },

        AddMode: function () {
        	this.IsNew = true;
        	this.render();
            $("#opening-balance-details").addClass("addmode");                
            this.InitializeNewModels();
            this.LoadOBView();
        },
        
        SaveOpeningBalance : function() {   
        	//this.ConvertDate();     	
        	if( this.ValidateOBCollection() ){
        		this.Save();
        	}
        },
        // LOADING OF LOCATIONS..
        LoadLocation : function() {
			this.InitializeLocationLookup();
			this.locationLookup.url = Global.ServiceUrl + Service.PRODUCT + Method.GETLOCATIONLOOKUP + "100";			
			this.locationLookup.set({ StringValue : null });			
			this.locationLookup.save(); 
		},
		
		InitializeLocationLookup : function() {
			if(!this.locationLookup){
				this.locationLookup = new LookUpCriteriaModel();
				this.locationLookup.on('sync', this.LookupSuccess, this);
				this.locationLookup.on('error', this.LookupError, this);
			} 
		},
		
		LookupSuccess : function(model, response, options) {
			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
			if(!this.locationCodeCollection) this.locationCodeCollection = new BaseCollection();					
			var _location = _.reject( response.Warehouses, function(location){
				return location.IsActive == false;
			});					
			this.locationCodeCollection.reset(_location);
			this.obView.locationCodeCollection = this.locationCodeCollection;
			this.obView.Show();
		},
		
		LookupError : function(model, error, response) {
			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
			//navigator.notification.alert("An error was encounter when trying to load location codes!", null, "Fetching Error", "OK");
			Shared.Products.RequestTimeOut();
			this.obView.Show();
		},        
        
        /** LOADING OB SCHEMA FOR AN ITEM **/  
        LoadNewOBSchemaByItemCode: function (_itemCode) {
        	//if (_itemCode) var _itemCode = this.obView.currentItemCode;
        	if(_itemCode === undefined || _itemCode.trim() === "" || _itemCode === null ) return;        	
        	var model = new BaseModel();        	
        	model.url = Global.ServiceUrl + Service.PRODUCT + Method.GETITEMOPENINGBALANCE + _itemCode;
        	model.on('sync', this.LoadOBSchemaSuccess, this);
            model.on('error', this.LoadOBSchemaFailed, this);
            Shared.Products.Overlay.Show();
        	model.save();
        },
         /** END LOADING OB SCHEMA FOR AN ITEM **/  
         
        /** LOADING OB SCHEMA CALLBACK **/  
        LoadOBSchemaSuccess : function (model, response) {
        	if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        	Shared.Products.Overlay.Hide();
        	this.tmp = new BaseModel();
        	this.tmp.set(response)  
        	this.obView.ReplaceModelByCID(response);        	
        },
        
        LoadOBSchemaFailed : function (model, error, response) {
            Shared.Products.Overlay.Hide();
            Shared.Products.RequestTimeOut();
            //navigator.notification.alert("An error was encounter when trying to load new schema on Item!", null, "Saving Error", "OK");
        },
        /** END LOADING OB SCHEMA CALLBACK **/  
        
        /** SAVING NEW OPENING BALANCE **/       
		Save: function() {			
			var model = new BaseModel();
			
			var _obCollection = new BaseCollection();
			_obCollection.reset(this.obView.GetCurrentCollection().models);		
			
			var _emptyModels = new Array();							
			_obCollection.each(function(model) { 
				if (model.get("ItemName") === '') { 
			 			_emptyModels[_emptyModels.length] = model;
				}		 
			}); 
			
			for(var i = 0; i < _emptyModels.length; i++){
				_obCollection.remove(_emptyModels[i]);				
			}
			
			if(_obCollection.length == 0) { navigator.notification.alert("Please enter an item!", null, "No item found.", "OK"); ;return; }	
				
        	model.url = Global.ServiceUrl + Service.PRODUCT + Method.CREATEITEMOPENINGBALANCE;
        	model.on('sync', this.SaveNewOBSuccess, this);
            model.on('error', this.SaveNewOBFailed, this);
            model.set({	InventoryOpeningBalance : _obCollection.toJSON() })        	
            Shared.Products.Overlay.Show();
        	model.save();
		},
		/** END SAVING NEW OPENING BALANCE **/
		
		/** SAVING CALLBACK **/
		SaveNewOBSuccess: function (model, response) {
			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            Shared.Products.Overlay.Hide();
            if (model.get("ErrorMessage")) {
                navigator.notification.alert(model.get("ErrorMessage"), null, "Saving Error", "OK");
                return;
            }
            
            if(!this.collection) this.collection = new BaseCollection();
            this.collection.reset(response.InventoryOpeningBalance);
            
            if(!this.model) this.savedmodel = new BaseModel();
            this.savedModel = this.collection.at(0);            
            this.trigger('saved', this);
        },

        SaveNewOBFailed: function (model, error, response) {
            Shared.Products.Overlay.Hide();
            Shared.Products.RequestTimeOut();
            //navigator.notification.alert("An error was encounter when trying to save new product!", null, "Saving Error", "OK");
        },
        /** END SAVING CALLBACK **/                

       ValidateOBCollection: function () {
            if (!this.obCollection) return false;   
            var self = this;
            var _field = "";
            var _hasError = false;
                     
            this.obCollection.reset(this.obView.GetCurrentCollection().models);
            
            this.obCollection.each(function (model) {
            	if (_hasError) return;     	
            	if (model.get("ItemName") === '') { return; }                
                if (model.get("Quantity") == 0 || model.get("Quantity") === '') { 
                	_hasError = true; _field = "Quantity"; return; 
                } else if (model.get("ConvertedTransactionDate") === '') { 
                	_hasError = true; _field = "TransactionDate"; return; 
                } 
            });
            if (_hasError) { this.ShowWarning(_field); return false;}
            return true;
        },

        ShowWarning: function (_field) {        	
			var attr;
			switch(_field){
				case "ItemName" 		: attr = "Item Name"; break;
				case "Quantity" 		: attr = "Quantity"; break;
				case "TransacationDate" : attr = "Transaction Date"; break;
				case "Cost" 			: attr = "Cost"; break;        		
			}        	
			navigator.notification.alert(attr + " is required!", null, "Incomplete Details", "OK");
			return false;
        },
        
        NewOBSchema : function () {
        	return {
            	IsNew			: false,
                IsBase			: false,
                AccountCode 	: "",                
                Cost 			: 0, 
                DatePosted 		: "", 
                IsPosted 		: false, 
                IsPrinted 		: false, 
                IsVoided 		: false, 
                ItemCode 		: "", 
                ItemDescription : "", 
                ItemName 		: "", 
                LocationCode 	: "", 
                OpeningBalanceCode : "[To be generated]", 
                PrintCount 		: 0, 
                Quantity 		: 0, 
                Reason		    : "", 
                WarehouseCode 	: "", 
                TransactionDate : "", 
                ConvertedTransactionDate : "",
                TransactionType : "", 
                UnitMeasureCode : "", 
                UnitMeasureQty 	: 1, 
            }
        },
        
        GetCurrentCollection : function() {  			
			return this.obCollection.reset(this.obView.GetCurrentCollection().models);
        },

    });



    return OpeningBalanceDetailView;
});



