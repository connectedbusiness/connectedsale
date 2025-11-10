
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'shared/method',
	'shared/service',
	'shared/shared',
	'model/stock',
	'collection/stocks',
    'model/base',
    'collection/base',
    'view/26.0.0/products/receivestocks/detail/locations/locations',
	'text!template/26.0.0/products/receivestocks/detail/add/addeditemcontent.tpl.html',
], function ($, $$, _, Backbone, Global, Method, Service, Shared, StockModel, StockCollection,BaseModel,BaseCollection,LocationsView,template) {

    var AdjustmentType = {
        In: "In",
        Out: "Out"
    };
    var _customDropdwon = "#WarehouseDivContainer";
    var StockItemView = Backbone.View.extend({
		_template : _.template( template ),
		tagName : 'tr',
		BindEvents : function(){
			var self = this;

			$(this.classID.CID + this.classID.Item).on("tap", function (e) { e.preventDefault(); self.SetSelected(); });
			$(this.classID.CID + " #quantityDetail").on("tap", function (e) { e.preventDefault(); self.ShowChangeQty(); });
			$(this.classID.CID + " #changeQty").on("keyup", function (e) { e.preventDefault(); self.ComputeQuantityAfter(e); });
			$(this.classID.CID + " #costDetail").on("tap", function (e) { e.preventDefault(); self.ShowChangeCost(); });
			$(this.classID.CID + " #changeCost").on("keyup", function (e) { e.preventDefault(); self.ChangeCost(e); });
			$(this.classID.CID + " #removeContent").on("tap", function (e) { e.preventDefault(); self.RemoveItem(); });
			$(this.classID.CID + " #warehouseCodeDetail").on("tap", function (e) { e.preventDefault(); self.ShowChangeWarehouse(e); });
			$(this.classID.CID + " #drpUM").on("change", function (e) { e.preventDefault(); self.ChangeUM(); });
	//	$(this.classID.CID + " #drpWarehouse").on("change", function (e) { e.preventDefault(); self.ChangeWarehouse(); });
			$(this.classID.CID + " #UMDetail").on("tap", function (e) { e.preventDefault(); self.ShowChangeUM(); });
			$(this.classID.CID + " #changeQty").on("blur", function (e) { e.preventDefault(); self.QuantityAfterBlur(e); });
			$(this.classID.CID + " #changeCost").on("blur", function (e) { e.preventDefault(); self.CostAfterBlur(e); });
									
			// CSL : 8822 >> 06.05.13 >> PREBRON 
				//OLD CODE..
			//$(this.classID.CID+ " #changeQty").on("keydown",function(e){ self.ValidateKeyInput(e,"#changeQty",false); });
			//$(this.classID.CID+ " #changeCost").on("keydown",function(e){ self.ValidateKeyInput(e,"#changeCost",true); });
				//NEW CODE..
			$(this.classID.CID + " #changeQty").on("focus", function (e) {  self.saveAndClearValue("Qty", e); });
			$(this.classID.CID + " #changeCost").on("focus", function (e) { self.saveAndClearValue("Cost", e); });

			
		},
		
		// CSL : 8822 >> 06.05.13 >> PREBRON 
		saveAndClearValue: function (attribute, e) {

        	var elem = this.classID.CID + '#' + e.target.id;
        	var val = $(elem).val();
        	$(elem).val('');        	
        	switch (attribute) {                
                 case "Qty"  : this.lastQTY = val; break;
        	    case "Cost": this.lastCost = val; break;
            }	
        	this.assignNumericValidation(attribute, e);
        },     
		
		assignNumericValidation : function(attribute , e) {        	
        	console.log(attribute + " : " + e.target.id);
        	var elem = this.classID.CID + '#' + e.target.id;
           	switch (attribute) {                
                case "Qty"  : Shared.Input.NonNegativeInteger(elem); break;
                case "Cost" : Shared.Input.NonNegative(elem); break;
            }
        },
		
		initialize : function() {
			this.classID = {
				CID : " #" + this.cid + " ",
				Item: " .itemName ",
                ID: this.cid
			}
			this.render();
		},

		render: function () {
		    this.LoadContentDetails();
		},
		SetSelected: function () {
		    this.trigger('searchItem', this);
		},
		ChangeCost: function (e) {
		    if (e.keyCode === 13) {
		        this.DisplayCost();
		    } else if (e.currentTarget.value == '0.' || e.currentTarget.value == '.') {
		    	$(e.target).val("0.0");
                $(e.target).focus();
                $(e.target).val("0.");    
		    }
		},

		ChangeUM: function () {
		    var warehouseCode = this.model.get("WarehouseCode");
		    var unitMeasureCode = this.$(this.classID.CID + "#drpUM").val();

		    this.ComputeForQtyAfter();
		    //  this.$(this.classID.CID).html(this._template(this.model.toJSON()));
		    this.ReloadTemplate();
		    this.InitializeLocations();
		    this.trigger('refreshTable');
		},

		ChangeWarehouse: function (_warehouseCode) {
		    //  this.$(this.classID.CID + "#drpWarehouse").unbind();
		    $(_customDropdwon).hide();
		    var self = this;
		    var warehouseCode = _warehouseCode;
                // this.$(this.classID.CID + "#drpWarehouse").val();
		    this.cost = parseFloat(this.model.get("Cost"));

		    this.RecalculateQuantity();
		    this.ReinitializeContent(warehouseCode, this.cost);

		    // this.$(this.classID.CID).html(this._template(this.model.toJSON()));
		    this.ReloadTemplate();
		    this.InitializeLocations();

		    this.trigger('refreshTable');
		},

		CheckAdjustmentType: function () {
		    if (this.model.get("AdjustmentType") === 'Out') {
		        $(".inventoryItem-cost").hide();
		    } else {
		        $(".inventoryItem-cost").show();
		    }
		},

		ComputeQuantityAfter: function (e) {
		    if (e.keyCode === 13) {
		        this.RecalculateQuantity();
		        //   this.$(this.classID.CID).html(this._template(this.model.toJSON()));
		        this.ReloadTemplate();
		        //this.LoadUm();
		        this.InitializeLocations();
		        //this.BindEvents();
		        this.trigger('refreshTable');
		    }
		},

		CostAfterBlur: function (e) {
		    this.DisplayCost();
		},

		DisplayContent: function (response) {
		    if (this.stockItemCollection) {
		        this.stockItemCollection.reset();
		    } else {
		        this.stockItemCollection = new StockCollection(response.InventoryAdjustments);
		    }

		    this.warehouseCode = this.stockItemCollection.at(0).get("WarehouseCode");
		    this.unitMeasureCode = this.stockItemCollection.at(0).get("UnitMeasureCode");
		    this.unitMeasureQty = this.stockItemCollection.at(0).get("UnitMeasureQty");
		    this.originalQuantity = this.stockItemCollection.at(0).get("OriginalQuantity");
		    this.quantityAfter = this.stockItemCollection.at(0).get("OriginalQuantity");
		    this.cost = this.stockItemCollection.at(0).get("Cost").toFixed(2);

		    this.model.set({
		        ModelID: this.cid,
		        WarehouseCode: this.warehouseCode,
		        UnitMeasureCode: this.unitMeasureCode,
		        UnitMeasureQuantity: this.unitMeasureQty,
		        OriginalQuantity: this.originalQuantity,
		        Cost: this.cost,
		        QuantityAfter: this.quantityAfter,
		        LocationCode: "Zone1"
		    });

		    this.RecomputeQtyAfter(this.model.get("Quantity"), this.originalQuantity);
		    this.$el.append('<tr id="' + this.cid + '">' + this._template(this.model.toJSON()) + "</tr>");
		    this.trigger('refreshTable');
		    this.CheckAdjustmentType();
		    this.InitializeLocations();
		    this.BindEvents();
		   
		},

		DisplayCost: function () {
		    var cost = parseFloat(this.$(this.classID.CID + "#changeCost").val());
		    if (this.ValidateInputNum(cost) === false) {
		        this.UpdateCost(cost);
		    }
		    if (cost === 0) {
		        this.UpdateCost(cost);
		    }
		    this.HideOtherInput();
		    $(this.classID.CID).html(this._template(this.model.toJSON()));
		    this.InitializeLocations();

		    this.trigger('refreshTable');
		},

		InitializeLocations: function () {
		    if (!this.locationLookup) {
		        this.locationLookup = new StockModel();
		        var self = this;
		        this.locationLookup.url = Global.ServiceUrl + Service.PRODUCT + Method.GETLOCATIONLOOKUP + "100";
		        this.locationLookup.save(null, {
		            success: function (model, response) {
		                if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
		                self.LoadWareHouse(response);
		            }
		        });
		    } else {
		        this.LoadWareHouse();
		        this.CheckAdjustmentType();
		    }
		},

		LoadContentDetails: function () {
		    var stockModel = new StockModel();
		    var self = this;
		    var adjustmentCode = 'to be generated';
		    stockModel.url = Global.ServiceUrl + Service.PRODUCT + Method.GETRECEIVESTOCKITEMDETAILS + this.model.get("ItemCode");
             
		    var onSuccess = function (warehouseCode) {
		        stockModel.set({
		            StringValue: warehouseCode
		        });
		        stockModel.save(null, {
		            success: function (model, response) {
		                if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
		                self.DisplayContent(response);
		            }
		        });
		    }
		    this.ValidateDefaultLocationStatus(onSuccess);
		},

		ValidateDefaultLocationStatus: function (onSuccess) {
		    var tmp = new BaseModel();
		    tmp.url = Global.ServiceUrl + Service.PRODUCT + 'iswarehouseactive/'
		    tmp.set({
		        StringValue: Global.Preference.DefaultLocation
		    });
		    tmp.save(tmp, {
		        success: function (model, response) {
		            if (response.Value) {
		                onSuccess(Global.Preference.DefaultLocation);
		            } else {
		                Shared.ShowNotification("Default Location '" + Global.Preference.DefaultLocation + "' is inactive.", true);
		                onSuccess();
		            }
		        },
		        error: function (model, error, response) {
		            onSuccess();
		        }
		    });
		},

		LoadUm: function () {
		    var _wareHouse = this.stockItemCollection.at(0).get("WarehouseCode");
		    this.$(this.classID.CID + '#drpUM > option[val !=""]').remove();
		    var self = this;
		    this.stockItemCollection.each(function (model) {
		        if (_wareHouse == model.get("WarehouseCode")) {
		            var _um = model.get("UnitMeasureCode");
		            self.$(self.classID.CID + "#drpUM").append(new Option(_um, _um));
		        }

		    });
		},

		LoadWareHouse: function (response) {
		    var self = this;
		    var warehouseCode = "";
		    if (!Shared.IsNullOrWhiteSpace(response)) {
		        if (!this.locationCollection) this.locationCollection = new StockCollection();
		        this.locationCollection.reset(response.Warehouses);
		    }
		    if (Shared.IsNullOrWhiteSpace(this.warehouseCollection)) this.warehouseCollection = new BaseCollection();
		    this.warehouseCollection.reset();
		   // this.$(this.classID.CID + '#drpWarehouse > option').remove();
		    this.locationCollection.each(function (model) {
		        if (model.get("IsActive")) {
		            if (model.get("WarehouseCode") != warehouseCode) {
		                //this.$(self.classID.CID + "#drpWarehouse").append(new Option(model.get("WarehouseCode"), model.get("WarehouseCode")));
		                self.warehouseCollection.add(model);
		                warehouseCode = model.get("WarehouseCode");
		            }
		        }
		    });

		  //  this.$(this.classID.CID + '#drpWarehouse').val(this.model.get("WarehouseCode"));
		    this.CheckAdjustmentType();
		    this.BindEvents();
		},

		QuantityAfterBlur: function (e) {
		    this.RecalculateQuantity();
		    //  this.$(this.classID.CID).html(this._template(this.model.toJSON()));
		    this.ReloadTemplate();
		    this.InitializeLocations();
		    this.trigger('refreshTable');
		},

		RecalculateQuantity : function(){
		    var qty = parseInt(this.$(this.classID.CID+"#changeQty").val());
		    if(this.ValidateInputNum(qty) === false){
		    	this.UpdateQuantity(qty);
		    }

		    if(qty === 0){
		    	this.UpdateQuantity(qty);
		    }	
		},

		RecomputeQtyAfter : function(quantity, originalQuantity){
		    var qtyAfter = 0.00;
		    var qty = parseInt(quantity);
		    var origQty = parseInt(originalQuantity);

		    if (Shared.IsNullOrWhiteSpace(qty) || qty > 0) {
		        if (this.model.get("AdjustmentType") === AdjustmentType.In) {
		            qtyAfter = (originalQuantity) + qty;
		        } else {
		            qtyAfter = (originalQuantity) - qty;
		        }

		        this.model.set({
		            QuantityAfter: qtyAfter,
		            Quantity: qty
		        });
		    }
		},

		ReinitializeContent: function (wareHouseCode, cost) {
		    var self = this;
		    var stockModel = new StockModel();
		    var finalCost = "";

		    //if (Shared.IsNullOrWhiteSpace(cost)) {
		    //    finalCost = this.cost;
		    //} else {
		    //    finalCost = cost;
		    //}
		    if(!(Shared.IsNullOrWhiteSpace(cost))){finalCost = cost};

		    var onSuccess = function (defaultWarehouse) {

		        stockModel.set({
		            StringValue: defaultWarehouse
		        });

		        stockModel.url = Global.ServiceUrl + Service.PRODUCT + Method.GETRECEIVESTOCKITEMDETAILS + self.model.get("ItemCode");
		        stockModel.save(null, {
		            success: function (model, response) {
		                if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
		                self.ReintializeContentCompleted(response, finalCost);
		            }
		        });
		    }
		    if (!Shared.IsNullOrWhiteSpace(wareHouseCode)) {
		        onSuccess(wareHouseCode);
		        return;
		    }
		    this.ValidateDefaultLocationStatus(onSuccess);
		},

		ReintializeContentCompleted : function(response, finalCost){ // UPDATE VIEW

			this.warehouseCode = response.InventoryAdjustments[0].WarehouseCode;
			this.unitMeasureCode = response.InventoryAdjustments[0].UnitMeasureCode;
			this.unitMeasureQty = response.InventoryAdjustments[0].UnitMeasureQty;
			this.originalQuantity = response.InventoryAdjustments[0].OriginalQuantity;
			this.quantityAfter =  response.InventoryAdjustments[0].OriginalQuantity;
			
			if (Shared.IsNullOrWhiteSpace(finalCost)) {
				this.cost = response.InventoryAdjustments[0].Cost.toFixed(2);
			}else{
			    this.cost = parseFloat(finalCost).toFixed(2);
			}
		 	this.model.set({
		 		ModelID : this.cid,
 				WarehouseCode :this.warehouseCode ,
 				UnitMeasureCode : this.unitMeasureCode,
 				UnitMeasureQuantity : this.unitMeasureQty,
 				OriginalQuantity : this.originalQuantity ,
 				Cost : this.cost,
 				QuantityAfter : this.quantityAfter,
 				LocationCode : "Zone1"
		 	});

		 	this.RecomputeQtyAfter(this.model.get("Quantity"), this.originalQuantity);
		    //this.$(this.classID.CID).html(this._template(this.model.toJSON()));
		 	this.ReloadTemplate();
			this.CheckAdjustmentType();
			this.InitializeLocations();
			this.trigger('refreshTable');
		},
		ReloadTemplate: function () {
		    this.$(this.classID.CID).html(this._template(this.model.toJSON()));
		    this.trigger('refreshTable');		
		},
		RemoveItem: function () {
		    this.$(this.classID.CID).remove();
		    this.trigger('RemoveItem',this.model);
		    this.trigger('refreshTable');
		   // this.model.destroy();
		},

		ShowChangeQty: function () {
		    this.$(this.classID.CID + "#quantityDetail").hide();
		    this.$(this.classID.CID + "#changeQuantity").show();
		    this.$(this.classID.CID + "#changeQty").focus();
		    var qty = parseFloat(this.$(this.classID.CID + "#changeQty").val());
		    this.trigger('refreshTable');

		},
		HideOtherInput: function () {
		    this.trigger('HideOtherInputs');
		},
		ShowChangeUM: function () {
		    this.HideOtherInput();
		    this.$(this.classID.CID + "#UMDetail").hide();
		    this.$(this.classID.CID + "#changeUm-div").show();
		    this.$(this.classID.CID + "#drpUM").val(this.model.get("WarehouseCode"));
		    this.trigger('refreshTable');
		},

		ShowChangeWarehouse: function (e) {
		    this.HideOtherInput();
		    this.GetCoordinates(e);
		    //this.$(this.classID.CID + "#warehouseCodeDetail").hide();
		  //  this.$( this.classID.CID + "#changeWarehouse-div").show();
		    //this.$(this.classID.CID + "#drpWarehouse").show();
		    //this.$(this.classID.CID + "#drpWarehouse").val(this.model.get("WarehouseCode"));
		    //this.trigger('refreshTable');
		},
		GetCoordinates: function (e) {

		    if (this.isStillLoading) return;

		    var el_id =  "warehouseCodeDetail";
		    var x_coord = e.offsetX ? (e.offsetX) : e.pageX - document.getElementById(el_id).offsetLeft;
		    var y_coord = e.offsetY ? (e.offsetY) : e.pageY - document.getElementById(el_id).offsetTop;
		    if (Global.isBrowserMode) {
		        var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
		        if (is_chrome) {
		            var x = new Number();
		            var y = new Number();
		            x = e.clientX;
		            y = e.clientY;
		            x_coord = x; y_coord = y;
		        }
		    }
		    
		    this.isStillLoading = true;
		    var tmp = new StockModel();
		    var self = this;
		    tmp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETLOCATIONLOOKUP + "100";
		    tmp.save(null, {
		        success: function (model, response) {
		            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
		            self.LoadWareHouse(response);
		            self.ShowWarehouseOption(x_coord, y_coord);
		            self.isStillLoading = false;
		        },
		        error: function () {
		            self.ShowWarehouseOption(x_coord, y_coord);
		            self.isStillLoading = false;
		        }
		    });

		},
		ShowWarehouseOption : function(x_coord, y_coord) {
		    var locationsView = new LocationsView({
		        el : _customDropdwon,
		        collection: this.warehouseCollection,
                model : this.model
		    });
		    locationsView.on('selected', this.ChangeWarehouse, this);
		    locationsView.InitializeChildviews();
		    locationsView.Show(x_coord, y_coord);
		    this.WarehouseOnPopUp();
		},
		WarehouseOnPopUp : function(){
		    var self = this;
		    $(document).on('tap', function (e) {
		        var src = $(e.target);

		        if (src.hasClass('popupHundler') === false) {
		            self.WarehouseOutsideMenuHundler();
		        }
		    });
		},
		WarehouseOutsideMenuHundler : function(){
		    $(_customDropdwon).hide();
		},

		ShowChangeCost: function (e) {
		    this.HideOtherInput();
		    this.$(this.classID.CID + "#costDetail").hide();
		    this.$(this.classID.CID + "#changeCost-div").show();
		    this.$(this.classID.CID + "#changeCost").focus();
		    this.trigger('refreshTable');
		},

		UpdateCost: function (cost) {
		    this.model.set({ Cost: cost.toFixed(2) });
		},

		UpdateQuantity: function (qty) {
		    var origQty = parseInt(this.model.get("OriginalQuantity"));
		    var qtyAfter = 0.00;

		    if (this.model.get("AdjustmentType") === AdjustmentType.In) {
		        qtyAfter = (origQty) + qty;
		    } else {
		        qtyAfter = (origQty) - qty;
		    }

		    this.model.set({
		        QuantityAfter: qtyAfter,
		        Quantity: qty
		    });
		},

        ValidateInputNum : function(num){
            if (Shared.IsNullOrWhiteSpace(num) || num < 0) {
                return true;
            }
            return false;
        },
	});
    return StockItemView;
});
