/** 
 * @author PRDEBRON | 05.17.13
 * Required: el, collection 
 */
define([
    'jquery',
	'mobile',
	'underscore',
	'backbone',
    'shared/service',
    'shared/method',
	'shared/shared',
    'shared/global',		
    'model/base',
    'model/lookupcriteria',
    'collection/base',
	'text!template/22.0.0/products/openingbalance/detail/openingbalance.tpl.html',
    'text!template/22.0.0/products/openingbalance/detail/openingbalance/oblist.tpl.html',    	
	'js/libs/moment.min.js',
    'js/libs/iscroll.js',
    'js/libs/format.min.js'
], function ($, $$, _, Backbone, Service,Method, Shared, Global,
             BaseModel, LookUpCriteriaModel,
             BaseCollection,
             OBTemplate, OBLineTemplate) {


    var ClassID = {               
        INAME	: " .td-itemname input ", 
        TDATE	: " .td-tdate input ",
        OBC	 	: " .td-obcode input ",
        LOC	 	: " .td-location select ",
        QTY		: " .td-quantity input ",
        COST	: " .td-cost input ",
        DEL		: " .del #btn-del "
    }


    var UOMView = Backbone.View.extend({

        _obTemplate: _.template(OBTemplate),
        _obLine: _.template(OBLineTemplate),

        events: {
            "tap .ob-add span": "btnClick_Add"
        },

        btnClick_Add: function (e) { e.preventDefault(); this.AddNew(); },

        initialize: function () {
            this.uomList = new BaseCollection();
            this.$el.show();
        },

        render: function () {
            this.$el.html(this._obTemplate());
            this.LoadOBCollection(true);
            Shared.BrowserModeDatePicker(ClassID.TDATE,"datepicker","yy-mm-dd");
            return this;
        },

        Show: function () {
            //this.GetUoM(); //successful or not, it will call render()
            this.render();
        },

        Close: function () {
            this.remove();
            this.unbind();
        },

        InitializeChildViews: function () { },        

        LoadOBCollection: function (fromRender) {
            var self = this;
            var cnt = 0;
            $('#ob-table-additional').html("");
            this.collection.each(function (model) {
                self.RenderOB(model, cnt, !fromRender);
                cnt++;
            });
        },

        AddNew: function () {
        	this.BlurAllElements();
            var _newModel = new BaseModel();
            _newModel.set(this.NewOBSchema);
            _newModel.set({ IsNew: false, IsBase: false, });
            this.collection.add(_newModel);
            this.RenderOB(_newModel, this.collection.models.length - 1);
        },

        RefreshiScroll: function () {
            if (this.myScroll) {
                this.myScroll.refresh();
                if ($("#opening-balance-body").height() < $("#ob-details").height()) this.myScroll.scrollToElement('li:first-child', 100);
            }
            else {
                this.myScroll = new iScroll("opening-balance-body", {
                    vScrollbar: true, vScroll: true, snap: true, momentum: true, useTransform: false,
                    onBeforeScrollStart: function (e) {
                        var target = e.target;
                        while (target.nodeType != 1) target = target.parentNode;

                        if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
                            e.preventDefault();
                    }
                });
            }
            $("#opening-balance-body div:first-child").css("width", "100%");
            $(".tables").css("width", "96%");
        },

        RenderOB: function (model, index, isReload) {
            var obType = "-additional";
            var obIndex = "obIndex" + index;
            var obTable = "#ob-table" + obType;

            model.set({ obIndex: obIndex });
            $(obTable).append(this._obLine(model.toJSON()));
            var cid = obTable + ' #' + obIndex;
            this.LoadLocationCodes(cid, model.get("ItemCode"));
            this.SetSelectedLocation(cid, model, isReload);
            this.BindEvents(model, cid);
            Shared.BrowserModeDatePicker("#"+obIndex+"> .td-tdate > input","datepicker","yy-mm-dd");
            if(Global.isBrowserMode) Shared.UseBrowserScroll('#opening-balance-body');
            else this.RefreshiScroll();
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
        
        SetSelectedLocation: function (cid, model, isReload) {
            var onSuccess = function (warehouseCode) {
                var _val = warehouseCode || model.get("WarehouseCode");
                model.set({ WarehouseCode: _val });
                $(cid + ClassID.LOC + " > option[value='" + _val + "']").attr("selected", "selected");
            }
            if (isReload) {
                onSuccess();
                return;
            }
            this.ValidateDefaultLocationStatus(onSuccess);
        },
        
        LoadLocationCodes: function (_selectID, _selectedUoM) {
            if(this.locationCodeCollection.length === 0) return;
            this.locationCodeCollection.each(function (model) {
                if (!model.get("IsActive")) return;
            	var _warehouseCode = model.get("WarehouseCode");
            	$(_selectID + ClassID.LOC).append(new Option(_warehouseCode,_warehouseCode))
            });            
        }, 

        BindEvents: function (model, cid) {
            model.set({ cid: cid });
            var self = this;            
            
            $(cid + ClassID.INAME).on("tap", function (e) { e.preventDefault(); self.LoadItemLookUp(cid, ClassID.INAME); });
            
            $(cid + ClassID.TDATE).on("change", function () { self.ChangeModelAttribute(cid, ClassID.TDATE); });
            
            $(cid + ClassID.LOC).on("change", function () { self.ChangeModelAttribute(cid, ClassID.LOC); });
            
            $(cid + ClassID.OBC).on("change", function () { self.ChangeModelAttribute(cid, ClassID.OBC); });            
            $(cid + ClassID.OBC).on("focus", function () { self.ClearField(cid, ClassID.OBC); });            
            $(cid + ClassID.OBC).on("blur", function () { self.RevertField(cid, ClassID.OBC); });
            
            $(cid + ClassID.QTY).on("change", function () { self.ChangeModelAttribute(cid, ClassID.QTY); });
            $(cid + ClassID.QTY).on("focus", function () { self.SaveAndClearValue(cid, ClassID.QTY); });
            $(cid + ClassID.QTY).on("blur", function () { self.RevertPreviousValue(cid, ClassID.QTY); });
            
            $(cid + ClassID.COST).on("change", function () { self.ChangeModelAttribute(cid, ClassID.COST); });
            $(cid + ClassID.COST).on("focus", function () { self.SaveAndClearValue(cid, ClassID.COST); });
            $(cid + ClassID.COST).on("blur", function () { self.RevertPreviousValue(cid, ClassID.COST); });
            $(cid + ClassID.COST).on("keyup", function (e) { self.Cost_Keyup(e); });
            
            $(cid + ClassID.DEL).on("tap", function (e) { e.preventDefault(); self.ChangeModelAttribute(cid, ClassID.DEL); });                        
        },   

        Cost_Keyup : function(e) { 
            if (e.currentTarget.value == '0.' || e.currentTarget.value == '.') {
                $(e.target).val("0.0");
                $(e.target).focus();
                $(e.target).val("0.");                
            }
        },
        
        ChangeModelAttribute: function (cid, ctl) {
            var self = this;
            this.collection.each(function (model) {
                if (model.get("cid") == cid) {
                    self.DoChangeAttribute(model, cid, ctl);
                }
            });
        },
        HasDucplicateOBCode : function (obcode,collection,cid) {
                var hasDuplicate = false;
                var modelFinder = collection.find(function (model) {
                    if (model.get("OpeningBalanceCode") == obcode && model.get("cid") != cid) {
                        hasDuplicate = true;
                    }
                });
                if (hasDuplicate) {
                    Shared.ShowNotification("Duplicate Opening Code exists.", true);
                }
                return hasDuplicate;

        },
        CheckIfOBCodeAlreadyExist : function (onSuccess,obcode) {
            var duplicateOBCodeModel = new BaseModel();
            var self = this;
            duplicateOBCodeModel.set({
                StringValue: obcode,
            });
            duplicateOBCodeModel.url = Global.ServiceUrl + Service.PRODUCT + Method.OPENINGBALANCELOOKUP + "100";
            duplicateOBCodeModel.save(null,{
                success: function (model, response, options) {
                    if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                    onSuccess(response);
                }
            });
        },

        DoChangeAttribute: function (model, cid, ctl) {
            var ctlValue = null;
            var self = this;
            if (ctl != ClassID.DEL) ctlValue = $(cid + ctl).val();

            switch (ctl) {
                case ClassID.DEL:
                    if (!model) return;
                    this.collection.remove(model);
                    this.LoadOBCollection();
                    break;
                case ClassID.INAME :
                	this.currentCID = cid;
                	//this.currentItemCode = ctlValue;
                	this.currentItemCode = model.get("ItemCode");
                	this.trigger('itemChanged');
                	console.log('itemChanged');
                	break;	
                case ClassID.TDATE :                	       
                	var transactionDate = this.JsonToAspDate(ctlValue);
                	model.set({ TransactionDate : transactionDate,
                				ConvertedTransactionDate : ctlValue });
                	break;
                case ClassID.OBC :   
                	if (ctlValue === "") return;              	
                	if (ctlValue === "[To be generated]") return;   
                	        	
                	var _obi = "OBI-";
                	var _obiVal = ctlValue;
                	var x  = ctlValue.slice(0,4)
                	if (x !== "OBI-") _obiVal = _obi + ctlValue;

                	if (this.HasDucplicateOBCode(_obiVal, this.collection, cid))//check duplicates on list
                	{
                	    $(cid + ctl).val("[To be generated]");
                	    model.set({ OpeningBalanceCode: "[To be generated]" });
                	    return;
                	}
                	var onSuccess = function (response) {
                	    var _obCodeCollection = new BaseCollection();
                	    _obCodeCollection.reset(response.InventoryOpeningBalance);
                	    console.log("Openning balance code found : " + _obCodeCollection.length);
                	    if (_obCodeCollection.length > 0) {
                	        if (self.HasDucplicateOBCode(_obiVal, _obCodeCollection, cid)) {
                	            $(cid + ctl).val("[To be generated]");
                	            model.set({ OpeningBalanceCode: "[To be generated]" });
                	            return;
                	        }
                	    }
                	    $(cid + ctl).val(_obiVal)
                	    model.set({ OpeningBalanceCode: _obiVal });
                	};
                	this.CheckIfOBCodeAlreadyExist(onSuccess,_obiVal); //check duplicates on server/database
                	break;               
                case ClassID.LOC :
                	model.set({ WarehouseCode : ctlValue });
                	break;
                case ClassID.QTY :
                	model.set({ Quantity : ctlValue });
                	break;
                case ClassID.COST :
                	model.set({ Cost : ctlValue });
                	break;
            }
        },    
            
        RevertField : function(cid, ctl) {
        	var ctlValue = $(cid + ctl).val();
        	if (ctlValue === "" ) $(cid + ctl).val('[To be generated]');        	        	
        },
        
        ClearField : function(cid, ctl) {
        	var ctlValue = $(cid + ctl).val();
        	if (ctlValue === "[To be generated]" ) $(cid + ctl).val('');        	
        },
        
        LoadItemLookUp: function (cid, ctl) {
        	var self = this;
        	this.BlurAllElements();        	
        	this.collection.each(function (model) {
                if (model.get("cid") == cid) { self.SetCurrentModel(model, cid, ctl);} 
            });
        },
        
        BlurAllElements: function (cid, ctl) {
			$(ClassID.TDATE).blur(); 
        	$(ClassID.OBC).blur();
        	$(ClassID.QTY).blur();
        	$(ClassID.COST).blur();
        },
        
        
        SetCurrentModel: function (model, cid, ctl) {
        	if(!this.currentmodel) this.currentmodel = new BaseModel()
        	this.currentmodel = model;
        	this.currentCID = cid;
        	console.log('tappped! :cid ' + cid);
        	this.trigger('itemLookup');
        },
        
        ReplaceModelByCID: function(jsonResponse) {
        	var _cid = this.currentCID;
        	var self = this;
        	this.collection.each(function (model) {
        	    if (model.get("cid") == _cid) {
        	        var origModel = model.clone();
                	model.set(jsonResponse);                	               	
                	var _jsonDate = model.get("TransactionDate");  
                	var _cost = (jsonResponse.Cost).toFixed(2);        
                	       	
                	model.set({
                	    ConvertedTransactionDate: self.JSONtoDate(_jsonDate),
                	    Cost: _cost,
                	    WarehouseCode: origModel.get("WarehouseCode")
                	});
                	console.log(model.get("cid"));
                	self.LoadOBCollection();
                 } 
            });
        },       
        
        GetCurrentCollection: function() { 
        	console.log(this.collection.length);
        	_tmp = new BaseCollection();
        	_tmp = this.collection;      	
        	return _tmp;
        },
        
        JsonToAspDate : function (value) {        	
            var oldDate = Date.parse(value);
            var newDate = new Date(oldDate);
			var m = newDate.getMonth();
			var d = newDate.getDate();
			var y = newDate.getFullYear();
			newDate = Date.UTC(y,m,d);	
			newDate ="/Date(" + newDate + ")/";	 
        	return newDate;
        },
        
        JSONtoDate : function(transactionDate){
		   //var DateFormat = 'dd MMMM YYYY';
		   var DateFormat = 'YYYY-MM-DD';
		   var _tDate = moment( transactionDate ).format(DateFormat); 
		   return _tDate;
		},
        
        SaveAndClearValue : function(cid, ctl) {    
        	var elemID = cid + ctl; 	
        	var val = $(elemID).val();        	
        	switch (ctl) {                
                case ClassID.QTY  : this.lastQty  = val; break;
                case ClassID.COST : this.lastCost = val; break;
            }       	        	
        	$(elemID).val('');
        	this.AssignNumericValidation(cid, ctl);
        },     
		
		RevertPreviousValue : function(cid, ctl) {
			elemID = cid + ctl;
			var val = $(elemID).val();
        	var lastVal = ''; 
        	//var qty = parseFloat(this.$(this.classID.CID+"#changeQty").val());
        	if(val !== '') lastVal = parseFloat(val); 
        	else {
        		switch (ctl) {                
                case ClassID.QTY  : lastVal = this.lastQty; break;
                case ClassID.COST : lastVal = this.lastCost; break;
           		}
        	}
        	                   	
        	$(elemID).val(lastVal)
        },
        
        AssignNumericValidation : function(cid, ctl) {        	
        	var elem = cid + ctl;
           	switch (ctl) {                
                case ClassID.QTY : Shared.Input.NonNegativeInteger(elem); break;
                case ClassID.COST : Shared.Input.Numeric(elem); break;
            }
        },
        
    });
    return UOMView;
});



