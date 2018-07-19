/*author : John Joseph Luz*/
define([
	'backbone',
	'shared/global',	
	'shared/service',
	'shared/method',
    'shared/shared',
    'model/lookupcriteria',
    'model/base',
    'collection/base',
    'view/15.0.0/products/receivestocks/detail/addreceivestock',
    'view/15.0.0/products/receivestocks/details',
    'view/15.0.0/products/receivestocks/controls/generic-list',
	'text!template/15.0.0/products/receivestocks/stocks.tpl.html',
    'text!template/15.0.0/products/controls/generic-layout.tpl.html'
], function (Backbone, Global, Service, Method, Shared,
             LookUpCriteriaModel, BaseModel, BaseCollection,
             AddReceiveStockView, StockDetailView, GenericListView,
             StocksTemplate, GenericLayOutTemplate) {
  	
    var currentForm = "", proceed = false;

  	var proceedToSearch = function (button) {
        if (button === 1) {
            currentForm.LoadSearchItem();
        }
  	};

    var proceedToSelectedItem = function (button) {
       if (button === 1) {
           currentForm.LoadSelectedItem();
       }
    };
	
    var ClassID = {
        SearchInput: "#txt-search",
        StocksForm : "#receivestocks-form"
    }

    var ReceiveStockView = Backbone.View.extend({

        _stocksFormTemplate: _.template(StocksTemplate),
        _genericLayoutTemplate: _.template(GenericLayOutTemplate),

        btnSearch: function (e) {
            this.LoadItems($(ClassID.SearchInput).val());
        },

        initialize: function () {
        },

        render: function () {
            this.$el.html(this._stocksFormTemplate);
            this.$(ClassID.StocksForm).html(this._genericLayoutTemplate);
            currentForm = this;
        },

        AddStock: function () {
            if (Global.FormHasChanges === false) {

                if (this.addStockView) {
                    this.addStockView.remove();
                    this.addStockView.unbind();
                    this.addStockView = null;
                }

                $("#right-panel").html('');
                $("#right-panel").append("<div id='stockContainer'></div>");
                this.addStockView = new AddReceiveStockView({
                    el: $("#stockContainer"),
                    type: this.adjustmentType,
                    view: this
                });

                this.addStockView.InitializeChildViews();
                Global.FormHasChanges = true;
                this.isNew = true;
            }
        },

        DisplayItemList: function () {
            if (!this.genericListView) {
                this.genericListView = new GenericListView({ el: "#left-panel", DisableAdd: this.options.IsReadOnly });
                this.genericListView.on("search", this.SearchItem, this);
                this.genericListView.on("selected", this.SelectedItem, this);
                this.genericListView.on("add", this.AddStock, this);
                this.genericListView.on('loaded', this.GetFirstItem, this);
                this.genericListView.collection = this.stocks;
                this.genericListView.SetPlaceHolder("Search Adjustment Code");
                this.genericListView.SetDisplayField("AdjustmentCode");
                this.genericListView.Sorted = false;
                this.genericListView.Show();
            } else {
                this.genericListView.RefreshList(this.stocks);
            }
        },

        GetFirstItem: function () {
            if (!Shared.IsNullOrWhiteSpace(this.isNewLyAdded) || this.isNewLyAdded == true) {
                this.SelectNewlyAddedItem();
            } else {
                this.LoadDetailsView(this.genericListView.GetFirstModel());
            }
        },

        HasChanges: function () {
            if (Global.FormHasChanges) {
                this.UnloadConfirmationMessage = "Do you want to cancel Creating new Stock Adjustment?";
                return true;
            }
        },

        InitializeFirstModel: function () {
            var rowsToSelect = 1;
            var self = this;
            this.stocksLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.INVENTORYADJUSTMENTLOOKUP + rowsToSelect;
            this.stocksLookUp.save(null, {
                success: function (collection, response) {
                    if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                    self.GetFirstItem(response);
                }
            });
        },

        InitializeStocksLookUp: function () {
            if (!this.stocksLookUp) {
                this.stocksLookUp = new LookUpCriteriaModel();
                this.stocksLookUp.on('sync', this.StocksLookUpLoadSuccess, this);
                this.stocksLookUp.on('error', this.StocksLookUpLoadError, this);
            }
        },

        LoadDetailsView: function (model) {
            if (this.stockDetailView) {
                this.stockDetailView.remove();
                this.stockDetailView.unbind();
                this.stockDetailView = null;
            }


            $("#right-panel").html('');
            $("#right-panel").append("<div id='stockInventoryContainer'></div>");
            this.stockDetailView = new StockDetailView({
                el: $("#stockInventoryContainer"),
                model: (model) ? model : this.genericListView.GetFirstModel(),
                //toBeSearched: this.genericListView.GetItemToSearch()
            });
            this.stockDetailView.toBeSearched = this.genericListView.GetItemToSearch();
            this.stockDetailView.render();
        },

        LoadItems: function (adjustmentCode, newModel) {
            if (!Shared.IsNullOrWhiteSpace(newModel)) { this.isNewLyAdded = true; this.newModel = newModel; }
            this.InitializeStocksLookUp();
            var _rowsToSelect = 100;
            this.stocksLookUp.set({
                StringValue: adjustmentCode,
                AdjustmentType: this.adjustmentType
            });

            this.stocksLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.INVENTORYADJUSTMENTLOOKUP + _rowsToSelect;
            this.stocksLookUp.save();
        },

        LoadSearchItem: function () {
            this.LoadItems(this.genericListView.GetItemToSearch());
            Global.FormHasChanges = false;
        },

        LoadSelectedItem: function (model) {
            if (!model) {
                this.stocksModel = this.genericListView.GetSelectedModel();
            } else {
                this.stocksModel = new LookUpCriteriaModel(model);
            }

            this.LoadDetailsView(this.stocksModel);
        },

        SearchItem: function () {
            if (this.genericListView) {
                if (Global.FormHasChanges == true) {
                    navigator.notification.confirm("Do you want to cancel changes?", proceedToSearch, "Confirmation", ['Yes', 'No']);
                } else {
                    this.LoadSearchItem();
                }
            }
        },

        SelectedItem: function () {
            if (this.genericListView){
                if(Global.FormHasChanges == true){
                    navigator.notification.confirm("Do you want to cancel changes?", proceedToSelectedItem, "Confirmation", ['Yes','No']);
                }else{
                    this.LoadSelectedItem();
                }
            }
        },

        SelectNewlyAddedItem: function () {
            var model = new BaseModel();
            model.set(this.newModel);
            this.genericListView.SelectByAttribute("AdjustmentCode", model.get("AdjustmentCode"));
            this.LoadSelectedItem(model);
            this.newModel = null;
            this.isNewLyAdded = false;
        },

        Show: function (adjustmentType) {
        	this.adjustmentType = adjustmentType;
            this.LoadItems();
            this.render();
        },

        StocksLookUpLoadError: function (model, error, options) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        },

        StocksLookUpLoadSuccess: function (model, response, options) {
        	if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
         	this.stocks = new BaseCollection();
            this.stocks.reset(response.InventoryAdjustments);
            this.DisplayItemList();
        }
    });

    return ReceiveStockView;
});



