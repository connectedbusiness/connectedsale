/**
 * Connected Business | 05-14-2012
 * Required: model 
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/enum',
	'shared/global',
	'shared/method',
	'shared/service',
	'shared/shared',
	'view/22.0.0/pos/reason/itemreason',
	'view/22.0.0/pos/manageroverride/manageroverride',
	'model/reason',
	'model/override',
	'model/lookupcriteria',
    'model/base',
    'collection/base',
	'collection/reasons',
	'collection/currentorders',
	'collection/stocks',
	'text!template/22.0.0/pos/itemdetail/item.tpl.html'	
],function($, $$, _, Backbone, Enum, Global, Method, Service, Shared,
	ItemReasonView, ManagerOverrideView, 
	ReasonModel, OverrideModel, LookupCriteriaModel, BaseModel,
	BaseCollection,ReasonCollection,CurrentOrderCollection,StockCollection, ItemTemplate){
	
	var _model,_rows = 100,_criteria = "",_itemCode = "",_warehouseCode = "";
	
	var _applyDiscountToAll = function(button){
		if(button === 1){
			//var _discount = parseFloat($("#discount-input").val());
			//_model.applyDiscountToAll(_discount);
			_model.discountItem();
		}else{ return; }		
	}	 
    
    var _currentInstance;
	var _applyDiscountToAllIfItemDiscountNotAllowed = function(button){
		if(button === 1){ 
            _applyDiscountToAll(1);
		}else{ 
            if(_model) $("#discount-input").val(_model.get("Discount"));    
            else $("#discount-input").val(0);   
        }
        _currentInstance.PreventApplyDiscountConfirmation = false;
	}	 
	
	var RemoveItem = function(button){
		if(button === 1){
			_itemView.RemoveThisItem();
		}
		else { 	return; }
	}
			
 	var ItemDetailView = Backbone.View.extend({
 		_template : _.template(ItemTemplate), 		
 		
 		events:{
 			/** Keyup Events **/
 			"keyup #price-input" 			   : "inputPrice_KeyUp", 
 			//"keyup #discount-input" 		   : "inputDiscount_KeyUp",
 			//"keyup #qtyOrdered-input" 	   : "inputQtyOrdered_KeyUp",
 			
    		"tap .add" 				           : "add_touchstart",
    		"tap .minus" 			           : "minus_touchstart",
    		"tap #applyDiscount" 	           : "applyDiscount_touchstart",
    		"tap #applyItemDiscount"           : "applyItemDiscount_touchstart",
    		"change #qtyOrdered-input" 		   : "inputQtyOrdered_changed",
    		"change #price-input" 			   : "inputPrice_changed",    		
    		
    		"focus #discount-input" 		   : "inputDiscount_Focus",
    		"keypress #discount-input"		   : "inputDiscount_Keypress",
    		//"change #discount-input" 		   : "inputDiscount_changed",
    		"tap #li-freestock" 		       : "liFreestock_touchstart",
    		"tap #li-accessory" 			   : "liAccessory_touchstart",
    		"tap #li-substitute" 			   : "liSubstitute_touchstart",    
    		"tap #li-serialLot"                : "liSerialLot_touchstart",		
    		"tap #li-notes"                    : "liNotes_touchstart",
    		"change #itemDetail-umList"        : "selectUnitMeasure_touchstart",
    		"change #itemDetail-warehouseList" : "selectWarehouseCode_touchstart",
    		"tap #itemDetail-warehouseList"    : "selectWarehouseCode_tap",
    		
    	/*Events Added for INTMOBA-278 */      	
    	    //quantity field    	
    	    "focus #qtyOrdered-input"   	   : "qty_focus",
    	    "tap #qtyOrdered-input" 		   : "qtyOrdered_tapped",        	      	
    	 	"blur #qtyOrdered-input"		   : "ValidateValue_FocusChanged",   
    	 	"tap #qtyOrdered-inputClearBtn"	   : "ClearText",  
    	 		
    		//price field events   
    	 	"keypress #price-input"             : "Price_Keypress",
 		    "keyup #price-input"                : "Price_Keyup",
    		"focus #price-input"   			   : "price_focus",  	
    		"tap  #price-input" 			   : "ChangePrice_tapped", 	   	    
    		"blur #price-input"				   : "ValidateValue_FocusChanged",  	
    		"tap  #price-inputClearBtn"		   : "ClearText", 	  		  
    		
    		//Discount field events.    			
    		"blur #discount-input"			   : "ValidateValue_FocusChanged",     
    		"tap  #discount-inputClearBtn"	   : "ClearText",     		

    		//WHMCS-986183 
    		"tap #itemDetail-umList"           : "selectUnitMeasure_tap",  	    		  		
    		
    	 /**See details @ http://203.177.136.156:8080/browse/INTMOBA-281 ********/    	
    		"tap  #btn-remove-item"		       : "btnRemove_tap"

    			
    		
    	//**************************** End *********************************
    		
		},
		
 		render: function (_model, type) {

			this.model = _model;
			this.type = type;
			this.ManageBinding();

			if(this.model._callbacks.discounted) this.model._callbacks.discounted = null;
			this.model.on("change", this.UpdateValue, this);
			this.model.on("discounted", this.ApplyDiscountToAllWithValidation, this);	
			this.model.on("revertWarehouseCode", this.revertWarehouseCode, this);

			//CSL-1068 - Order Notes
			this.$el.html(this._template(this.model.toJSON()));			

			_warehouseCode = this.model.get("WarehouseCode");
			this.LoadWareHouseCodes();
			this.delegateEvents();			
			this.ToggleFields();
			this.ToggleButtons();			
	
            //jj - to check if the item is in the current order list
            var itemCode = this.model.get('ItemCode'), 
            	lineNum = this.model.get('LineNum');
            this.isCurrentOrder = false;
            var self = this;
            if(Global.CurrentOrders != undefined && Global.CurrentOrders != null){
            	this.currentOrderCollection = new CurrentOrderCollection();
            	this.currentOrderCollection = Global.CurrentOrders;
            	this.currentOrderCollection.each(function(model){
            		if(model.get('ItemCode') === itemCode && model.get('LineNum') == lineNum){
            			self.isCurrentOrder = true;
            		}
            	})
           }
            
            
            //JIRA INTMOBA-418 * FIGUEROA * 12/28/2012
            
            if (this.isCurrentOrder === true) {
                this.$("#btn-remove-item").addClass("ui-disabled");
            }
            //old code
            //if(Global.TransactionType == Enum.TransactionType.SalesPayment || /*Global.TransactionType == Enum.TransactionType.SalesRefund ||*/ Global.TransactionType == Enum.TransactionType.VoidTransaction){ 
            //    this.$("#btn-remove-item").addClass("ui-disabled");
            //    this.$("#itemDetail-umList").addClass("ui-disabled"); 
            //    this.$('#itemDetail-warehouseList').addClass("ui-disabled");
            //    this.$("#price-input").attr('readonly',true);                 
            //}
            //else if(Global.TransactionType == Enum.TransactionType.SalesRefund)
            //{            	
            //	this.$("#price-input").attr('readonly',true);

            //	//disable changing of UM for items that came from invoice
            //	if (this.model.get("IsNewLine") != true) {
            //		this.$("#itemDetail-umList").addClass("ui-disabled");
            //	}
            //}

            //if (this.$("#controlGroup-btn").hasClass("ui-disabled")) {
            //    this.$("#controlGroup-btn").removeClass("ui-disabled");
            //    this.$("#btn-remove-item").removeClass("ui-disabled");
            //}

		    //this is the replacement of the code above.
            switch (Global.TransactionType) {
                case Enum.TransactionType.SalesPayment:
                case Enum.TransactionType.VoidTransaction:
                    this.$("#btn-remove-item").addClass("ui-disabled");

                    this.$("#itemDetail-umList").attr('disabled', true);
                    this.$("#itemDetail-umList").addClass("ui-disabled");

                    this.$("#itemDetail-warehouseList").attr('disabled', true);
                    this.$('#itemDetail-warehouseList').addClass("ui-disabled");
                    this.$("#price-input").attr('readonly', true);
                    break;
                case Enum.TransactionType.SalesRefund:
                    this.$("#price-input").attr('readonly', true);

                    //disable changing of UM for items that came from invoice
                    if (this.model.get("IsNewLine") != true) {
                        this.$("#itemDetail-umList").attr('disabled', true);
                        this.$("#itemDetail-umList").addClass("ui-disabled");
                    }
                    break;
                case Enum.TransactionType.ConvertOrder:
                    if (!this.model.get("IsNewLine")) {
                        this.$("#itemDetail-umList").attr('disabled', true);
                        this.$("#itemDetail-umList").addClass("ui-disabled");
                    }
                    break;

            }

            console.log('item type :' + this.model.get('ItemType'));

            //var _itemType = this.model.get('ItemType'); 
            //if( _itemType == Enum.ItemType.Service || _itemType == Enum.ItemType.GiftCard 
            //	|| _itemType == Enum.ItemType.GiftCertificate || _itemType == Enum.ItemType.NonStock)  {
            //	this.$('#li-freestock').addClass('ui-disabled');
            //	this.$('#itemDetail-warehouse').hide();
            	
            //}

            switch (this.model.get('ItemType')) {
                case Enum.ItemType.Service:
                case Enum.ItemType.GiftCard:
                case Enum.ItemType.GiftCertificate:
                case Enum.ItemType.NonStock:
                    this.$('#li-freestock').addClass('ui-disabled');
                    this.$('#itemDetail-warehouse').hide();
                    break;
            }
            	
            if(Global.TransactionType == Enum.TransactionType.Recharge) this.DisableControls();         
			return this;
		},

		DisableControls : function() {
			this.$("#qtyOrdered-input").attr('readonly', true);
			this.$("#price-input").attr('readonly', true);
			//this.$("#discount-input").attr('readonly', true);

			this.$("#itemDetail-umList").attr('disabled', true);
			this.$("#itemDetail-umList").addClass('ui-disabled');

			this.$("#itemDetail-warehouseList").attr('disabled', true);
			this.$("#itemDetail-warehouseList").addClass('ui-disabled');

			this.$("#btn-remove-item").addClass("ui-disabled");
			this.$("#li-notes").addClass("ui-disabled");
		},
		
		revertWarehouseCode : function(model){
		    this.model.set({ WarehouseCode: this.warehouseCode }, { silent: true });
		    //$("#itemDetail-warehouseList > option[value='" + this.warehouseCode + "']").attr("selected", "selected");
		
		    //this.$('#itemDetail-warehouseList option[value=' + this.warehouseCode + ']').attr("selected", "selected");
		    this.$('#itemDetail-warehouseList').val(this.warehouseCode);
		    this.$('#itemDetail-warehouseList').trigger('change');
			this.$('#itemDetail-warehouseList').selectmenu();
			this.$('#itemDetail-warehouseList').selectmenu("refresh");
		},
		
		LoadWareHouseCodes : function(){
			var self = this;

			var _itemCode = this.model.get("ItemCode");
			this.warehouseCollection = new StockCollection();
			if(this.model.get("Status") == "P") this.warehouseCollection.url = Global.ServiceUrl + Service.PRODUCT + 'getactivewarehousebyitemstatus/' + this.model.get("ItemCode");
			else this.warehouseCollection.url = Global.ServiceUrl + Service.PRODUCT + Method.GETACTIVEWAREHOUSE;

            this.DisableWarehouse();

			this.warehouseCollection .fetch({
				success : function(collection, response){
					self.LoadRetreiveWareHouseCode(response.Warehouses);
				},
				error : function(collection, error, response){
					collection.RequestError(error, "Error Loading Stock Location")
				}
			});
		},
		
        IsMultiLocation : function(){
            if(!Global.AccountingPreference) return false;
            if(!Global.AccountingPreference.IsLocation) return false;
            return true;
        },

        DisableWarehouse : function(){
            if(this.IsMultiLocation() || (Global.TransactionType == Enum.TransactionType.ConvertOrder && this.isCurrentOrder == true)) {
            	//this.$el.find('#itemDetail-warehouseList').closest('.ui-select').addClass('ui-disabled');
                this.$("#itemDetail-warehouseList").attr('disabled', true);
                this.$("#itemDetail-warehouseList").addClass('ui-disabled');
                this.$("#itemDetail-warehouse .ui-icon-arrow-d").addClass('ui-disabled');
            }
        },

		LoadRetreiveWareHouseCode : function(warehouse){
			$('#itemDetail-warehouseList > option[val !=""]').remove(); 
			this.$('#itemDetail-warehouseList').append(new Option(_warehouseCode, _warehouseCode));//DEFAULT WAREHOUSECODE
			this.$('#itemDetail-warehouseList').selectmenu();
			this.$('#itemDetail-warehouseList').selectmenu("refresh");
            this.warehouseCollection.reset(warehouse);
			this.warehouseCollection.each(this.LoadWareHouseCodeOptions,this);
            this.DisableWarehouse();
		},
		
		LoadWareHouseCodeOptions : function(warehouse){
			var isActive = warehouse.get("IsActive");
			var warehouse = warehouse.get("WarehouseCode");
			var self = this,
                itemDetailWarehouseList = self.$('#itemDetail-warehouseList'),
			    itemDetailWarehouseListOption = self.$('#itemDetail-warehouseList option');
		
            if (warehouse != _warehouseCode && isActive) {
                var exists = false;
                itemDetailWarehouseListOption.each(function () {
                    if (this.value == warehouse) {
                        exists = true;
                        return false;
                    }
                });
                if (!exists) {
                    itemDetailWarehouseList.append(new Option(warehouse, warehouse));
                }
				//this.$('#itemDetail-warehouseList').append( new Option(warehouse,warehouse) );
			}
			
		},

		selectWarehouseCode_tap: function (e) {
		    e.stopPropagation();
		    if (this.IsMultiLocation()) {
		        navigator.notification.alert("The account set up in Accounting Preference is By Location, the system will not allow you to change the location per line item.\n Please open Connected Business to change this preference.", null, "Action not allowed", "OK");
		        return;
		    } 
		},
		
		selectWarehouseCode_touchstart: function(e) {
		    e.stopPropagation();
		    var warehouse = $("#itemDetail-warehouseList option:selected").val();

		    this.warehouseCode = this.model.previous("WarehouseCode");
		    this.model.set({ WarehouseCode: warehouse });
		    if(Global.TransactionType == Enum.TransactionType.SalesRefund && this.model.get("Outstanding")) return;
		    this.ViewWarehouseCode();
		},

		//INTMOBA-278 : Nov. 06, 2012   
		DisplayClearBtn : function(e){			
	    	e.stopPropagation();	    	
			var _id = e.target.id;
    		var _val 		= $("#"+_id).val();
	   		var _strLength 	= _val.length;
	  		var _pos 		= $("#"+_id).position(); // retrieves the position of the given element
	    	var _width		= $("#"+_id).width();
	    	
	    	if (_strLength <= 0) {        						
				this.HideClearBtn();
			} else {					    		
	    		if(_pos !== null || _pos !== "") {
	    			$("#"+_id+"ClearBtn").css({top: (_pos.top + 7), left: (_pos.left + 5)});	  			
   				}   	
   				$("#"+_id+"ClearBtn").show();   				      		
   			}
	    },
	    
	    qtyOrdered_tapped :   function(e){ 	
	    	e.stopPropagation();
	    	if(Global.TransactionType == Enum.TransactionType.VoidTransaction || Global.TransactionType == Enum.TransactionType.SalesPayment || 
	    		Global.TransactionType == Enum.TransactionType.Recharge ) return;    	 	
	    	setTimeout(function() {$("#qtyOrdered-input").val("");}, 500);
	    	//$("#qtyOrdered-input").val("");
	    },
	    
	    ChangePrice_tapped : function(e){ 	 
	    	e.stopPropagation();
	    	if(Global.TransactionType == Enum.TransactionType.VoidTransaction || Global.TransactionType == Enum.TransactionType.SalesPayment || 
	    		Global.TransactionType == Enum.TransactionType.SalesRefund || Global.TransactionType == Enum.TransactionType.Recharge) return;

	    	if(!Global.Preference.AllowChangePrice) return;
	    	//this.qtyFocused = false;
	    	if(this.type !="Kiosk")
	    	{
	    		var _id = e.target.id;	    		    	
	    	    $("#"+_id).val("");
	    	}    	 	    	    		
	    	
	    },
	    
	    HideClearBtn : function(){ 	  	    	    		
	    		$(".clearTextBtn").fadeOut();	  
	    },
	    
	    ClearText : function(e){	    	
	    	if(Global.TransactionType == Enum.TransactionType.Recharge) return;
	    	var _id = e.target.id;
	    	var id = _id.substring(0, _id.indexOf('ClearBtn'));	 
	    	$("#"+id).val("");
    		$(".clearTextBtn").hide();	
	    },
	    
        // GEMINI: CSL-5338
        IsElementReadOnly : function(_id){
            if ($('#'+_id).is('[readonly]')) return true;
            return false;
        },
        	    
	    ValidateValue_FocusChanged : function (e){	      
	    	e.preventDefault(); 	
	    	
	    	var _id = e.target.id;		  		
	    	var _val = this.$("#" + _id).val().trim();
	    	if(_val === "") { }
	    	if($.isNumeric(_val) === false) {	    		
	    		if(_id === null) { }
                if(this.IsElementReadOnly(_id)) return; // GEMINI: CSL-5338
                if (_id === "price-input") {
                        this.UpdatePriceWithValidation();
	    		}		
	    		if (_id === "discount-input"){	
	    			if(Global.ReasonCode.Discount && Global.ReasonViewRendered) return; // GEMINI : CSL-9493 
	    			this.UpdateDiscountWithValidation();	
	    		}
	    		if (_id === "qtyOrdered-input" ) {
	    			console.log('ValidateValue_FocusChanged : UpdateFieldValue');
	    			//this.UpdateFieldValue("QuantityOrdered");	    			
	    		}  	    			  
	    	}
	    	//this.$("#qtyOrdered-input").unbind('focus');
	    	$(".clearTextBtn").hide();		    	
	    },	
	    
	    
	    //Nov. 14, 2012 : INTMOBA-281 
	    btnRemove_tap : function(e) {
	        e.preventDefault();
	        console.log("culprit");
			this.CheckReason(Enum.ActionType.VoidItem);	
		},
		
		RemoveItemNotification : function() {			
			_itemView = this;
			navigator.notification.confirm("Are you sure you want to remove this item inside from your transaction?",RemoveItem,"Remove Item",['Yes','No']);
		},
		
		RemoveThisItem : function(){			
			this.model.removeItem();
			this.trigger("RemoveItem");
		},	    
	    //INTMOBA-281 : end

		ManageBinding : function() {
			//Display Defective instead of Quantity Ordered for Return/Refund transactions
			switch (Global.TransactionType) {
				case Enum.TransactionType.SalesRefund :
					this.model.set({
					    QuantityDisplay: this.model.get("Good") //Originally Defective
					}, {silent: true})
				break;
				default :
					this.model.set({
						Outstanding : 0,
						QuantityDisplay : this.model.get("QuantityOrdered")
					}, {silent: true});
				break;
			}
		},
		
		add_touchstart : function(e) {
			e.stopImmediatePropagation();
			if(Global.TransactionType == Enum.TransactionType.Recharge) return;
			this.AddQuantityOrdered();
		},
		
		minus_touchstart : function(e) {
			e.stopImmediatePropagation();
			if(Global.TransactionType == Enum.TransactionType.Recharge) return;
			if(Global.TransactionType == Enum.TransactionType.ConvertQuote) if(this.model.get("QuantityOrdered") == 0) return;
			this.SubtractQuantityOrdered();
		},
		
		applyDiscount_touchstart : function(e) {			
			e.stopImmediatePropagation();
			//if(Global.TransactionType == Enum.TransactionType.Recharge) return;

			//CSL - 8822 : 06.10.2013
			var discValue = $('#discount-input').val();
			if(discValue.length === 0) { $('#discount-input').val(this.currentDiscValue) }
			else { if(!$.isNumeric(discValue)) $('#discount-input').val(parseFloat(discValue)); }
			if(!this.ValidateDiscount("DiscountAll")) return; 
			//End CSL - 8822 
            if(this.PreventApplyDiscountConfirmation) return;      
			_model = this.model;
            _currentInstance = this;
			if(this.itemDiscountTimeOut) clearTimeout(this.itemDiscountTimeOut);
			this.model.discountItem();
		},

		applyItemDiscount_touchstart : function(e) {
			e.stopImmediatePropagation();	
			//if(Global.TransactionType == Enum.TransactionType.Recharge) return;

			if(Global.Preference.AllowItemDiscount){	
            	var _val = $("#discount-input").val().trim();
            	if(_val != "" || _val === 0) {	      
            		if(this.ValidateDiscount("Discount")) {
            			this.UpdateDiscountWithValidation();
            		}	    					
            	} 		
            }
		},
		
		AddQuantityOrdered: function() {
			if (Global.TransactionType === Enum.TransactionType.SalesPayment || Global.TransactionType === Enum.TransactionType.VoidTransaction) {
    			return;
    		}
			this.model.addQuantity();	
            this.ToggleFields();	
    	},
		
        ValidateSubtractQuantity : function() {
           var condition1 = this.model.get("QuantityOrdered") === 1;
		   var condition2 = (Global.TransactionType != Enum.TransactionType.Sale || Global.ApplicationType === "Kiosk");
		   if(condition1 && condition2) return false;
            return true;
        },

		SubtractQuantityOrdered : function() {
			if (Global.TransactionType === Enum.TransactionType.SalesPayment || Global.TransactionType === Enum.TransactionType.VoidTransaction) {
    			return;
    		}
			if (this.ValidateSubtractQuantity()) {
				if(this.IsAllowedToDeductQuantity()) {
					this.model.subtractQuantity();
                	this.ToggleFields();
				}
            }		
    	},

    	IsAllowedToDeductQuantity : function() {    
    		var _itemType = this.model.get("ItemType");
    		var _qty = this.model.get("QuantityOrdered");

    		if (Global.TransactionType !== Enum.TransactionType.SalesRefund) {
    			if (Global.TransactionType !== Enum.TransactionType.Sale) {    				
					if(_qty == 1) {
						navigator.notification.alert("This item must have at least 1 quantity.",null,"Quantity Required","OK"); 
						return false; 
					}				
				} else {
					if(this.IsGiftCredits(_itemType) && _qty == 1) {
						navigator.notification.alert("This item must have at least 1 quantity.",null,"Quantity Required","OK"); 
						return false; 
					}						
				}				
    		}

    		if(this.IsGiftCredits(_itemType)){ 
    			if(this.IsZero(_qty)){    
    				navigator.notification.alert("Negative quantity is not allowed for "+ _itemType + " item", null, "Negative Quantity","OK");   
    				return false; 				
    			}
    		}   		
    		return true;
    	},

    	IsValidGiftCreditsQty : function(value) {
    		var _itemType = this.model.get("ItemType");
			if(this.IsNegative(value)){    
				navigator.notification.alert("Negative quantity is not allowed for "+ _itemType + " item", null, "Negative Quantity","OK"); 						 
				return false; 				
			}    		
    		return true;
    	},

    	IsGiftCredits : function() {
    		var _itemType = this.model.get("ItemType")
    		if ( _itemType == Enum.ItemType.GiftCard || _itemType == Enum.ItemType.GiftCertificate) return true;
    		return false;
    	},

    	IsZero : function(value) {
    		if(value == 0) return true;    		
    		return false;
    	},

    	IsNegative : function(value) {
    		if(value < 0) return true;
    		return false;
    	},
    	
    	UpdateValue : function() {
    		switch (Global.TransactionType) {
    			case Enum.TransactionType.SalesRefund : 
    			    this.$("#qtyOrdered-input").val(this.model.get("Good")); //Originally Defective
    				break;
    			default :
    			 	this.$("#qtyOrdered-input").val(this.model.get("QuantityOrdered"));
    				break;
    		}
    	},
    	
    	inputPrice_KeyUp : function(e) {
    		if(Global.TransactionType == Enum.TransactionType.Recharge) return;
    		var _val = $("#price-input").val().trim();	    	
			if(e.keyCode === 13){			  
			    if (_val != "") {
			        if (Shared.IsNullOrWhiteSpace(this.isPriceChangeTriggered)) {
			            this.UpdatePriceWithValidation();
			        }
			        this.isPriceChangeTriggered = false;
               }
    		} else {
    			this.DisplayClearBtn(e);
    		}
		},
		
		inputPrice_changed : function() {
			//alert(Global.Preference.AllowChangePrice);
			if(Global.Preference.AllowChangePrice && ((Global.TransactionType != Enum.TransactionType.SalesRefund && Global.TransactionType != Enum.TransactionType.Return) && Global.TransactionType != Enum.TransactionType.SalesPayment && Global.TransactionType != Enum.TransactionType.VoidTransaction) && this.model.get('ItemType') != Enum.ItemType.Kit){				
				var _val = $("#price-input").val().trim();
				if (_val != "") {
				    this.isPriceChangeTriggered = true;
				    this.UpdatePriceWithValidation();
				}
			}else{
				navigator.notification.alert("Changing the item price is not allowed.", null, "Action Not Allowed", "OK");
			}		
		},
		
		inputQtyOrdered_KeyUp : function(e) {
			e.preventDefault();
			if(Global.TransactionType == Enum.TransactionType.Recharge) return;
			if(e.keyCode === 13){
                //*****
                //The following lines were commented to prevent showing of messages since inputPrice_changed alone will be enough.
                //*****	
               var _val = $("#qtyOrdered-input").val().trim();	
                if(_val != "") {	
                	//this.UpdateFieldValue("QuantityOrdered");				
                } 
			} else {
				this.DisplayClearBtn(e);
			}
		},
		
		inputQtyOrdered_changed : function(e) {			
			e.preventDefault();
			var _val = $("#qtyOrdered-input").val().trim();	
			if(_val != "") {
				if(_val == this.myQty) {return;}
                this.myQty = _val;
				this.UpdateFieldValue("QuantityOrdered");
                this.ToggleFields();
			} 	
		}, 
		
        HasCoupon : function(){
            if(!Global.Coupon) return false;
            if(!Global.Coupon.get("CouponCode") || Global.Coupon.get("CouponCode") == "") return false;
            return true;
        }, 

		inputDiscount_KeyUp : function(e) {
			//if(Global.TransactionType == Enum.TransactionType.Recharge) return;
			if(e.keyCode === 13){			 
            	//*****
            	//The following lines were commented to prevent showing of messages since inputDiscount_changed alone will be enough.
           		//*****
           		//this.$("#discount-input").off('change');
            	if(Global.Preference.AllowItemDiscount){	
            		var _val = $("#discount-input").val().trim();
            		if(_val != "") {	
            			this.UpdateDiscountWithValidation();							
            		} 		
            	}
			} else {
				this.DisplayClearBtn(e);
			}
		},
		
		// inputDiscount_changed : function() {
		// 	if(Global.ReasonCode.Discount && Global.ReasonViewRendered) return;
		// 	if(Global.Preference.AllowItemDiscount){				
		// 		var _val = $("#discount-input").val().trim();
		// 		//var field = "discount-input";	
		// 		if(_val != "") {
		// 			//this.DisplayClearBtn(field);
		// 			this.UpdateDiscountWithValidation();
		// 		}
		// 	}else{
  //               if(Global.Preference.AllowSaleDiscount){
  //                   this.PreventApplyDiscountConfirmation = true;
  //                   _model = this.model;
  //                   _currentInstance = this;
  //                   navigator.notification.confirm("Changing the item discount is not allowed.\nDo you want to apply the discount to the entire transaction?", 
  //                                                   _applyDiscountToAllIfItemDiscountNotAllowed, "Transaction Discount", "Yes,No");
  //                   return;
  //               }
		// 		navigator.notification.alert("Changing the item discount is not allowed.", null, "Action Not Allowed", "OK");
		// 		$("#discount-input").val("");
		// 	}	
		// }, 
		
		inputDiscount_Focus : function(e) {
			Shared.Input.NonNegative('#' + e.target.id);
			this.qtyFocused = false;
			if (Global.TransactionType === Enum.TransactionType.SalesRefund || Global.TransactionType === Enum.TransactionType.SalesPayment ||
			 Global.TransactionType === Enum.TransactionType.VoidTransaction) return;
			this.currentDiscValue = parseFloat( $("#discount-input").val() ); 
			this.$("#discount-input").val("");
		},

		Price_Keypress : function(e) {
			Shared.MaxDecimalPlaceValidation(this.$("#" + e.target.id) ,e);
		},

		inputDiscount_Keypress : function(e) {
			Shared.MaxDecimalPlaceValidation(this.$("#" + e.target.id) ,e);
			/*var _caretPos = Shared.GetCaretPosition('#' + e.target.id);
			console.log('pos:' + _caretPos + ' length:' + val.length);
			if(e.keyCode == 37 || e.keyCode == 39) return;			
			var val = $("#discount-input").val();
			var maxPlaces = 2,
	          	integer = val.split('.')[0],
	         	mantissa = val.split('.')[1];		    
		    if (!mantissa) mantissa = '';
		    
		    if (mantissa.length == maxPlaces && (_caretPos > val.length - 3 || _caretPos > val.length)) {
		        e.preventDefault();
		        return false;
		    }*/
		},
		
		UpdateDiscountWithValidation : function() {
            var _self = this;            
            if(this.itemDiscountTimeOut) clearTimeout(this.itemDiscountTimeOut);
            this.itemDiscountTimeOut = setTimeout(function(){ _self.DoUpdateDiscountWithValidation(); }, 500);
		},

		DoUpdateDiscountWithValidation : function() {
			//jj15x
			var discountManager = Global.Preference.DiscountOverrideLevel;
				console.log("UserRole : "  + Global.UserInfo.RoleCode  + ", Discount Manager : " + discountManager);
			//if(Global.UserInfo.RoleCode === discountManager){
				if(this.ValidateDiscount("Discount")) {
					this.UpdateFieldValue("Discount");
				}	
			//}			
		},
				
		UpdateFieldValue : function(fieldName) {
			var _element;
			var _value;
			var _checkIsInt = false;
									
			switch (fieldName) {
				case "QuantityOrdered" :
					_element = this.$("#qtyOrdered-input");
					_checkIsInt = true;
					break;
				case "SalesPriceRate" :					
					this.SetActionType(Enum.ActionType.ChangePrice);
					_element = this.$("#price-input");
					break;
				case "Discount" :					
					_element = this.$("#discount-input");
					break;
			}

			_value = _element.val().trim();
			if(this.prevQty == _value) { this.RevertFieldValue(_element, fieldName, _value); return; }
			if(fieldName == "QuantityOrdered") { this.prevQty = _value; }

			if (_value === "")
				_value = 0; //comm
			
			var _isQuantityUpdated = fieldName === "QuantityOrdered";			
			var _negativeWithCoupon = (this.HasCoupon() && _value < 0);

			if(_isQuantityUpdated){			
				if(this.IsGiftCredits()) {
					if(!this.IsValidGiftCreditsQty(_value)) {
						_element.val(this.model.get(fieldName));
						this.prevQty = this.model.get(fieldName);
						return;
					}
				}else {
					if(this.cartHasGiftCredit() == true && _value < 0) {
						navigator.notification.alert('Item exchange is not allowed for transactions with Gift Cards. Please create a separate transaction.',null,'Negative Quantity','OK');
						_element.val(this.model.get(fieldName));
						this.prevQty = this.model.get(fieldName);
						return;
					}
				}	

			}

			if (Global.TransactionType !== Enum.TransactionType.SalesRefund) {
				if(_isQuantityUpdated && this.IsZero(_value)) {
					navigator.notification.alert("Please enter at least 1 quantity.",null,"Quantity Required","OK");
					_element.val(this.model.get(fieldName));
					this.prevQty = this.model.get(fieldName);
					return;	
				}
			}

            if (_isQuantityUpdated && (this.ValidateNegativeQuantity(_value) === false || _negativeWithCoupon)) { //bk
                var _transactionType = Global.TransactionType;

                if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
                    _transactionType = "Return";
                    _element.val(this.model.get("Good")); //Originally Defective
                }
                else {
                	_element.val(this.model.get(fieldName));                    
                }
                
                var _errorMessage = "Negative quantity is not allowed.\nPlease remove coupon first.";
                if(this.ValidateNegativeQuantity(_value) === false){
                    if(this.model.get("ItemType") == Enum.ItemType.GiftCard || this.model.get("ItemType") == Enum.ItemType.GiftCertificate)
                	    _errorMessage = "Negative quantity is not allowed for "+ this.model.get("ItemType") + " item";
                    else 
                        _errorMessage = "Negative quantity is not allowed for " + _transactionType + " transaction.";
                } 

                navigator.notification.alert(_errorMessage,null,"Negative Quantity","OK");
				return;
            }

			switch (Global.TransactionType) {
				case Enum.TransactionType.SalesRefund :
					var _outstanding = this.model.get("Outstanding");
					if (_isQuantityUpdated) {
                        if (_value > _outstanding) {
                            _element.val(this.model.get("Good")); //Originally Defective
							console.log("Value must be less than or equal to the Outstanding quantity.");
							navigator.notification.alert("Value must be less than or equal to the Outstanding quantity.",null,"Incorrect Value","OK");
							return;							
						}
					}
					break;	
				default :
					_value = _element.val().trim();
					if  (_value === "" || _value === null)  { 
							_element.val(this.model.get(fieldName));
							return;
					}
					if (_isQuantityUpdated && (_value === 0 || _value === "0")) {                        
						_element.val(this.model.get(fieldName));
						console.log("Please enter at least 1 quantity.");
						navigator.notification.alert("Please enter at least 1 quantity.",null,"Quantity Required","OK");		
						return;
					}
					//
					if (_isQuantityUpdated){
					var qtyAdded = _value - this.model.get("QuantityOrdered");
						//if(Shared.CheckIfItemIsPhaseout(this.model,_value,qtyAdded,false,Global.CartCollection)){
						//	_element.val(this.model.get(fieldName));  return;
						//}
							
					}
				break;
			}        
			


			//check if _value is a valid number	
			_value = _element.val().trim();			
			if (this.IsNumeric(_value, _checkIsInt)) {
				if (fieldName === "Discount" && _value > 100) {
					this.RevertFieldValue(_element, fieldName, _value);
				}else{
					this.UpdateModel(fieldName, _value); // jj15
				}				
								
			}
			else {				
				this.RevertFieldValue(_element, fieldName, _value); 
			}			
			//$("#qtyOrdered-input").val("");
		},
		
		RevertFieldValue : function(element, fieldName, value) {
			element.val(this.model.get(fieldName));			
			if(value === "" || value === null ) {	} //nothing will display if blank
			else {
				console.log("Invalid input");
				navigator.notification.alert("The value you entered is not valid.",null,"Invalid Format","OK");	
			}				
		},

		UpdateSalesTaxAmountField : function(value){
			$('#tax-input').val(value.toFixed(2))
		},

		UpdateExtPriceField : function(value){
			$('#extPrice-input').val(value.toFixed(2))
		},
		
		UpdateModel : function(fieldName, value) {
			this.delegateEvents();
			
			switch (fieldName) {
				case "QuantityOrdered" :
					if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
					    this.model.updateQuantityGood(parseInt(value)); //Originally updateQuantityDefective
					}
					else {
						this.model.updateQuantityOrdered(parseInt(value));
					}
					break;
			    case "SalesPriceRate":
			        this.model.set({
			            DoNotChangePrice: true,
			            Pricing: Global.Username
			        });
			        this.model.updateSalesPriceRate(parseFloat(value), "UpdatePrice");
					break;
				case "Discount" :
					this.model.updateDiscount(parseFloat(value));
					break;					
			}
			//$("#qtyOrdered-input").val("");
		},
		
		IsNumeric : function(value, checkIsInt) {
			if ($.isNumeric(value) === false) { 
				return false;
			}
			if (checkIsInt) {
				if (!this.isInt(value))
				{
					return false;
				}					
			}			
			return true;
		},
		
		CheckMaxDiscount : function(value){
			var maxItem = Global.Preference.MaxItemDiscount;
			var maxSale = Global.Preference.MaxSaleDiscount;
		
				//if( maxItem != 0 && maxSale != 0 ){
					if(value > maxItem && value > maxSale){							
						console.log("Discount must not exceed max discount of " + maxItem+ "%");
						navigator.notification.alert("Discount must not exceed max discount of " + maxItem+ "%", null,"Action Not Allowed","OK");
						return false;
					}
				//}
			
			return true;
		},
		
		ApplyDiscountToAllWithValidation : function(model){
			if(this.ValidateDiscount("DiscountAll")){
				this.ApplyDiscountToAll(model);
			}
		},
		
		ApplyDiscountToAll : function(model)	{
			var _discount = parseFloat($("#discount-input").val());
			model.applyDiscountToAll(_discount);
		},
		
		liFreestock_touchstart : function(e) {
		    e.preventDefault();
		    console.log("test");
			this.ViewFreeStock();
		},
		
		liAccessory_touchstart : function(e) {			
			//e.preventDefault();
			this.ViewAccessory();
			e.preventDefault();
			e.stopPropagation();

			$("#li-accessory").addClass("ui-disabled");
		},
		
		liSubstitute_touchstart : function(e) {
			//e.stopImmediatePropagation();			
			this.ViewSubstitute();			
			e.preventDefault();
			e.stopPropagation();

			$("#li-substitute").addClass("ui-disabled");
		},
		
		liSerialLot_touchstart : function(e) {
			this.ViewSerialLot();
			e.preventDefault();
			e.stopPropagation();
		},

		liNotes_touchstart : function(e) {
			this.ViewNotes();
			e.preventDefault();
			e.stopPropagation();
		},

		PhasedOutItemChangeUnitMeasure: function (model , onSuccess) {
		    var _self = this;
		    var _itemLookupModel = new BaseModel();
		    var _warehouseCode = model.get("WarehouseCode");
		    var _itemCode = model.get("ItemCode");
		   
		    _itemLookupModel.set({
		        CriteriaString : _itemCode,
		    });
		    _itemLookupModel.url = Global.ServiceUrl + Service.PRODUCT + Method.UNITMEASURECODELOOKUP + 100 + "/" + this.model.get("ItemCode");
		    _itemLookupModel.save(null, {
		        success: function (model, response, options) {
		            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
		            //_self.ValidatePhasedOutItem(response);
		            onSuccess(response);
		        },
		        error: function (model, error, options) {
		            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
		            model.RequestError(error, "Error");
		        }
		    });
		},

		ValidatePhasedOutItem: function (response) {
            //validate if changing of unit measure for phaseout item is allowed
		    var _self = this;
		    var _value = $("#qtyOrdered-input").val();
		    var currentUM = this.model.get("UnitMeasureCode");
		    var currentUMQty = this.model.get("UnitMeasureQty");
		    var _um = $("#itemDetail-umList option:selected").val();
		    var _itemCode = this.model.get("ItemCode");
		   
		    var _tempCollection = new BaseCollection();
		    _tempCollection.reset(response.UnitMeasures);
		    if(_tempCollection.length > 0){
		        _tempCollection.each(function(item){
		            if(item.get("UnitMeasureCode") === _um){
		                _self.model.set({
		                    UnitMeasureCode : _um,
		                    UnitMeasureQty : item.get("UnitMeasureQty")
		                });
		            }
		        });
		    }

		    //if(Shared.CheckIfItemIsPhaseout(this.model, _value, 0, false, Global.CartCollection, null, currentUM, currentUMQty)){
		    //    this.model.set({ 
		    //        UnitMeasureCode: currentUM,
            //        UnitMeasureQty : currentUMQty
		    //    });

		    //    $("#itemDetail-umList").val(currentUM);
		    //    $("#itemDetail-umList").selectmenu("refresh");
		        
		    //}else{
		    //   this.model.set({ UnitMeasureCode: _um });
		    //   this.ViewUnitOfMeasure();
		    //}
		    this.model.set({ UnitMeasureCode: _um });
		    this.ViewUnitOfMeasure();
		},

		ValidateChangeUnitMeasure : function(){
		    var um = $("#itemDetail-umList option:selected").val();
	
		    switch(this.model.get("Status")){
		        case "P":
		            var self = this;
		            var onSuccess = function (response) {
		                self.ValidatePhasedOutItem(response);
		            };

		            this.PhasedOutItemChangeUnitMeasure(this.model, onSuccess);
		            break;
		        default:
		            this.$("#itemDetail-content").addClass("ui-disabled");
		            this.model.set({ UnitMeasureCode: um });
		            this.ViewUnitOfMeasure();
		            break;
		    }
		},

		selectUnitMeasure_touchstart: function (e) {
		    this.ValidateChangeUnitMeasure();
		    e.preventDefault();
			e.stopPropagation();
		},

		selectUnitMeasure_tap: function (e) {
			e.stopPropagation();
		},
		
		ViewFreeStock : function() {
			this.model.viewFreeStock();
		},
		
		ViewAccessory : function() {
			this.model.viewAccessory();
		},
		
		ViewSubstitute : function() {
			this.model.viewSubstitute();
		},
		
		ViewSerialLot : function() {
			this.model.viewSerialLot();
		},
		
		ViewUnitOfMeasure : function() {
			this.model.updateUnitMeasure();
		},

		ViewWarehouseCode : function(){
			this.model.updateWarehouseCode();
		},

		ViewNotes : function() {
			this.model.viewNotes("LineItem");
		},
		
		isInt : function(n) {
   			return n % 1 === 0;
		},
		
		ToggleButtons : function() {
			this.ToggleAccessoryButton();
			this.ToggleSubstituteButton();
			this.ToggleSerialLotButton();
			this.ToggleNotesButton();
		},

		ToggleAccessoryButton : function() {
		    switch (Global.TransactionType) {
		        case Enum.TransactionType.SalesPayment:
				case Enum.TransactionType.SalesRefund:
					this.$("#li-accessory").addClass("ui-disabled");
					break;
				default:
					this.$("#li-accessory").removeClass("ui-disabled");
					break;
			}
		},

		ToggleSubstituteButton : function() {
		    switch (Global.TransactionType) {
                case Enum.TransactionType.SalesPayment:
				case Enum.TransactionType.SalesRefund:
					this.$("#li-substitute").addClass("ui-disabled");
					break;
				default:
					this.$("#li-substitute").removeClass("ui-disabled");
					break;
			}
		},

		ToggleSerialLotButton : function() {
			switch(Global.TransactionType){
				case Enum.TransactionType.Order:
				case Enum.TransactionType.Quote:
				case Enum.TransactionType.SalesPayment:
				case Enum.TransactionType.VoidTransaction:
					this.$("#li-serialLot").addClass("ui-disabled");
				break;
				default:
				    if ((this.model.get("SerializeLot") === "None" ||
                        this.model.get("SerializeLot") === null ||
                        this.model.get("SerializeLot") === undefined) &&
                       (this.model.get("ItemType") != Enum.ItemType.GiftCard &&
                        this.model.get("ItemType") != Enum.ItemType.GiftCertificate)) {
				        this.$("#li-serialLot").addClass("ui-disabled");
				    } else {
				        this.$("#li-serialLot").removeClass("ui-disabled");
				    }
				break;
			}
		},

		ToggleNotesButton : function() {
			switch(Global.TransactionType){
				// case Enum.TransactionType.SalesRefund:
			    //case Enum.TransactionType.SalesPayment:
				// case Enum.TransactionType.Return:
				// case Enum.TransactionType.SalesCredit:
				// case Enum.TransactionType.Sale:
				// case Enum.TransactionType.UpdateInvoice:
				// case Enum.TransactionType.ConvertOrder:
				// case Enum.TransactionType.Suspend:
				// case Enum.TransactionType.ResumeSale:
				//case Enum.TransactionType.Quote:
				case Enum.TransactionType.VoidTransaction:
					this.$("#li-notes").addClass("ui-disabled");
				break;
				default:
					this.$("#li-notes").removeClass("ui-disabled");
				break;
			}
		},
		
		ToggleFields : function() {
			var _allowDiscount = true;
			switch (Global.TransactionType) {
				case Enum.TransactionType.SalesRefund : 
					this.$("#price-input").attr("readonly", "readonly");
					this.$("#discount-input").removeAttr("readonly");
					this.$(".applyDiscount").removeClass("ui-disabled");
					this.$(".applyItemDiscount").removeClass("ui-disabled");
					_allowDiscount = true;
					break;
				case Enum.TransactionType.SalesPayment :
				case Enum.TransactionType.VoidTransaction:
					this.$("#price-input").attr("readonly", "readonly");
					this.$("#discount-input").attr("readonly", "readonly");
					this.$(".applyDiscount").addClass("ui-disabled");
					this.$(".applyItemDiscount").addClass("ui-disabled");
					_allowDiscount = false;
					break;
				default :
					this.$("#price-input").removeAttr("readonly");
					this.$("#discount-input").removeAttr("readonly");
					this.$(".applyDiscount").removeClass("ui-disabled");
					this.$(".applyItemDiscount").removeClass("ui-disabled");
					_allowDiscount = true;
					break;
			}
			
			if(Global.ApplicationType){
				this.$("#price-input").attr("readonly", "readonly");
			}
			
			if (Global.TransactionType === Enum.TransactionType.SalesPayment || Global.TransactionType === Enum.TransactionType.VoidTransaction) {
    			this.$("#qtyOrdered-input").attr('readonly','readonly');
    		}else{

    		}
    		
    		if( Global.Preference.AllowSaleDiscount === false ){
				this.$(".applyDiscount").addClass("ui-disabled");
                //this.$("#discount input").addClass('discountTextOnly');  
			} else if(_allowDiscount){
				this.$(".applyDiscount").removeClass("ui-disabled");
			}

			if(Global.Preference.AllowItemDiscount === false ){
				this.$(".applyItemDiscount").addClass("ui-disabled");
				this.$(".applyDiscount").addClass("ui-disabled");
				this.$("#discount-input").addClass("ui-disabled").attr('disabled',true);;
				//this.$("#discount input").addClass('discountTextOnly');  
			}  else if(_allowDiscount){
				this.$(".applyItemDiscount").removeClass("ui-disabled");
			}
			if(Global.Preference.AllowItemDiscount===false && Global.Preference.AllowSaleDiscount === false){
				this.$("#discount-input").addClass("ui-disabled").attr('disabled',true);;
				}else if(_allowDiscount){
				this.$("#discount-input").removeClass("ui-disabled");
				}

			if( Global.Preference.AllowChangePrice === false){
				this.$("#price-input").attr('disabled','disabled');
			} else {
			    if (Global.TransactionType !== Enum.TransactionType.SalesRefund) {
			        //this.$("#price-input").removeAttr('disabled');
			        this.$("#price-input").removeAttr('disabled');
			        this.$("#price-input").removeAttr('readonly');
			    }
			}
			
            if(this.model.get("QuantityOrdered") < 0){
                this.$(".applyDiscount").addClass("ui-disabled");
                this.$(".applyItemDiscount").addClass("ui-disabled");
                this.$("#discount-input").attr("readonly", "readonly");
                this.$("#discount-input").val(0);
            }

		},
		
		ExceedsMaxDiscountValue : function(value) {
			if(value <= 100) return false;
			navigator.notification.alert("Discount must not exceed 100%.", null, "Action Not Allowed", "OK"); 
			$('#discount-input').val(this.currentDiscValue);  
			return true;
		},
		
		ValidateDiscount : function(mode){		
			var discount = this.$("#discount-input").val();
			var _element = this.$("#discount-input");
			var discountManager = Global.Preference.DiscountOverrideLevel;
				console.log("UserRole : "  + Global.UserInfo.RoleCode  + ", Discount Manager : " + discountManager);
			
			if (discount > 0) {
				var maxDiscount = 0;		
				var minDiscount = 0;
				if (mode === "Discount") { 
					maxDiscount = Global.Preference.MaxItemDiscount;
					minDiscount == Global.Preference.MinItemDiscount;
					this.SetActionType(Enum.ActionType.ItemDiscount);	
				}
				else if (mode === "DiscountAll") {
					maxDiscount = Global.Preference.MaxSaleDiscount;
					minDiscount == Global.Preference.MinItemDiscount;
					this.SetActionType(Enum.ActionType.SaleDiscount); 
				}
				
				if(/*maxDiscount != 0 &&*/ discount != 0){
				    if ((discount > maxDiscount || discount > 100) && discountManager === null) {
				        if (discount > 100) {
				            navigator.notification.alert("Discount must not exceed 100%", null, "Action Not Allowed", "OK");
				            return false;
				        }
						console.log("Discount must not exceed max discount of " + maxDiscount+ "%");
						navigator.notification.alert("Discount must not exceed max discount of " + maxDiscount+ "%", null,"Action Not Allowed","OK");
						return false;
					}else{
						if(discount > 100) {
							var msg = "Discount must not exceed 100%"
							if(!this.IsDiscountManagerOverrideLevel()) msg = "Discount must not exceed max discount of " + maxDiscount+ "%";
							navigator.notification.alert(msg, null,"Action Not Allowed","OK");
							return false;

						} else if (this.ValidateReason(mode)) {
							if (this.ValidateManagerOverride(Global.ActionType)) {
								return true;
							}
						}
						return false;
					}
				} else if (discount > 100) {
					var msg = "Discount must not exceed 100%";
					if(!this.IsDiscountManagerOverrideLevel()) msg = "Discount must not exceed max discount of " + maxDiscount+ "%";
					navigator.notification.alert(msg, null,"Action Not Allowed","OK");
					return false;
				}




				/*
				 * Gemini ID : http://172.16.0.23/Gemini/project/CSL/33/item/9723
				 * Gemini Description : Overriding Maximum Discount is still allowed if discount option is null
				 * Comment : Snippet below was commented for the sole purpose of the ticket specified
				 * Developer : Alexis A. Banaag Jr.
				 *
				 */
				// if ((maxDiscount > 0 && discount > maxDiscount) || (minDiscount < 1 && maxDiscount < 1 && discount > 100) ) { //jj15
				// 	var _message,_messageTitle;
				// 	if((maxDiscount === 0 && minDiscount === 0) || discount > 100){
				// 		_element.val(this.model.get("Discount"));
				// 		_message = "Discount should not exceed 100%";
				// 		_messageTitle = "Invalid Discount";
				// 		console.log(_message);
				// 		navigator.notification.alert(_message,null,_messageTitle,"OK");
				// 	}/*else{
				// 		_element.val(this.model.get("Discount"));
				// 		_message = "Discount exceeded the Maximum Discount";
				// 		_messageTitle = "Maximum Discount Reached";
				// 		console.log(_message);
				// 		navigator.notification.alert(_message,null,_messageTitle,"OK");
				// 	}*/

				// 	if (this.ValidateReason(mode)) {
				// 		if (this.ValidateManagerOverride(Global.ActionType)) {
				// 			return true;
				// 		}
				// 	}
				// 	return false;
				// }	
							
				return this.ValidateReason(mode);		
			} else if (discount < 0 || discount > 100) {								
				console.log("Please enter a valid discount amount");
				navigator.notification.alert("Please enter a valid discount amount",null,"Maximum Discount Reached","OK");
				return false;
			}
			return true;
		},
		
		ValidateReason : function(mode) {
			var _isReason = Global.ReasonCode.Discount;
			if( _isReason === true ){
				
				var reasonType = Global.ActionType;
				
				this.CheckReason(reasonType);
				return false;
			}
			return true;
		},
		
				
		CheckReason : function(type){
			switch(type){
				case Enum.ActionType.VoidItem:
					this.SetActionType(type);
					if(Global.ReasonCode.Item && Global.TransactionType != Enum.TransactionType.SalesRefund){
						this.LoadReason(100,"",type);
					}else{
						this.model.removeSerial();
						this.model.removeItem();
						
					}
					break;
				default: 
					this.LoadReason(100, "", type);
					break;
			}
			
		},
		
		ProceedToAction : function(model){			
			var action = model.get("Action");
			switch(action){
				case "VoidItem":
					this.RemoveThisItem();
					break;
				default :
					Global.ReasonCode.Discount = true;
					break;
			}
		},
		
		ShowReasonView : function(collection,type){
			console.log('reasonView type :' + type)
			$("#reasonPageContainer").append("<div id='reasonMainContainer'></div>");
			if(this.ItemReasonView){
				this.ItemReasonView.remove();
				this.ItemReasonView.unbind();
				this.ItemReasonView = null;
			}//this.ItemReasonView.Show(type, $("#reasonMainContainer"));


			this.ItemReasonView = new ItemReasonView({
				el: $("#reasonMainContainer"),
				collection : collection,
				type : type
			});
		},
		
		
		LoadReason : function(rows,criteria,type){
			var _self = this;
			var _reasonLookup = new LookupCriteriaModel();
	    	var _rowsToSelect = rows;
	    	var _actionType = Global.ActionType;
	    	
	    	//Initialize collection	    	
			this.itemReasonCollection = new ReasonCollection();		
			this.itemReasonCollection.unbind();				
			this.itemReasonCollection.on('acceptReason', this.AcceptReason, this);
			this.itemReasonCollection.on('savedItem', this.ProceedToAction, this);

			
	    	_reasonLookup.set({
	    		StringValue : criteria
	    	})
	    	
	    	_reasonLookup.url = Global.ServiceUrl + Service.POS + Method.REASONLOOKUP + _rowsToSelect;
	    	_reasonLookup.save(null, {
	    		success : function(model, response) {
                    if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator(); //CSL-5031
	    			_self.itemReasonCollection.reset(response.Reasons);
	    			_self.ShowReasonView(_self.itemReasonCollection, type);
	    		},
	    		error : function( model, error, response ){
                    if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator(); //CSL-5031
	    			model.RequestError(error, "Error Loading Reason Codes");
	    		}
	    	});
	    
		},
		
		SetActionType : function(type) {
			Global.ActionType = type;
		},
		
		AcceptReason : function() {
			switch (Global.ActionType) {
				case Enum.ActionType.ItemDiscount :
					if (this.ValidateManagerOverride(Global.ActionType)) {
						this.SaveReason();
						this.UpdateFieldValue("Discount");
					}
					break;
				case Enum.ActionType.SaleDiscount : 
					if (this.ValidateManagerOverride(Global.ActionType)) {
						this.SaveReason();
						this.ApplyDiscountToAll(this.model);
					}
					break;
				default : 
					if (this.ValidateManagerOverride(Global.ActionType)) {
						this.SaveReason();
						this.RemoveThisItem(this.model);
					}
			}
		},
		
		SaveReason : function() {
			if (this.ItemReasonView) {
				this.ItemReasonView.SaveReason();
			}
		},

		IsDiscountManagerOverrideLevel : function() {
			if(!Global.Preference.DiscountOverrideLevel) return true;
			var overrideLevel = (Global.Preference.DiscountOverrideLevel).toLowerCase();
			var currentUser = (Global.UserInfo.RoleCode).toLowerCase();
			if (!overrideLevel) return true;
			if (overrideLevel == currentUser) return true;
			return false;
		},
		
		ValidateManagerOverride : function(mode) {
			var overrideLevel = null;

			if (mode === Enum.ActionType.ItemDiscount || mode === Enum.ActionType.SaleDiscount) {
				var maxDiscount = 0;
				var discount = this.$("#discount-input").val();		
				
				if (mode === Enum.ActionType.ItemDiscount)
					{ maxDiscount = Global.Preference.MaxItemDiscount;	}
				else
					{ maxDiscount = Global.Preference.MaxSaleDiscount; }
				
				if (/*maxDiscount <= 0 ||*/ discount <= maxDiscount) { return true; }

				overrideLevel = Global.Preference.DiscountOverrideLevel;		
			} else if (mode === Enum.ActionType.ChangePrice) {		
				overrideLevel = Global.Preference.PriceChangeOverrideLevel;
			}
					
			if (overrideLevel != "" && overrideLevel != null) {  
				if (Global.UserInfo.RoleCode != overrideLevel) {					
					Global.OverrideMode = mode;
					this.ShowManagerOverride();
					return false;
				}
			}
			return true;
		},	
		
		ShowManagerOverride : function() {
	    	this.InitializeManagerOverrideView();
	    	this.managerOverrideView.Show();
			return false;
	    },
	    
	    InitializeManagerOverrideView : function() {
	    	if (!this.managerOverrideView) {
	    		this.managerOverrideView = new ManagerOverrideView({
		    		el : $("#managerOverrideContainer")
	    		});
	    		this.managerOverrideView.on("ManagerOverrideAccepted", this.AcceptManagerOverride, this);
	    	}
	    },
	    
	    AcceptManagerOverride : function(username, password) {
			var _self = this;
			var _origUsername = Global.Username;
			var _origPassword = Global.Password;
			var overrideModel = new OverrideModel();
					
			//Need to set the username and password for authentication
			Global.Username = username;
			Global.Password = password;			
			overrideModel.url = Global.ServiceUrl + Service.POS + Method.MANAGEROVERRIDE + Global.POSWorkstationID + "/" + Global.OverrideMode;
			overrideModel.save(null, {
				success: function(model, response) {
					if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
					_self.AcceptManagerOverrideCompleted(model, response);					
				},
				error : function(model, error, response){
					if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
					model.RequestError(error, "Error Saving Manager Override");
				}
			});
			
			//Reset the original username and password after manager override process
			Global.Username = _origUsername;
			Global.Password = _origPassword;
		},
		
		AcceptManagerOverrideCompleted : function(model, response) {
			if (response.ErrorMessage == null || response.ErrorMessage == "") {
				mode =  Global.OverrideMode;
		
				if (mode === Enum.ActionType.ItemDiscount || mode === Enum.ActionType.SaleDiscount) {
					if (mode === Enum.ActionType.ItemDiscount) { 
						this.UpdateFieldValue("Discount") 
					}
					else { 
						this.ApplyDiscountToAll(this.model); 
					}	
					
					if (Global.Preference.IsReasonDiscount) { 
						this.SaveReason(); 
					}
				}		
				else if (mode === "ChangePrice") { 
					this.UpdateFieldValue("SalesPriceRate");
				}
				this.managerOverrideView.Close();
			}
			else {
				console.log(response.ErrorMessage);
				navigator.notification.alert(response.ErrorMessage, null, "Override Failed","OK");	
			}
		},
		
		UpdatePriceWithValidation : function() {
			Global.ActionType = Enum.ActionType.ChangePrice;
			if (this.ValidateManagerOverride(Global.ActionType)) {
				this.UpdateFieldValue("SalesPriceRate");
			}
		},

		cartHasGiftCredit: function() { 
    		var cartCollection = Global.CartCollection;
    		var gifts = cartCollection.find(function(model){
			 			return model.get("ItemType") == Enum.ItemType.GiftCard || model.get("ItemType") == Enum.ItemType.GiftCertificate;
			 	});
    		if(!gifts) return false;
    		return true;
    	},
		
		ValidateNegativeQuantity : function(value) {		
			if ((Global.TransactionType === Enum.TransactionType.SalesRefund || Global.TransactionType != Enum.TransactionType.Sale) || 
				(Global.ApplicationType === "Kiosk") ||
	            (this.model.get("ItemType") == Enum.ItemType.GiftCard || this.model.get("ItemType") == Enum.ItemType.GiftCertificate)) {
				if (value < 0) return false;						
			}			
			return true;
		},
		
		qty_focus : function(e) {
			if(this.IsGiftCredits()) { Shared.Input.NonNegativeInteger('#' + e.target.id); }
			else Shared.Input.Integer('#' + e.target.id);
		}, 
		
		price_focus : function(e) {
		    Shared.Input.NonNegative('#' + e.target.id);
		},

		Price_Keyup : function(e) { 
		    if (e.currentTarget.value == '0.') {
		        $(e.target).val("0.0");
		        //$(e.target).focus();
		        $(e.target).val("0.");
		        $(e.target).focus();
		    }
		}
	});
	return ItemDetailView;
});
