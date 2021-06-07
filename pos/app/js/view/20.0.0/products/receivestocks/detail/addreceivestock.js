
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
    'collection/stocks',
    'collection/products',
	'view/20.0.0/products/receivestocks/lookup/products',
    'view/20.0.0/products/receivestocks/detail/add/itemlist',
	'text!template/20.0.0/products/receivestocks/detail/addreceivestock.tpl.html',
	'text!template/20.0.0/products/receivestocks/lookup/lookup.tpl.html',	
	'js/libs/moment.min.js',	
	'js/libs/ui.checkswitch.min.js',
	'js/libs/format.min.js'
], function ($, $$, _, Backbone, Global, Service, Method, Shared, StockModel, StockCollection, ProductCollection, ProductsView, ItemListView, 
	template, lookupTemplate){

    var _sortVar = "ItemName";

    var currentInstance;

    var AdjustmentType = {
        In: "In",
        Out: "Out"
    };

	var AddReceiveStocksView = Backbone.View.extend({
		_template : _.template( template ),
		_lookupTemplate : _.template(lookupTemplate),
		events : {
			"tap .saveBtn "              : "saveBtn_Tap",
			"tap .cancelBtn "            : "cancelBtn_Tap",
			"tap #lookup-product"        : "sortProductLookUp",
			"tap #lookup-category"       : "sortCategoryLookUp",
			"tap #done-lookup"           : "lookupDone_tap",
			"tap #inventoryItems-footer" : "addNewItem_tap",
			//"keyup #lookup-search"       : "inputLookUpSearch_KeyUp",
			"keypress #products-lookup-search": "inputLookUpSearch_KeyPress",
			"tap #adjustmentIn"          : "adjustmentIn_tap",
			"tap #adjustmentOut"         : "adjustmentOut_tap",
			"tap #searchNewItemName": "addNewItem_tap"
		},

		addNewItem_tap: function (e) {
		    e.preventDefault();
		    Shared.Products.Overlay.Show();
		    this.ShowProductLookup();
		},

		adjustmentIn_tap: function (e) {
		    e.preventDefault();
		    this.adjustmentType = AdjustmentType.In;
		    this.ToggleCheckBox();
		    this.RecalculateAdjustment();
		},

		adjustmentOut_tap: function (e) {
		    e.preventDefault();
		    this.adjustmentType = AdjustmentType.Out;
		    this.ToggleCheckBox();
		    this.RecalculateAdjustment();
		},
		RecalculateAdjustment: function () {
		    var self = this;
		    if (this.stockCollection.length > 0) {
		        this.stockCollection.each(function (item) {
		            self.RecomputeQtyAfter(item);
		        });
		    }
		   
		},
		RecomputeQtyAfter: function (model) {//v4
		    var qtyAfter = 0.00;
		    var qty = model.get("Quantity");
		    var origQty = model.get("OriginalQuantity");
		    if (Shared.IsNullOrWhiteSpace(origQty)) origQty = 0;
		    console.log("qty : " + qty + ", org :" + origQty);
		    var self = this;
		    if (Shared.IsNullOrWhiteSpace(qty) || qty > 0) {
		        if (this.adjustmentType === AdjustmentType.In) {
		            qtyAfter = origQty + qty;
		        } else {
		            qtyAfter = origQty - qty;
		        }
		        model.set({
		            QuantityAfter: qtyAfter,
		            Quantity: qty,
		            AdjustmentType: self.adjustmentType
		        });
		    }
          
		    console.log("QuantityAfter : " + model.get("QuantityAfter"));
		    $("#" + model.get("ModelID") + " > .inventoryItem-quantityAfter").text(qtyAfter);
		    this.RefreshTable();
		},
		cancelBtn_Tap: function (e) {
		    e.preventDefault();
		    navigator.notification.confirm("Do you want to cancel this transaction?", confirmCancelNew, "Confirmation", ['Yes', 'No']);
		},

		// inputLookUpSearch_KeyUp: function (e) {
		inputLookUpSearch_KeyPress: function (e) {
		    if (e.keyCode === 13) {
		        this.FindLookupItem();
		    }
		},
		lookupDone_tap: function (e) {
		    e.preventDefault();
		    this.CloseLookup();
		},

		saveBtn_Tap: function (e) {
		    e.preventDefault();
		    this.ValidateFields();
		},

		sortProductLookUp: function (e) {
		    e.preventDefault();
		    $("#spin").remove();
		    _sortVar = "ItemName";
		    $("#lookup").replaceWith(this._lookupTemplate());
		    this.HideOtherButtons();
		    $("#lookup-category").removeClass("lookup-selected");
		    $("#lookup-product").addClass("lookup-selected");
		    this.ShowProductLookup();
		},

		sortCategoryLookUp: function (e) {
		    e.preventDefault();
		    $("#spin").remove();
		    _sortVar = "CategoryCode";
		    $("#lookup").replaceWith(this._lookupTemplate());
		    this.HideOtherButtons();
		    $("#lookup-product").removeClass("lookup-selected");
		    $("#lookup-category").addClass("lookup-selected");
		    this.ShowProductLookup();
		},

		initialize : function(){
		    currentInstance = this;
		    this.stocksAdjustmentType = this.options.type;

			this.render();
		},
		
		render: function () {
			this.$el.html( this._template);
			this.adjustmentType = AdjustmentType.In;
		},

		AddNewItemToList: function (model) {
		    if (!this.stockCollection) this.InitializeStockCollection();

		    var isExist = this.stockCollection.find(function (stockCollection) {
		        return stockCollection.get("ItemCode") == model.get("ItemCode");
		    });

		    if (!isExist) {
		        
		        var stockModel = new StockModel();
		        var checkLineCtr = function() {
		            if (model.get("IsReset") === true) {
		                return this.lineCtr;
		            }
		            return 0;
		        };

		        stockModel.set({
		            AdjustmentType: this.adjustmentType,
		            ItemNameDisplay: model.get("ItemNameDisplay"),
		            ItemName: model.get("ItemName"),
		            ItemCode: model.get("ItemCode"),
		            Quantity: model.get('Quantity'),
		            UnitMeasureCode: model.get("UnitMeasureCode"),
		            WarehouseCode: model.get("WarehouseCode"),
		            UnitMeasureQuantity: model.get("UnitMeasureQuantity"),
		            OriginalQuantity: model.get("OriginalQuantity"),
		            QuantityAfter: model.get("QuantityAfter"),
		            LineCtr: checkLineCtr(),
		            Cost: 0
		        });

		        if (model.get("IsReset") === true) {
		            this.lineCtr+=1;
		        }

		        try {
		            if (Shared.IsNullOrWhiteSpace(this.updateContent)) {
		                this.stockCollection.add(stockModel);
		                console.log("Add Item!" + "CollectionCount :" + this.stockCollection.length);
		            } else {
		                var self = this;
		                
		                stockModel.set({ ModelID: self.itemContentView.model.get("ModelID") });
		                this.stockCollection.each(function (stock) {
		                    if (stock.get("ModelID") == self.itemContentView.model.get("ModelID")) {
		                        stock.set(stockModel.attributes);
		                    }
		                });
		                this.itemContentView.model.set({ ItemCode: model.get("ItemCode") });
		                this.itemContentView.ReinitializeContent();//v14
		                this.updateContent = false;

		                console.log("Change Item!" + "CollectionCount :" + this.stockCollection.length);
		            }
		        } catch (e) {
		            navigator.notification.alert("Error " + e, "", "Error Adding item", "OK");
		        }
		        
		    } else {
		        Shared.Products.ShowNotification("Item already exist on the list!", true);
		    }

		    this.CloseLookup();
		},
		CheckAdjustmentType: function () {
		    this.ToggleCheckBox();
		    if (this.stocksAdjustmentType === AdjustmentType.Out) $("#transactionType-div").show();

		    switch (this.stocksAdjustmentType) {
		        case AdjustmentType.In:
		            $("#addReceiveStock-title > h1").text("New Receive Stocks");
		            break;
		        case AdjustmentType.Out:
		            $("#addReceiveStock-title > h1").text("New Stock Adjustment");
		            break;
		    }
		},

		Close: function () {
		    this.adjustmentType = AdjustmentType.In;
		    this.unbind();
		},

        CloseLookup: function () {
            try {
                $("#txt-search").removeAttr('disabled', 'disabled');
                $("#transactionDate").removeAttr('disabled', 'disabled');
        	    $("#products-lookup-search").blur();
	            $("#lookup").remove();
	            Shared.Products.Overlay.Hide();
        	}catch(e) {
        		console.log("Error "+e);
        	}
        },

        DeleteItem: function (model) {
            this.stockCollection.each(function (stock) {
                if (model.get("ModelID") == stock.get("ModelID")) {
                    stock.destroy();
                }
            });
            console.log("Deleted!" + "CollectionCount :"  + this.stockCollection.length);
            if (this.stockCollection.length == 0) {
                this.itemlistView.LoadSearchContainer();
                this.itemlistView.isCleared = false;
            }
        },

        DoCancelNew: function () {
            Global.FormHasChanges = false;
            this.options.view.LoadItems();
            this.Close();
        },

        FindLookupItem: function () {
            var _itemCode = $("#products-lookup-search").val();
            this.GetLookupItems(100, _itemCode);
        },

        GetLookupItems: function (_rowsToSelect, criteria) {
            var _self = this;
            var _itemLookup = new StockModel();
            var _rowsToSelect = 100;

            this.productCollection = new ProductCollection();
            this.productCollection.sortVar = _sortVar;

            this.productCollection.on('addItem', this.AddNewItemToList, this);

            _itemLookup.set({
                Criteria: criteria,
                ItemTypes: "'Stock', 'Matrix Item', 'Assembly'"
            });

            _itemLookup.url = Global.ServiceUrl + Service.PRODUCT + Method.GETITEMLISTBYITEMTYPE;

            _itemLookup.save(null, {
                success: function (model, response, options) {
                    if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                    _self.productCollection.reset(response.Items);
                    _self.ShowLookupCompleted()
                },

                error: function (model, error, options) {
                    if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                    model.RequestError(error, "Error");
                }
            });
        },

        HideOtherButtons: function () {
            $("#back-products").hide();
            $("#add-lookup").hide();
            $("#back-details").hide();
        },

        InitializeChildViews: function () {
            this.InitializeStockCollection();
		    this.InitializeItemList();
		    this.lineCtr = 0;

		    this.CheckAdjustmentType();
		},
        ChangeItem: function (itemContentView) {
            this.updateContent = true;
            this.itemContentView = itemContentView;
            Shared.Products.Overlay.Show();
            this.ShowProductLookup();
        },
        InitializeItemList: function () {
            if (!Shared.IsNullOrWhiteSpace(this.itemlistView)) {
                this.itemlistView.unbind();
            }
		    this.itemlistView = new ItemListView({
				el : $("#inventoryItems-area"),
				collection : this.stockCollection
			});

			this.itemlistView.on("refresh", this.RefreshTable, this);
			this.itemlistView.on("searchItem", this.ChangeItem, this);
			this.itemlistView.on("RemoveItem", this.DeleteItem, this);

			this.itemlistView.InitializeChildViews();

			if(!Global.isBrowserMode) {
			    Shared.BrowserModeDatePicker("#transactionDate","datepicker");
			} else {
				var date = new  Date();
				this.$("#transactionDate").val(this.JSONtoDate(date));
				Shared.BrowserModeDatePicker("#transactionDate","datepicker","yy-mm-dd");
			}
		},
		
		InitializeProductLookup: function () {
		    this.productsView = new ProductsView({
		        el: $("#lookup-content"),
		        collection: this.productCollection
		    });
		    this.productsView.render();
		},

		InitializeStockCollection : function() {
		    if (this.stockCollection) {
		        this.stockCollection.reset();
		    } else {
		        this.stockCollection = new StockCollection();
		        this.stockCollection.on('change', this.UpdateItem, this);
		       // this.stockCollection.on('remove', this.DeleteItem, this);
		    }
		},
		
		JsonToAspDate: function (value) {
		    var oldDate = Date.parse(value);
		    var newDate = new Date(oldDate);
		    var m = newDate.getMonth();
		    var d = newDate.getDate();
		    var y = newDate.getFullYear();
		    newDate = Date.UTC(y, m, d);
		    newDate = "/Date(" + newDate + ")/";
		    return newDate;
		},

		JSONtoDate: function (transactionDate) {
		    var DateFormat = 'YYYY-MM-DD';
		    var _tDate = moment(transactionDate).format(DateFormat);
		    return _tDate;
		},

		RefreshTable : function(){
		    var self = this;
		    this.ReloadTable();
		    setTimeout(function () {
		        self.ReloadTable();
		    }, 1000);
		},

		ReloadTable: function () {
		    $("#inventoryItemsTableHeader .inventoryItem-itemName").width($("#inventoryItemsTableContent .inventoryItem-itemName").width());
		    $("#inventoryItemsTableHeader .inventoryItem-warehouseCode").width($("#inventoryItemsTableContent  .inventoryItem-warehouseCode").width());
		    $("#inventoryItemsTableHeader .inventoryItem-unitMeasureCode").width($("#inventoryItemsTableContent  .inventoryItem-unitMeasureCode").width());
		    $("#inventoryItemsTableHeader .inventoryItem-unitMeasureQuantity").width($("#inventoryItemsTableContent  .inventoryItem-unitMeasureQuantity").width());
		    $("#inventoryItemsTableHeader .inventoryItem-originalQuantity").width($("#inventoryItemsTableContent  .inventoryItem-originalQuantity").width());
		    $("#inventoryItemsTableHeader .inventoryItem-quantity").width($("#inventoryItemsTableContent  .inventoryItem-quantity").width());
		    $("#inventoryItemsTableHeader .inventoryItem-quantityAfter").width($("#inventoryItemsTableContent  .inventoryItem-quantityAfter").width());
		    $("#inventoryItemsTableHeader .inventoryItem-cost").width($("#inventoryItemsTableContent  .inventoryItem-cost").width());
		    $("#inventoryItemsTableHeader .inventoryItem-remove").width($("#inventoryItemsTableContent  .inventoryItem-remove").width());
		    console.log("Refresh Table");
		},

		SaveAdjustment: function (date) {
		    Shared.Products.Overlay.Show();
		    this.stockModel = new StockModel();
		    this.SetStockModel();

		    this.stockModel.url = Global.ServiceUrl + Service.PRODUCT + Method.INVENTORYADJUSTMENT;
		    var self = this;
		    this.stockModel.save(null, {
		        success: function (model, response) {
		            self.SaveCompleted(response,date);
		        },
		        error: function (model, error, response) {
		            Shared.Products.Overlay.Hide();
		        }
		    });
		},

		SaveCompleted: function (response,date) {
		    if (!response.ErrorMessage) {
		        this.stockCollection.reset();
		        Shared.Products.ShowNotification("Stock Adjustment successfully saved!");
		        Shared.Products.Overlay.Hide();
		        var tempModel = new StockModel();
		        tempModel.set({
		            AdjustmentCode: response.TransactionCodes[0],
                    TransactionDate : date
		        })
		        this.options.view.LoadItems("", tempModel);
		        this.Close();
		    } else {
		        var msg = response.ErrorMessage;
		        if ((msg || "").toString().trim().toUpperCase() === "There is no enough stock available.".toLocaleUpperCase()) {
		            msg = "There is no enough stock available on some item(s)";
		            if (this.stockCollection) {
		                var inStockBaseOnDisplay = this.stockCollection.filter(function (stk) { return ((stk.get("OriginalQuantity") || 0) - (stk.get("Quantity") || 0)) >= 0 }).length || 0;
		                if (inStockBaseOnDisplay > 0) msg = msg + " or has been already allocated";
		            }
		            msg = msg + ".";
		        }
		        Shared.Products.ShowNotification(msg, true);
		        //navigator.notification.alert(msg, null, "Error", "OK");
		        Shared.Products.Overlay.Hide();
		    }

		},
		

		SetStockModel: function () {
		    var self = this;
		    this.adjustmentCollection = new StockCollection();

		    var date = this.$("#transactionDate").val();
		    var transactionDate = this.JsonToAspDate(date);
		    this.adjustmentCollection.add({
		        TransactionDate: transactionDate,
		        AdjustmentType: this.adjustmentType,
		        AdjustmentCode: "",
		        ReasonCode: "",
		        ReferenceCode: "",
		        TransactionType: "Adjustment",
		        IsPosted: true

		    });

		    this.stockModel.set({
		        Adjustments: self.adjustmentCollection.toJSON(),
		        Items: self.stockCollection.toJSON()
		    });

		},

		ShowLookupCompleted: function () {
		    this.ShowLookup();
		    this.InitializeProductLookup();
		},

		ShowLookup: function () {//v14
		   $("#lookup").remove();
		    //if ($('#lookup').length) { $("#lookup").show(); return; }
		     this.$el.append(this._lookupTemplate());
		     this.HideOtherButtons();
		     $("#lookup").show();
		     $("#txt-search").attr('disabled', 'disabled');
		     $("#transactionDate").attr('disabled', 'disabled');
		     $("#products-lookup-search").focus();
		},

		ShowLookupView: function () {
		    this.lookupview = new LookupView({
		        el: $("#lookup")
		    });
		    $(".ui-icon-arrow-r").hide();
		},

		ShowProductLookup: function () {
		    this.GetLookupItems(100, "")
		},

		ToggleCheckBox: function () {
		    $("#adjustmentIn").removeClass("customCheckSwitch-selected");
		    $("#adjustmentOut").removeClass("customCheckSwitch-selected");

		    if (this.adjustmentType == AdjustmentType.In) {
		        $("#adjustmentIn").addClass("customCheckSwitch-selected");
		        $(".inventoryItem-cost").show();
		    } else {
		        $("#adjustmentOut").addClass("customCheckSwitch-selected");
		        $(".inventoryItem-cost").hide();
		    }
		},

		UpdateItem : function(model) {
		    console.log(this.stockCollection.length);
		},
		
		ValidateFields: function () {
		    var date = this.$("#transactionDate").val();
		    if (Shared.IsNullOrWhiteSpace(date)) {
		        Shared.Products.ShowNotification("Please Input Transaction Date.", true);
		        return;
		    }
		    if (this.stockCollection.length == 0) {
		        Shared.Products.ShowNotification("Please add atleast one item on the list.", true);
		        return;
		    }
		    if (this.ValidateQtyField() === true) {
		        Shared.Products.ShowNotification("The items in the detail table should have a value greater than 0 in the quantity", true);
		        return;
		    }

		    if (!this.ValidateNegativeQuantity()) return;




		    this.SaveAdjustment(date);
		},

        //Validate if all warehouse selected are active.
		ValidateWarehouseStatus: function () {
		    this.stockCollection.each(function (model) {

		    });
		},
		
		ValidateNegativeQuantity: function (modelToCheck) {
		    if (Global.CustomerPreference && !Global.CustomerPreference.IsIgnoreStockLevels) {
		        if (modelToCheck) {
		            if (parseFloat(modelToCheck.get("QuantityAfter")) < 0) {
		                Shared.Products.ShowNotification("There is no enough stock available for item '" + modelToCheck.get("ItemName") + "'.", true);
		                return false;
		            }
		            else return true;
		        }

		        var _hasError = false;
		        this.stockCollection.each(function (model) {
		            if (_hasError) return;
		            if (model.get("AdjustmentType") === AdjustmentType.Out) if (parseFloat(model.get("QuantityAfter")) < 0) _hasError = true;
		        });

		        if (_hasError) {
		            Shared.Products.ShowNotification("There is no enough stock available on some item(s).", true);
		            return false;
		        }
		    }

		    return true;
		},
		
		ValidateQtyField : function(){
			var hasZeroQty = false;
			this.stockCollection.each(function(model){
				if(model.get("Quantity") <=0){
					hasZeroQty = true;
				}
			});
			return hasZeroQty;
		}
	});

    var confirmCancelNew = function (button) {
        if (button == 1) {
            currentInstance.DoCancelNew();
        }
    }

	return AddReceiveStocksView;
})
