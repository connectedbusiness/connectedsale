/**
 * Connected Business | 05-14-2012
 * Required: el, model 
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'shared/global',
	'backbone',
	'shared/enum',
	'shared/method',
	'shared/service',
	'shared/shared',
	'model/lookupcriteria',
	'model/base',
	'collection/stocks',
	'collection/accessories',
	'collection/substitutes',
	'collection/unitmeasures',
	'view/25.1.0/pos/itemdetail/item',
	'view/25.1.0/pos/itemdetail/freestock',
	'view/25.1.0/pos/itemdetail/accessory/accessories',
	'view/25.1.0/pos/itemdetail/accessory/accessorydetail',
	'text!template/25.1.0/pos/itemdetail/itemdetail.tpl.html',
	'text!template/25.1.0/pos/itemdetail/accessory/accessorypage.tpl.html',
	'js/libs/iscroll.js'
],function($, $$, _, Global, Backbone, Enum, Method, Service, Shared,
		LookupCriteriaModel, BaseModel, StockCollection, AccessoryCollection, SubstituteCollection, UnitMeasureCollection,
		ItemView, FreeStockView, AccessoriesView, AccessoryDetail,
		template, AccessoryTemplate){
	var _model,state = "", isFromFreeStock = false, freeStockView = null;
	var _cartInstance = null;
	//var BackButton = {
	//    BackToItem: "back-itemDetail",
	//    BackToAccesories: "back-accessory",
	//    BackToSubstiture: "back-substitute"
	//}
 	var ItemDetailView = Backbone.View.extend({
 		_template : _.template(template),
 		_AccessoryTemplate : _.template(AccessoryTemplate),
 		
		events: {
			"tap #done-itemDetail"			: "doneItemDetail_touchstart",
			"tap #back-itemDetail"			: "backItemDetail_touchstart",
			"tap #back-accessory" 			: "backItemDetail_touchstart",
			"tap #back-substitute" 			: "backItemDetail_touchstart",
			"tap #add-itemDetail" 			: "addItemDetail_touchstart",
			//"keyup #accessory-search" 		: "inputKeyup",
			"keypress #accessory-search" 		: "inputKeypress",
			
			"tap #accessory-search" 		: "ShowClearBtn",
			"blur #accessory-search" 		: "HideClearBtn",
			"tap #accessory-searchClearBtn" : "ClearText",
		},
		
		initialize : function(){
			this.model.on("change:SalesPriceRate", this.UpdatedPrice, this);
			//this.model.on("salesPriceRateUpdated", this.test, this);
			this.type = this.options.type;
			this.Show(this.model, "Item");
			_model = this.model;
			Global.ReasonViewRendered = false;
		},

		UpdatedPrice : function(model) {
			$("#price-input").val( model.get("SalesPriceRate") );
		},
				
		//inputKeyup : function(e) {
		inputKeypress : function(e) {			
            if(_cartInstance) if(this.cid != _cartInstance.CurrentItemDetailViewID) return;
            
            if(e.keyCode === 13){
				var _criteria = $("#accessory-search").val();
				this.FindItem(_criteria);
			} else {
				this.ShowClearBtn(e);
			}
		},

        SetCartInstance : function(cartInstance){
            _cartInstance = cartInstance;
        },
		
		FindItem : function(_criteria){
			this.isSearch  = true;
			
            //Validation to make sure that this view is still working on the same Item Model from the cart.
            if(_cartInstance){
                if(_cartInstance.CurrentItemDetailModel.get('ItemCode') != this.model.get('ItemCode')){
                    this.model = _cartInstance.CurrentItemDetailModel;
                }
            }           
            
            switch(state){
				case "Accessory" :
					this.LoadAccessory(this.model, 100, _criteria);
					state = "Accessory";
					break;	
				case "Substitute" : 
					this.LoadSubstitute(this.model, 100, _criteria);
					state = "Substitute";
					break;	
			}
		},
		
		FetchUM : function() {
			var self = this;
			var umLookup = new LookupCriteriaModel();
			var rowsToSelect = 100;
			var defaultUnitMeasure = this.model.get("UnitMeasureCode");
			
			umLookup.set({
				CriteriaString : this.model.get("ItemCode")
			});
			
			umLookup.url = Global.ServiceUrl + Service.PRODUCT + Method.UNITMEASURECODELOOKUP + rowsToSelect + "/" + this.model.get("ItemCode");
			umLookup.save( null, {
				success : function(model, response){
					if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
					self.RetrieveUM(response, defaultUnitMeasure);
				},
				error : function(model, error, response){
					if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
					model.RequestError(error, "Error Retrieving Unit of Measure");
				}
			})
		},
		
		RetrieveUM : function(response, defaultUnitMeasure) {
			this.umCollection = new UnitMeasureCollection();
			this.umCollection.reset( response.UnitMeasures );
			
            $("#itemDetail-umList").html(""); //GEMINI : CSL-5944

			this.umCollection.each( function(model){
				$("#itemDetail-umList").append( new Option(model.get("UnitMeasureCode"), model.get("UnitMeasureCode")) );
				$("#itemDetail-umList option[value='"+ defaultUnitMeasure +"']").attr("selected", "selected"); 	
				$("#itemDetail-umList").selectmenu("refresh", true);
			});

		},
		
		render : function(model) {
		    _model = this.model = model;
			var _imageLoc = Global.ServiceUrl + Method.IMAGES + this.model.get("ItemCode") + ".png?" + Math.random();
			var _itemName = Shared.Escapedhtml(this.model.get("ItemName"));
			var _itemDescription = Shared.Escapedhtml(this.model.get("ItemDescription"));

			if(this.model.get("ItemDescriptionWithNotesDisplay")){
				var _itemDescriptionWithNote = Shared.Escapedhtml(this.model.get("ItemDescriptionWithNotesDisplay"));
			} else {
				var _itemDescriptionWithNote = Shared.Escapedhtml(this.model.get("ItemDescription"));
			}
			
			if (Global.IsUseISEImage) _imageLoc = this.AssignISEImageLocation(this.model.get("Filename"));
			//if(this.model.get("ItemType") === 'Non-Stock') this.model.set({WarehouseCode : "MAIN"});
			
			this.model.set({
				ImageLocation : _imageLoc,
				ItemNameDisplay: _itemName,
				ItemDescriptionDisplay: _itemDescriptionWithNote
			},{silent:true});
			this.$el.html(this._template(this.model.toJSON()));
			
			this.FetchUM();
			
			this.ShowContent("Item");
			$("#main-transaction-blockoverlay").show();
		},

		RenderView : function(){
			$("#itemDetail-inner").replaceWith( this._AccessoryTemplate );
		},

		GenerateAccImageByItemCode : function(){
			var generateImage = new LookupCriteriaModel();
			generateImage.on('sync',this.ShowAccView,this);
			generateImage.set({
				StringValue : this.model.get("ItemCode")
			});
			generateImage.url = Global.ServiceUrl + Service.PRODUCT +  Method.GENERATEITEMIMAGEBYCODE;
			generateImage.save();			
			
		},

		GenerateSubImageByItemCode : function(){
			var generateImage = new LookupCriteriaModel();
			generateImage.on('sync',this.ShowSubView,this);
			generateImage.set({
				StringValue : this.model.get("ItemCode")
			});
			generateImage.url = Global.ServiceUrl + Service.PRODUCT +  Method.GENERATEITEMIMAGEBYCODE;
			generateImage.save();
		},

		ShowAccView : function(){
			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
			var _imageLoc = Global.ServiceUrl + Method.IMAGES + this.model.get("ItemCode") + ".png?"  + Math.random();
			if (Global.IsUseISEImage) _imageLoc = this.AssignISEImageLocation(this.model.get("Filename"));
			this.model.set({ImageLocation : _imageLoc},{silent:true});		
			this.$el.html(this._template(this.model.toJSON()));
			this.ShowContent("Accessory");
		},

		ShowSubView : function(){
			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
			var _imageLoc = Global.ServiceUrl + Method.IMAGES + this.model.get("ItemCode") + ".png?"+ Math.random();
			if (Global.IsUseISEImage) _imageLoc = this.AssignISEImageLocation(this.model.get("Filename"));
			console.log(_imageLoc);
			this.model.set({ImageLocation : _imageLoc},{silent:true});
			this.$el.html(this._template(this.model.toJSON()));
			this.ShowContent("Substitute");
		},

		RenderAccView : function(model){
			this.model = model;
			this.GenerateAccImageByItemCode();
		},
		
		RenderSubView : function(model){
			this.model = model;
			this.GenerateSubImageByItemCode();
		},
		
		ShowContent : function(viewType) {
			switch (viewType) {
				case "Item" :
					this.ShowItemView();
					break;
				case "Accessory" :
					this.ShowDetailView(viewType);
					state = "AccessoryDetail";
					break;
				case "Substitute" :
					this.ShowDetailView(viewType);
					state = "SubstituteDetail";
					
					break;
			}
		},
		
		ShowView : function(collection,state){
			switch (state){
				case "Accessory" :
					$("#itemDetail-title").html("Accessory");
					$("#done-itemDetail").show();
					$("#back-itemDetail").show();
					$("#add-itemDetail").hide();
					$("#back-accessory").hide();	

					break;
				case "Substitute" :
					$("#itemDetail-title").html("Substitute");
					$("#done-itemDetail").show();
					$("#back-itemDetail").show();
					$("#add-itemDetail").hide();
					$("#back-substitute").hide();
					break;
			}

			this.RenderView();
			this.accessoryView = new AccessoriesView({
					el: $("#accessory-content"),
					collection : collection
			})
			$("#itemDetail").removeClass("itemDetalViewFullDetails");
		},
		
		ShowDetailView : function(state){
			switch (state){
				case "Accessory" :
					$("#back-accessory").show();
					$("#back-substitute").hide();
					break;
				case "Substitute" :
					$("#back-substitute").show();
					$("#back-accessory").hide();
					break;
			}
			$("#itemDetail-title").html("Details");
			$("#back-itemDetail").hide();
			$("#done-itemDetail").hide();
			$("#add-itemDetail").show();
			this.accessoryDetailView = new AccessoryDetail({
				model: this.model
			})
		
			this.$("#itemDetail-content").html(this.accessoryDetailView.render(this.model).el);
			this.$("#itemDetail-content").trigger("create");
		},
		
		ShowItemView : function() {
			$("#itemDetail-title").html("Item");
			$("#add-itemDetail").hide();
			$("#back-accessory").hide();
			$("#back-substitute").hide();
			$("#back-itemDetail").hide();

			//if (!this.itemView) {
			//	this.itemView = new ItemView({
			//		model: this.model
			//	});
		    //}
			this.itemView = null;
			this.itemView = new ItemView({
			    model: this.model
			});
			
			this.$("#itemDetail-content").html(this.itemView.render(this.model, this.type).el);
			this.$("#itemDetail-content").trigger("create");
		},
		
		ShowFreeStock : function(type){	
			switch(type){
				case "FreeStock" : 
					$("#back-itemDetail").show();
					$("#add-itemDetail").css("visibility","hidden");
					$("#back-accessory").css("visibility","hidden");
					$("#back-substitute").css("visibility","hidden");
					break;
				case "AccessoryDetail" :
					$("#back-itemDetail").show();
					$("#back-accessory").css("visibility","hidden");
					$("#add-itemDetail").css("visibility","hidden");
					$("#done-itemDetail").css("visibility","hidden");
					state = "AccessoryFreeStock";
					break;
				case "SubstituteDetail" :
					$("#back-itemDetail").show();
					$("#back-substitute").css("visibility","hidden");
					$("#add-itemDetail").css("visibility","hidden");
					$("#done-itemDetail").css("visibility","hidden");
					state = "SubstituteFreeStock";
					break;
			}	
			
			$(".popover-right").css("visibity", "hidden");
		},
		
		ShowFreeStockView : function(collection,type) {
			$("#itemDetail").removeClass("itemDetalViewFullDetails");
			$("#itemDetail-title").html("Free Stock");
			var _collection = this.LoadFreeStockByUnitOfMeasure(collection);
            console.log("state : "+ state)
			this.ShowFreeStock(state);

			freeStockView = new FreeStockView({ model : this.model });
			freeStockView.on('freeStockLoaded', this.FreeStockLoaded);

			//var _collection  = this.LoadFreeStockByUnitOfMeasure(collection);
			this.$("#itemDetail-content").html(freeStockView.render(_collection).el);			
			this.$("#itemDetail-content").trigger("create");
			this.myScroll = new iScroll("itemDetail-content");			
			freeStockView.trigger('freeStockLoaded', this)
		},

		FreeStockLoaded : function(view) {
			console.log('FreeStockLoaded!');
			isFromFreeStock = true;
		},

		LoadFreeStockByUnitOfMeasure : function(collection){ //jj26
			var _um = this.model.get('UnitMeasureCode');
			this.stockContainer = new StockCollection();
			this.stockContainer.reset(collection.StockTotalDetails);
			this.stockCollection = new StockCollection();

			if(this.stockContainer.length  > 0){
				var _self  = this;
				
				this.stockContainer.each(function(model){
					if(model.get('UnitMeasureCode') === _um){
						_self.stockCollection.add(model);
					}
				})
			}
			return this.stockCollection;
		},
		
		Close : function(){			
			Global.IsOnItemDetail = false;
			Shared.FocusToItemScan();
			this.isSearch = false;
			this.Hide();
			$("#main-transaction-blockoverlay").hide();
		},

		GenerateItemImageByCode : function(model){
			this.tempModel = new LookupCriteriaModel();
			this.tempModel = model;
			this.generateImage = new LookupCriteriaModel();
			this.generateImage.on('sync',this.ShowItemDetails,this);
			this.generateImage.set({
				StringValue : model.get("ItemCode")
			});
			this.generateImage.url = Global.ServiceUrl + Service.PRODUCT +  Method.GENERATEITEMIMAGEBYCODE;
			this.generateImage.save();
			
		},

		ShowItemDetails : function(){
			switch (this.viewType) {
				case "Item" :
					this.render(this.tempModel);
					state = this.viewType;
					$("#itemDetail").addClass("itemDetalViewFullDetails");
                    if(this.tempModel.get("ItemType") == Enum.ItemType.Service || this.tempModel.get("ItemType") == Enum.ItemType.NonStock) $("#li-freestock").css("display","none !important"); 
					break;
				case "FreeStock" :
					this.LoadFreeStock(this.tempModel);
					state = this.viewType;
					
					break;
				case "Accessory" :
					this.LoadAccessory(this.tempModel, 100, "");
					state = this.viewType;
					break;	
				case "Substitute" : 
					this.LoadSubstitute(this.tempModel, 100, "");
					state = this.viewType;
					break;	
			}
             
            var tmp_ClearFloat = '';            
            if(Global.ApplicationType =='Kiosk') tmp_ClearFloat = '<br class="clearfloat"/>';
            $('.kiosk-itemdetail-clearfloat').html(tmp_ClearFloat);	
            switch (Global.TransactionType) {
                case Enum.TransactionType.SalesPayment:
                case Enum.TransactionType.VoidTransaction:
                //case Enum.TransactionType.ConvertOrder:
                case Enum.TransactionType.Recharge :
                    if (!this.$("#btn-remove-item").hasClass("ui-disabled")) this.$("#btn-remove-item").addClass("ui-disabled");
                    break;
                case Enum.TransactionType.ConvertOrder: 
					if(this.itemView.isCurrentOrder == false){ if(this.$("#btn-remove-item").hasClass("ui-disabled")) this.$("#btn-remove-item").removeClass("ui-disabled"); } 
					else { if(!this.$("#btn-remove-item").hasClass("ui-disabled")) this.$("#btn-remove-item").addClass("ui-disabled"); }
					break;
                default: this.$("#btn-remove-item").removeClass("ui-disabled");
                    break;
            }
			this.$el.show();
		},

		Clear : function() {
			this.unbind();
		},

		Show : function(model, viewType) {
		//	$("#itemDetail").removeClass("itemDetalViewFullDetails");
			Global.IsOnItemDetail = true;
			this.viewType = viewType;
			this.$("#btn-remove-item").addClass("ui-disabled");
			this.GenerateItemImageByCode(model)
			Global.ReasonViewRendered = false;
		},
		
		Hide : function() {
			this.$el.hide();
		},
		
		doneItemDetail_touchstart : function(e) {
			e.preventDefault();
			this.Close();
		},

		backItemDetail_touchstart : function(e) {		//v14	
		    e.preventDefault();
		    e.stopImmediatePropagation();
		 //   console.log("CurrentState :" + state + ",id : " + e.target.id);
		  //  var backButtonID = e.target.id;
			switch(state){
			    case "Accessory":
			            this.render(_model);
			            state = "Item";
					break;
				case "FreeStock" :
					this.render(_model);
					state = "Item";
					break;
			    case "Substitute":
			            this.render(_model);
			            state = "Item";
					break;
			    case "AccessoryDetail":
                   
					this.LoadAccessory(_model, 100, "");
					state = "Accessory";
					break;
				case "AccessoryFreeStock" :
					if(isFromFreeStock) {
						if(freeStockView.model) {
						 this.model = freeStockView.model; 
						 freeStockView.UnbindView;
						 freeStockView = null;
						 isFromFreeStock = false;
						}
					}
					this.RenderAccView(this.model);
					state = "AccessoryDetail";
					break;
				case "SubstituteDetail" :					
					this.LoadSubstitute(_model, 100, "");
					state = "Substitute";
					break;
				case "SubstituteFreeStock" :
					if(isFromFreeStock) {
						if(freeStockView.model) {
						 this.model = freeStockView.model;
						 freeStockView.UnbindView;
						 freeStockView = null;
						 isFromFreeStock = false;
						}
					}
					this.RenderSubView(this.model);
					state = "SubstituteDetail";
					break;					
			}
				$("#itemDetail").addClass("itemDetalViewFullDetails");
		},
		
		addItemDetail_touchstart : function(e){
			e.preventDefault();
			this.AddItem(this.model);
		},
		
		AddItem : function(model){
			this.collection.add( model );
			this.Close();
		},

		LoadAccessory : function(model,rows,criteria){ //jjxxx
			var _self = this;
			var _accessoryLookup = new LookupCriteriaModel();
	    	var _rowsToSelect = rows;
	    	var _itemCode = model.get("ItemCode");
	    	
	    	this.model = model;
	    	
	    	//Initialize collection	    	
			if(!this.accessoryCollection){
				this.accessoryCollection = new AccessoryCollection();
				this.accessoryCollection.bind('selected', this.RenderAccView, this);
				this.accessoryCollection.bind('showOnHand', this.LoadFreeStock, this);
				this.accessoryCollection.bind('itemAdded', this.AddItem, this);
			}
			
			if (!criteria) criteria = "";
			
	    	_accessoryLookup.set({
	    		ItemCode : _itemCode,
	    		CriteriaString : criteria,
	    		WebsiteCode : Shared.GetWebsiteCode(),
                WarehouseCode : Global.LocationCode
	    	})
	    	
	    	_accessoryLookup.url = Global.ServiceUrl + Service.PRODUCT + Method.ACCESSORYLOOKUP + _rowsToSelect;
	    	_accessoryLookup.save(null, {
	    		success : function(model, response) {
	    			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
	    			$("#li-accessory").removeClass("ui-disabled");

	    			if (!response.Items) {
	    				if(_self.isSearch == true){
	    					_self.isSearch = false;
							navigator.notification.alert("Item \""+criteria+"\" does not exist.", null, "Item Not Found", "OK");
							$("#accessory-search").val("");
	    				}else{
	    					console.log(_itemCode + "has no accessories.");
							navigator.notification.alert("Item has no accessories.", null, "No Accessories Found", "OK");
	    				}

					}
					else {
						_self.accessoryCollection.reset(response.Items);
						_self.ShowView(_self.accessoryCollection,state);
					}
	    		},
	    		error : function(model, error, response){
	    			$("#li-accessory").removeClass("ui-disabled");

	    			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
	    			model.RequestError(error, "Error Retrieving Accessories");
	    		}
	    	});			
		},
		
		LoadFreeStock : function(model){
			var _itemCode = model.get("ItemCode");
			var _unitMeasureCode = model.get("UnitMeasureCode");
			//this.model = model;
			this.model.set(model.attributes);
			var self = this;
			if (!this.freeStockCollection) {
				this.freeStockCollection = new StockCollection();
				//this.freeStockCollection.bind('reset', this.ShowFreeStockView, this);
			}

			var mdl = new BaseModel();
			// this.freeStockCollection.url = Global.ServiceUrl + Service.PRODUCT + Method.LOADLOCATIONSTOCK + _itemCode +"/"+ _unitMeasureCode;
			mdl.url = Global.ServiceUrl + Service.PRODUCT + Method.LOCATIONSTOCKLOOKUP
			mdl.set({ ItemCode : _itemCode, UnitMeasureCode : _unitMeasureCode})
			mdl.save(null,{ 
					success : function(model, response, options){
						if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
						self.ShowFreeStockView(response);				
					},
					error : function(model, error, response){
						if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
						model.RequestError(error, "Error Retrieving Free Stock");
	    				console.log('Error Retrieving Free Stock');
					}
				});

			// this.freeStockCollection.url = Global.ServiceUrl + Service.PRODUCT + Method.LOADLOCATIONSTOCK + _itemCode +"/"+ _unitMeasureCode;
			// this.freeStockCollection.fetch({
			// 		success : function(collection, response) {
			// 			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
			// 			//self.ShowFreeStockView(self.freeStockCollection.reset(response.StockTotalDetails)); //jj26
			// 			self.ShowFreeStockView(response);
			// 		}, 
			// 		error : function(model, error, response){
			  //   			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
			  //   			model.RequestError(error, "Error Retrieving Free Stock");
			  //   			console.log('Error Retrieving Free Stock');
			  //   		}
			// 	});
		},
		
		LoadSubstitute : function(model,rows,criteria ){
			var _self = this;
			var _substituteLookup = new LookupCriteriaModel();
	    	var _rowsToSelect = rows;
	    	var _itemCode = model.get("ItemCode");
	    	
	    	this.model = model;
	    	
	    	//Initialize collection	    	
			if(!this.substituteCollection){
				this.substituteCollection = new SubstituteCollection();
				this.substituteCollection.bind('selected', this.RenderSubView, this);
				this.substituteCollection.bind('showOnHand', this.LoadFreeStock, this);
				this.substituteCollection.bind('itemAdded', this.AddItem, this);
			}
			
			if (!criteria) criteria = "";
			
	    	_substituteLookup.set({
	    		ItemCode : _itemCode,
	    		CriteriaString : criteria,
	    		WebsiteCode : Shared.GetWebsiteCode(),
                WarehouseCode : Global.LocationCode 
	    	})
	    	
	    	_substituteLookup.url = Global.ServiceUrl + Service.PRODUCT + Method.SUBSTITUTELOOKUP + _rowsToSelect;
	    	_substituteLookup.save(null, {
	    		success : function(model, response) {
	    			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
	    			$("#li-substitute").removeClass("ui-disabled");

	    			if (!response.Items) {
	    				
						//console.log(_itemCode + "has no substitute.");
						if(_self.isSearch == true){
							navigator.notification.alert("Item \""+criteria+"\" does not exist.", null, "Item Not Found", "OK");
							$("#accessory-search").val("");
							_self.isSearch = false;
						}else{
							navigator.notification.alert("Item has no substitute.", null, "No Substitute Found", "OK");
						}
						
					}
					else {
						_self.substituteCollection.reset(response.Items);
						_self.ShowView(_self.substituteCollection,state);
					}					 
	    		},
	    		error : function(model, error, response){
	    			$("#li-substitute").removeClass("ui-disabled");
	    			
	    			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
	    			model.RequestError(error, "Error Retrieving Substitute");
	    		}
	    	});		
		},
		
		ShowClearBtn : function(e){
	    	e.stopPropagation();
	    	var _id = e.target.id;
	    	var _id 		= e.target.id;	    	
	    	var _val 		= $("#"+_id).val();
	    	var _strLength 	= _val.length;
	    	var _pos 		= $("#"+_id).position(); // retrieves the position of the given element
	    	var _width		= $("#"+_id).width();
	    	
	    	if (_strLength <= 0) {        						
				this.HideClearBtn();
			} else {					    		
	    		if(_pos !== null || _pos !== "") {
	    			$("#"+_id+"ClearBtn").css({top: (_pos.top + 8), left: (_pos.left + (_width - 25) )}); 
	    			$("#"+_id+"ClearBtn").show();
	    			}	    				   				      		
   			}
	    },
	
	    HideClearBtn : function(){
	    	$(".clearTextBtn").fadeOut();
	    },
	    
	    ClearText : function(e){
	    	var _id = e.target.id;
	    	var id = _id.substring(0, _id.indexOf('ClearBtn'));
	    	$("#"+id).val("");
	    	this.HideClearBtn();
	    },
	    
	    AssignISEImageLocation : function(itemFilename) {
			//console.log(itemFilename);
			var _itemDescription = this.model.get("ItemDescription");
	    	console.log(Global.TransactionType);	
			
			if(itemFilename === undefined || itemFilename === null) {	    			
		    	switch(Global.TransactionType) {
		    		case Enum.TransactionType.UpdateInvoice : 
		    		case Enum.TransactionType.SalesPayment 	:
					case Enum.TransactionType.UpdateOrder 	:
					case Enum.TransactionType.UpdateQuote 	:
					case Enum.TransactionType.ConvertOrder 	:
					case Enum.TransactionType.ConvertQuote 	:
					case Enum.TransactionType.SalesRefund 	:
						var _fileValue 	= _itemDescription.replace(/[^a-zA-Z0-9]/g ,"");
		    			_fileValue 		= _fileValue.replace(/\s+/g, '') + ".jpg";
		    			console.log(_fileValue + " " + this.model.get(_fileValue));				
						return Global.WebSiteURL + Method.ISEIMAGES + Global.ISEImageSize + _fileValue;
					break;
		    	}
	    	}	  
			
			
			return Global.WebSiteURL  + '/' +  Method.ISEIMAGES + Global.ISEImageSize + itemFilename;
		},	

		UpdateSalesTaxAmountField : function(value) {
			if(this.itemView) this.itemView.UpdateSalesTaxAmountField(value);
		},

		UpdateExtPriceField : function(value) {
			if(this.itemView) this.itemView.UpdateExtPriceField(value);
		},
	    
	});
	return ItemDetailView;
});
