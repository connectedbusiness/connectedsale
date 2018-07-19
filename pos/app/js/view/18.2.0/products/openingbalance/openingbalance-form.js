
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
	'collection/products',
    'view/18.2.0/products/openingbalance/controls/ob-list',
    'view/18.2.0/products/openingbalance/openingbalance-detail',    
    'view/18.2.0/products/openingbalance/lookup/lookup',
    'text!template/18.2.0/products/openingbalance/openingbalance-form.tpl.html',
    'text!template/18.2.0/products/openingbalance/lookup/lookup.tpl.html', 
    'text!template/18.2.0/products/controls/generic-layout.tpl.html',
    'js/libs/format.min.js'
], function ($, $$, _, Backbone, Global, Service, Method, Shared,
             BaseModel, LookUpCriteriaModel,
             BaseCollection, ProductCollection,
             GenericListView, OpeningBalanceDetailView, LookupView,
             OpeningBalanceFormTemplate, LookupTemplate, GenericLayOutTemplate) {

    var ClassID = {
        SearchInput: "#txt-search",
        OpeningBalanceForm: "#opening-balance-form",
    }

    var OpeningBalanceMainView = Backbone.View.extend({

        _openingBalanceFormTemplate: _.template(OpeningBalanceFormTemplate),
        _genericLayoutTemplate: _.template(GenericLayOutTemplate),
       
        initialize: function () {   
            currentInstance = this;
            this.UnloadConfirmationMessage = null;
            this.IsNew = false;
        },

        render: function () {
            this.$el.html(this._openingBalanceFormTemplate);
            this.$(ClassID.OpeningBalanceForm).html(this._genericLayoutTemplate);
            return this;
        },

        Show: function () {
            this.LoadItems();
            this.render();
        },

        HasChanges: function () {
            if (this.IsNew) {
                this.UnloadConfirmationMessage = "Do you want to cancel this new record?";
                return true;
            }
        },

        InitializeChildViews: function () {
        },

        ProductLookUpLoadSuccess: function (model, response, options) {
            if (!this._products) this._products = new BaseCollection();
            this._products.reset(response.InventoryOpeningBalance);
            this.ConvertJSONtoDate();
            this.DisplayItemList();
            Shared.Products.Overlay.Hide();
        },

        ProductLookUpLoadError: function (model, error, options) {
            console.log(model);
            Shared.Products.Overlay.Hide();
            Shared.Products.RequestTimeOut();
        },

        InitializeProductLookUp: function () {
            if (!this._productLookUp) {
                this._productLookUp = new LookUpCriteriaModel();
                this._productLookUp.on('sync', this.ProductLookUpLoadSuccess, this);
                this._productLookUp.on('error', this.ProductLookUpLoadError, this);
            }
        },

        LoadItems: function (criteria) {
        	if(criteria === undefined || criteria === null) criteria = null;
            this.InitializeProductLookUp();
            var _rows = "100"
            this._productLookUp.set({ 
                StringValue: criteria, 
            });

            this._productLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.OPENINGBALANCELOOKUP + _rows;
            this._productLookUp.save();
            Shared.Products.Overlay.Show();
        },

        DisplayItemList: function () {
            if (!this.genericListView) {
                this.genericListView = new GenericListView({ el: "#left-panel" , DisableAdd : this.options.IsReadOnly });
                this.genericListView.on("search", this.SearchItem, this);
                this.genericListView.on("selected", this.SelectedItem, this);
                this.genericListView.on("add", this.AddMode, this);
                this.genericListView.collection = this._products;
                this.genericListView.SetPlaceHolder("Search Products");
                this.genericListView.SetDisplayField("ConvertedTransactionDate");
                this.genericListView.Show();
            } else {
                this.genericListView.RefreshList(this._products);
            }
            this.SelectedItem();
        },

        SearchItem: function () {
            if (this.genericListView) this.LoadItems(this.genericListView.GetItemToSearch());
        },

        InitializeOpeningBalanceDetailView: function () {
            this.openingBalanceDetailView = new OpeningBalanceDetailView({ el: "#right-panel" });
            this.openingBalanceDetailView.on('cancel', this.CancelNew, this);
            this.openingBalanceDetailView.on('saved', this.Saved, this);
            this.openingBalanceDetailView.on('updated', this.Updated, this);
            this.openingBalanceDetailView.on('deleted', this.Deleted, this);
            this.openingBalanceDetailView.on('itemLookup', this.triggerItemLookupItem, this);
        },
        
        triggerItemLookupItem : function () {
        	if(!this.productCollection) this.InitializeProductCollection();
        	this.LoadLookupView();
        },  

        CancelNew: function () {
            this.ConfirmCancelChanges("DoCancelNew");    
        },

        DoCancelNew: function(){
            this.IsNew = false;
            this.openingBalanceDetailView.IsNew = false;
            this.SelectedItem();        
        },

        Saved: function () {
            var itemCode = this.openingBalanceDetailView.ItemCode;
            Shared.Products.ShowNotification("Transaction(s) was successfully created!");
            this.IsNew = false;
            this.openingBalanceDetailView.IsNew = false;  
            Global.justRefreshCollection = true;
            this.LoadItems();
            /*this._products.reset(this.openingBalanceDetailView.collection.models);
            this.ConvertJSONtoDate();
            this.DisplayItemList();*/            
            //this.genericListView.TriggerSearch(itemCode);
        },

        Updated: function () {
            Shared.Products.ShowNotification("Changes successfully saved!");
        },

        Deleted: function () {
            var itemCode = this.openingBalanceDetailView.ItemCode;
            this.SearchItem();
            Shared.Products.ShowNotification("Product '" + itemCode + "' was successfully deleted!");
        },

        SelectedItem: function () {
            if (this.IsNew) return;
            if (this.genericListView) {
                if (!this.openingBalanceDetailView) this.InitializeOpeningBalanceDetailView();
                //if (this.genericListView.GetSelectedModel()) {
                if (this.genericListView.GetSelectedModel() || this.genericListView.GetFirstModel()) {
                    this.openingBalanceDetailView.model = new BaseModel();
                    var tmpModel = this.genericListView.GetSelectedModel() || this.genericListView.GetFirstModel();
                    //this.openingBalanceDetailView.model.set(this.genericListView.GetSelectedModel().attributes);
                    this.openingBalanceDetailView.model.set(this.genericListView.GetSelectedModel().attributes);
                } else {
                    if (this._products) if (this._products.models.length > 0) {
                        this.openingBalanceDetailView.model = new BaseModel();
                        this.openingBalanceDetailView.model.set(this._products.at(0));
                    }
                    else this.openingBalanceDetailView.model = null;
                }
                
                if(Global.justRefreshCollection){ 
                	var _model = new BaseModel();
	        		 _model = this.openingBalanceDetailView.savedModel;
	            	this.openingBalanceDetailView.model = _model
	            	this.genericListView.SelectByAttribute("OpeningBalanceCode", _model.get("OpeningBalanceCode"));                    		
	            	Global.justRefreshCollection = false; 
	            }  
                this.openingBalanceDetailView.toBeSearched = this.genericListView.GetItemToSearch();

                this.openingBalanceDetailView.Show();
            }
        },

        AddMode: function () {
        	if (this.IsNew) return;
        	if (this.openingBalanceDetailView) { 
                this.IsNew = true;
                this.openingBalanceDetailView.AddMode();
            }
        },
        
        InitializeProductCollection : function() {
        	var sortVar = "ItemName";
        	this.productCollection = new ProductCollection();
			this.productCollection.sortVar = sortVar;
			this.productCollection.on('selected', this.GetItemSelected, this);
        },
        
        GetItemSelected: function(model) {        	
        	if(!this.ValidateExistingItem(model)) {
        		this.GenerateSchemaOnSelectedModel(model.get("ItemCode"))
        	}
        },
        
        ValidateExistingItem : function (item) {
        	var _selectedItemCode = item.get("ItemCode")
        	var _doesExist = false;
        	var _collection = new ProductCollection();
        	_collection.reset(this.openingBalanceDetailView.GetCurrentCollection().models)
        	_collection.each( 
        		function(model) {
        			if(model.get("ItemCode") === _selectedItemCode) _doesExist = true;       		
        	});        	        
        	if(_doesExist) navigator.notification.alert(_selectedItemCode + " already exist!", null, "Duplicate Item", "OK");
        	return _doesExist;
        },
        
        GenerateSchemaOnSelectedModel : function (itemCode) {
        	this.HideModal();
        	this.openingBalanceDetailView.LoadNewOBSchemaByItemCode(itemCode)
        }, 
        
        LoadLookupView : function () {
        	Shared.Products.Overlay.Show();
        	if(!this.itemLookupView) {
        		this.itemLookupView = new LookupView({
		            el: $("#modal-panel-container"),
		        });	            
	            this.itemLookupView.on('done', this.HideModal, this);  	
	        	this.itemLookupView.productCollection = this.productCollection;	 
	        	//this.itemLookupView.Show();           
        	}    	
        	this.itemLookupView.Show();
        	$("#txt-search").attr('disabled', 'disabled');
        	$(".data-upc").attr('disabled', 'disabled');
        	$(".data-ob-code").attr('disabled', 'disabled');
          	this.itemLookupView.RefreshItemList();
          	$("#modal-panel-container").show();
        },    
        
        ConvertJSONtoDate : function () {
        	this._products.each( function (model) {
            	var self = this;
            	var jsonTDate = model.get("TransactionDate");
		   		var DateFormat = 'L';		   		
		  		var _tDate = moment( jsonTDate ).format(DateFormat);             	
            	model.set({ ConvertedTransactionDate : _tDate });
            });
        },
        
        HideModal: function () {
            $("#txt-search").removeAttr('disabled', 'disabled');
            $(".data-upc").removeAttr('disabled', 'disabled');
            $(".data-ob-code").removeAttr('disabled', 'disabled');
        	$("#modal-panel-container").hide();
        	Shared.Products.Overlay.Hide();
        },

        ConfirmCancelChanges: function(onYes, onNo){            
            this.DoOnCancel = onNo;
            this.DoOnConfirm = onYes;
            if(this.HasChanges()){
                navigator.notification.confirm(this.UnloadConfirmationMessage, cancelChanges, "Confirmation", ['Yes','No']);                            
            } else {
                this.ConfirmExecute();
            }
        },

        ConfirmExecute : function(){
            if(!this.DoOnConfirm) return;
            this[this.DoOnConfirm]();  
        },

        CancelExecute: function(){
            if(!this.DoOnCancel) return;
            this[this.DoOnCancel]();     
        }

    });

    var currentInstance;
    var cancelChanges = function(button){
        if(button == 1){
            currentInstance.ConfirmExecute();
        } else {
            currentInstance.CancelExecute();
        }
    }

    return OpeningBalanceMainView;
});



