/** 
 * @author MJFIGUEROA | 05-01-2013
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
    'collection/base',
    'view/19.1.0/products/controls/generic-popup',	
	'text!template/19.1.0/products/products/detail/unitofmeasure.tpl.html',
    'text!template/19.1.0/products/products/detail/uom/uom.tpl.html',
    'text!template/19.1.0/products/products/detail/uom/acc.tpl.html',
    'text!template/19.1.0/products/products/detail/uom/sub.tpl.html',
    'js/libs/iscroll.js'
], function ($, $$, _, Backbone, Global, Service, Method, Shared,
             BaseModel,
             BaseCollection,
             GenericPopUpView,
             UOMTemplate, UOMLineTemplate, AccLineTemplate, SubLineTemplate) {


    var ClassId = {
        UOM: " .uom select ",
        QTY: " .qty input ",
        UPC: " .upc input ",
        DEL: " .del ",
        UOMCollapse: " .uom-collapse i ",
        UOMTables: " .uom-tables ",
        SELLING : " .selling input ",

        AccDel: " .accDel ",
        AccCode: " .accCode ",
        AccName: " .accName ",
        AccDesc: " .accDesc ",     
        AccTable: " #accessories-table ",
        AccTableGroup: " #tables-accessories ",
        AccCollapse: " .acc-collapse i ",

        SubDel: " .subDel ",       
        SubCode: " .subCode ",
        SubName: " .subName ",
        SubDesc: " .subDesc ",
        SubTable: " #substitute-table ",
        SubTableGroup: " #tables-substitute ",
        SubCollapse: " .sub-collapse i "
    }


    var UOMView = Backbone.View.extend({

        _uomTemplate: _.template(UOMTemplate),
        _uomLine: _.template(UOMLineTemplate),
        _accLine: _.template(AccLineTemplate),
        _subLine: _.template(SubLineTemplate),

        events: {
            "tap .uom-add span": "btnClick_Add",
            "tap .sub-add span": "btnClick_SubAdd",
            "tap .acc-add span": "btnClick_AccAdd",
            "tap .acc-collapse": "btnClick_AccColl",
            "tap .sub-collapse": "btnClick_SubColl",
            "tap .uom-collapse": "btnClick_UoMColl"
        },

        btnClick_Add: function (e) { e.preventDefault(); this.AddNew(); this.Collapse(ClassId.UOMCollapse, true); },
        btnClick_SubAdd: function (e) { e.preventDefault(); this.LoadProductCollection(null ,ClassId.SubTable); },
        btnClick_AccAdd: function (e) { e.preventDefault(); this.LoadProductCollection(null ,ClassId.AccTable); },

        btnClick_AccColl: function (e) { e.preventDefault(); this.Collapse(ClassId.AccCollapse); },
        btnClick_SubColl: function (e) { e.preventDefault(); this.Collapse(ClassId.SubCollapse); },
        btnClick_UoMColl: function (e) { e.preventDefault(); this.Collapse(ClassId.UOMCollapse); },

        initialize: function () {
            this.uomList = new BaseCollection();
            this.$el.show();
        },

        render: function () {
            this.$el.html(this._uomTemplate());

            var itemType = this.model.get("ItemType");
            if (itemType == "Gift Card" || itemType == "Gift Certificate") $(ClassId.AccTableGroup).css('display','none');

            this.LoadUoMCollection();
            this.DisplaySubstitutes();
            this.DisplayAccessories();
            this.CheckReadOnlyMode();
            return this;
        },

        CheckReadOnlyMode: function () {
            if (this.options.IsReadOnly) {
                $(".uom-add span").addClass('ui-disabled');
                $(".sub-add span").addClass('ui-disabled');
                $(".acc-add span").addClass('ui-disabled');

                $(ClassId.UOM).addClass('ui-readonly');
                $(ClassId.UPC).addClass('ui-readonly');
                $(ClassId.QTY).addClass('ui-readonly');

                $(ClassId.DEL).addClass('ui-disabled');
                $(ClassId.AccDel).addClass('ui-disabled');
                $(ClassId.SubDel).addClass('ui-disabled');  
                
                $(ClassId.SubName).addClass('ui-readonly');  
                $(ClassId.AccName).addClass('ui-readonly');  

                $(ClassId.SELLING).addClass('ui-readonly');  
            }
        },

        Show: function () {
            this.GetUoM(); //successful or not, it will call render()
        },

        Close: function () {
            this.remove();
            this.unbind();
        },

        InitializeChildViews: function () {
        },

        GetUoM: function () {
            var self = this;
            var _model = new BaseModel();
            this.uomList = new BaseCollection();
            _model.url = Global.ServiceUrl + Service.PRODUCT + Method.LOADUNITSOFMEASURE;
            _model.fetch({
                success: function (model, option) {
                    if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                    self.uomList.reset(model.get("UnitMeasures"));
                    self.modifyUOMListCollection();
                    self.render();
                },
                error: function (model, error, option) {
                    if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                    self.render();
                }
            });
        },

        isGiftCredits: function() {
            var itemType = this.model.get('ItemType');
            if(itemType == "Gift Card" || itemType == "Gift Certificate") return true;
            return false;
        },

        modifyUOMListCollection: function() {
            if(!this.isGiftCredits()) return;
            this.uomList.each(function(model){
                model.set({UnitMeasureQuantity: 1})
            }, this)
            //if(!(this.model.get('ItemType') == Enum.ItemType.GiftCard || this.model.get('ItemType') == Enum.ItemType.Certificate))
        },

        LoadUoMCollection: function () {
            var self = this;
            var cnt = 0;
            $('#uom-table-base').html("");
            $('#uom-table-additional').html("");

            var hasSelling = false;
            this.collection.each(function(model){  
                if(!hasSelling) hasSelling = model.get("DefaultSelling") || false;
            });

            this.collection.each(function (model) {
                if (model.get("UnitMeasureQty")) {
                    var qty = model.get("UnitMeasureQty");
                    model.set({ UnitMeasureQuantity: qty });
                }

                if(!hasSelling && model.get("IsBase")){
                    model.set({ DefaultSelling: true })
                }

                self.RenderUoM(model, cnt);
                cnt++;
            });
        },

        AddNew: function () {
            if (this.uomList.model.length = 0) {
                navigator.notification.alert("There are no available Unit of Measures!", null, "Error", "OK");
                return;
            }

            if (!this.Validate()) return;

            var _newModel = new BaseModel();
            _newModel.set({
                IsNew: false,
                IsBase: false,
                UnitMeasureQuantity: 0,
                UPCCode: "",
                UnitMeasureCode: "",
                DefaultSelling: false
            });
            this.collection.add(_newModel);
            this.collection.HasChanges = true;
            this.RenderUoM(_newModel, this.collection.models.length - 1);           
        },

        RefreshiScroll: function () {
            if (Global.isBrowserMode) return;
            if (this.myScroll) {
                this.myScroll.refresh();
                if ($("#detail-body").height() < $("#unitofmeasure-details").height()) this.myScroll.scrollToElement('li:first-child', 100);
            }
            else {
                this.myScroll = new iScroll("detail-body", {
                    vScrollbar: true, vScroll: true, snap: true, momentum: true, useTransform: false,
                    onBeforeScrollStart: function (e) {
                        var target = e.target;
                        while (target.nodeType != 1) target = target.parentNode;

                        if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
                            e.preventDefault();
                    }
                });
            }
            $("#detail-body div:first-child").css("width", "100%");
            $(".tables").css("width", "80%");
        },

        RenderUoM: function (model, index) {
            var uomType = "-additional";
            var uomIndex = "uomIndex" + index

            if (model.get("IsBase")) uomType = "-base";
            if (model.get("IsNew")) uomNew = "new";

            var uomTable = "#uom-table" + uomType;

            model.set({ uomIndex: uomIndex });

            if (!model.attributes.HasTransaction) model.set({ HasTransaction : false });

            $(uomTable).append(this._uomLine(model.toJSON()));
            $(".base .qty input").attr('readonly', 'readonly');

            var cid = uomTable + ' #' + uomIndex;
            this.LoadUOMList(cid + ' select', model.get("UnitMeasureCode"));
            if(this.isGiftCredits()) { 
                $(ClassId.QTY).addClass('ui-readonly');
                $(ClassId.QTY).attr('disabled', true);
            }
                                    
            this.BindEvents(model, cid);            
            this.RefreshiScroll();

        },

        BindEvents: function (model, cid) {
            model.set({ cid: cid });
            var self = this;
             $(cid + ClassId.QTY).on("focus", function () { self.Quantity_focus(cid, ClassId.QTY); }); //CSL : 8822 >> 06.05.13 >> PREBRON >> EVENT ADDED.
            $(cid + ClassId.QTY).on("keyup", function () { self.InputError(cid, ClassId.QTY, true); self.ChangeModelAttribute(cid, ClassId.QTY); });
          //  $(cid + ClassId.QTY).on("keydown", function (e) { var c = e.keyCode; if (c == 109 || c == 190 || c == 189) e.preventDefault(); });
            $(cid + ClassId.QTY).on("change", function () { self.ChangeModelAttribute(cid, ClassId.QTY); });
            $(cid + ClassId.QTY).on("blur", function () { self.RevertPreviousValue(cid, ClassId.QTY) ; self.Validate(false, cid, ClassId.QTY); });
            $(cid + ClassId.UPC).on("keyup", function () { self.ChangeModelAttribute(cid, ClassId.UPC); });
            $(cid + ClassId.UPC).on("change", function () { self.ChangeModelAttribute(cid, ClassId.UPC); });
            $(cid + ClassId.UOM).on("change", function () { self.ValidateUMChangeDelete(cid, ClassId.UOM); });
            $(cid + ClassId.DEL).on("tap", function (e) { e.preventDefault(); self.ValidateUMChangeDelete(cid, ClassId.DEL); });
            $(cid + ClassId.SELLING).on("change", function () { self.ChangeModelAttribute(cid, ClassId.SELLING); });
        },

        ValidateUMChangeDelete: function (cid, ctl) {
            if (this.IsNew) {
                this.ChangeModelAttribute(cid, ctl);
                return;
            }

            var umModel;
            this.collection.each(function (model) {
                if (model.get("cid") == cid) umModel = model;
            });
            if (!umModel) return;

            if (!umModel.get("UnitMeasureCode") || umModel.get("UnitMeasureCode") == "") {
                this.ChangeModelAttribute(cid, ctl);
                return;
            }

            var self = this;
            var itemModel = new BaseModel();
            itemModel.set({
                ItemCode: self.model.get("ItemCode"),
                UnitMeasureCode: umModel.get("UnitMeasureCode")
            });

            var toggleDelete = function (inProgress) {
                if (inProgress) {
                    $(cid + ClassId.DEL + ' i').removeClass('icon-trash');
                    $(cid + ClassId.DEL + ' i').addClass("icon-spinner");
                    $(cid + ClassId.DEL + ' i').addClass("icon-spin");
                } else {
                    $(cid + ClassId.DEL + ' i').removeClass("icon-spinner");
                    $(cid + ClassId.DEL + ' i').removeClass("icon-spin");
                    $(cid + ClassId.DEL + ' i').addClass('icon-trash');
                }
            }
            toggleDelete(true);

            itemModel.url = Global.ServiceUrl + Service.PRODUCT + 'isItemHasTransaction/';
            itemModel.save(itemModel, {
                success: function (model, response) {
                    if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                    toggleDelete();
                    if (response.Value) {
                        if (ctl == ClassId.DEL) {
                            Shared.Products.ShowNotification("Unit Measure cannot be deleted when item has transaction.", true);
                        }
                        if (ctl == ClassId.UOM) {
                            $(cid + ClassId.UOM).val(umModel.get("UnitMeasureCode"));
                            Shared.Products.ShowNotification("Unit Measure cannot be changed when item has transaction.", true);
                        }
                        return;
                    }
                    self.ChangeModelAttribute(cid, ctl);                    
                },
                error: function (model, error, response) {
                    if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                    toggleDelete();
                    Shared.Products.ShowNotification("An error was encountered when trying to validate Unit Measure!", true);
                }
            })
        },

        ChangeModelAttribute: function (cid, ctl) {
            var self = this;
            this.collection.each(function (model) {
                if (model.get("cid") == cid) self.DoChangeAttribute(model, cid, ctl);
            });
        },

        DoChangeAttribute: function (model, cid, ctl) {

            var ctlValue = null;
            if (ctl != ClassId.DEL) ctlValue = $(cid + ctl).val();
            this.collection.HasChanges = true;

            switch (ctl) {
                case ClassId.DEL:
                    if (!model) return;
                    if (model.get("IsBase")) return;
                    this.collection.remove(model);
                    this.LoadUoMCollection();
                    break;
                case ClassId.UOM:
                    var qty = null;
                    var uom = ctlValue;
                    var prevVal = model.get("UnitMeasureCode");
                    model.set({ UnitMeasureCode: ctlValue });

                    if (!this.Validate(true)) {
                        model.set({ UnitMeasureCode: prevVal });
                        this.LoadUOMList(cid + ctl, prevVal);
                        return;
                    }

                    if (model.get("IsBase")) break;

                    this.uomList.each(function (model) {
                        if (model.get("UnitMeasureCode") == uom) qty = model.get("UnitMeasureQuantity");
                    });

                    if (qty) {
                        $(cid + ClassId.QTY).val(qty);
                        model.set({ UnitMeasureQuantity: qty, UnitMeasureQty: qty });
                    }
                    break;
                case ClassId.QTY:
                    if (model.get("IsBase")) {
                        model.set({ UnitMeasureQuantity: 1, UnitMeasureQty: 1 });
                        $(cid + ClassId.QTY).val(1);
                        return;
                    }
                    model.set({ UnitMeasureQuantity: ctlValue, UnitMeasureQty: ctlValue });
                    break;
                case ClassId.UPC:
                    model.set({ UPCCode: ctlValue });
                    break;
                case ClassId.SELLING:
                    ctlValue = $(cid + ctl).prop('checked') || false;
                    var currentValue = model.get("DefaultSelling") || false;
                    
                    if(currentValue && !ctlValue){ 
                        $(cid + ctl).attr('checked', true);
                        return;
                    }
                    this.collection.each(function(umModel){
                        if(umModel.get("cid") != cid){
                            umModel.set({ DefaultSelling : false });
                            $(umModel.get("cid") + ctl).attr('checked', false);
                        }
                    });

                    model.set({ DefaultSelling : ctlValue });
                    break;
            }

        },

        LoadUOMList: function (_selectID, _selectedUoM) {
            var DisplayField = "UnitMeasureCode";
            this.uomList.sortedField = DisplayField;
            this.uomList.comparator = function (collection) {
                var self = this;
                return (collection.get(self.sortedField));
            };

            var self = this;
            $(_selectID).html("");
            //$(_selectID).append("<option>&nbsp;</option>");
            this.uomList.sort(DisplayField).each(function (model) {
                var selected = '';
                if (model.get("UnitMeasureCode") == _selectedUoM) selected = 'Selected';
                $(_selectID).append('<option ' + selected + '>' + model.get("UnitMeasureCode") + '</option>');
            });

            if (!_selectedUoM) {
                $(_selectID).prop("selectedIndex", -1);
            }

        },

        Validate: function (checkDuplicatesOnly, cid, ctl) {
            if (!this.collection) return false;
            var self = this;
            var _field = "";
            var _hasError = false;
            var _uoms = "";
            this.collection.each(function (model) {
                if (_hasError) return;
                if (cid && cid != model.get('cid')) return;

                if (!checkDuplicatesOnly && (!ctl || ctl == ClassId.QTY)) {
                    if (!model.get("UnitMeasureCode")) { _hasError = true; _field = "UnitMeasureCode"; return; }
                    if ($.trim(model.get("UnitMeasureCode")) == '') { _hasError = true; _field = "UnitMeasureCode"; return; }

                    if (!model.get("UnitMeasureQuantity")) { _hasError = true; _field = "UnitMeasureQuantity"; return; }
                    if ($.trim(model.get("UnitMeasureQuantity")) <= 0) { _hasError = true; _field = "UnitMeasureQuantity"; return; }
                    if ($.trim(model.get("UnitMeasureQuantity")).indexOf('.') > -1 && !Global.InventoryPreference.IsAllowFractional) { _hasError = true; _field = "UnitMeasureQuantity"; return; }
                }

                if (!ctl || ctl == ClassId.UOM) {
                    if (_uoms.indexOf("[" + model.get("UnitMeasureCode") + "]") > -1) {
                        _hasError = true; _field = "UOM_Duplicate"; return;
                    } else {
                        _uoms = _uoms + "[" + model.get("UnitMeasureCode") + "]";
                        self.InputError(model.get('cid'), ClassId.QTY, true);
                    }
                }
            });
            _uoms = null;
            if (_hasError) {
                this.ValidationError = _field;
                this.trigger('validationError');
                if (cid && ctl) this.InputError(cid, ctl); 
                return false;
            }
            return true;
        },

        InputError: function (cid, ctl, _clear) {
            if (_clear) $(cid + ctl).removeClass('cs-input-error');
            else $(cid + ctl).addClass('cs-input-error');
        },
		
		Quantity_focus : function(cid, ctl) {
			if( cid == '#uom-table-base #uomIndex0' ) return;
			var elem = cid + ctl;			
			this.currentQty = $(elem).val();
			$(elem).val('');
			this.AssignNumericValidation(cid, ctl)
		},
		
		AssignNumericValidation : function(cid, ctl) {
		    var elem = cid + ctl;
		    if (Global.InventoryPreference.IsAllowFractional) {
		        Shared.Input.NonNegative(elem);
		    } else {
		        Shared.Input.NonNegativeInteger(elem);
		    }
        },
        
        RevertPreviousValue : function(cid, ctl) { 
        	if( cid == '#uom-table-base #uomIndex0' ) return;       	
        	var val = $(cid + ctl).val();
        	var lastVal = '';
        	if(val !== '') lastVal = parseFloat(val); 
        	else lastVal = this.currentQty
        	$(cid + ctl).val(lastVal)
        },

       //JHZ! New Featues - Accessories and Substitues ver.14.0
       Collapse: function(table, forceShow){
            var collUp = "icon-chevron-up";
            var collDown = "icon-chevron-down";
            switch(table){
                case ClassId.AccCollapse:
                    if($(ClassId.AccCollapse).hasClass(collUp) && !forceShow){
                        $(ClassId.AccCollapse).removeClass(collUp);
                        $(ClassId.AccCollapse).addClass(collDown);
                        $(ClassId.AccTable).hide();
                    } else {
                        $(ClassId.AccCollapse).removeClass(collDown);
                        $(ClassId.AccCollapse).addClass(collUp);
                        $(ClassId.AccTable).show();                    
                    }
                    break;
                case ClassId.SubCollapse:
                    if($(ClassId.SubCollapse).hasClass(collUp) && !forceShow){
                        $(ClassId.SubCollapse).removeClass(collUp);
                        $(ClassId.SubCollapse).addClass(collDown);
                        $(ClassId.SubTable).hide();
                    } else {
                        $(ClassId.SubCollapse).removeClass(collDown);
                        $(ClassId.SubCollapse).addClass(collUp);
                        $(ClassId.SubTable).show();                    
                    }                    
                    break;
                case ClassId.UOMCollapse:
                    if($(ClassId.UOMCollapse).hasClass(collUp) && !forceShow){
                        $(ClassId.UOMCollapse).removeClass(collUp);
                        $(ClassId.UOMCollapse).addClass(collDown);
                        $(ClassId.UOMTables).hide();
                    } else {
                        $(ClassId.UOMCollapse).removeClass(collDown);
                        $(ClassId.UOMCollapse).addClass(collUp);
                        $(ClassId.UOMTables).show();                    
                    }                      
                    break;            
            } 
            this.RefreshiScroll();              
       },

       ShowProductLookUp: function(){            
            if(!this.genericpopup || this.genericpopup.Closed){ 
                $(".page-popup").html("<div></div>");
                this.genericpopup = new GenericPopUpView({ el : ".page-popup div" });
                this.genericpopup.on("search", this.SearchItem, this);
                this.genericpopup.on("selected", this.SelectedItem, this);
                this.genericpopup.collection = this._products; 
                this.genericpopup.SetPlaceHolder("Search Products");
                this.genericpopup.SetDisplayField("ItemName");
                this.genericpopup.SetExtDisplayField("ItemDescription");                
                this.genericpopup.Show();
            } else {
                this.genericpopup.RefreshList(this._products);
            }

            if(this.ItemLoadedFor == ClassId.SubTable) this.genericpopup.SetTitle("Substitute");                          
            if(this.ItemLoadedFor == ClassId.AccTable) this.genericpopup.SetTitle("Accessory");    

        },
        
        SearchItem: function(){
            if(this.genericpopup) this.LoadProductCollection(this.genericpopup.GetItemToSearch(), this.ItemLoadedFor, this.ItemIndex);
        }, 

        SelectedItem: function(){
            this.SelectedItemModel = null;
            if(this.genericpopup){
                  var tmpModel = new BaseModel();                  
                  if(this.genericpopup.GetSelectedModel()) tmpModel.set(this.genericpopup.GetSelectedModel().attributes);
                  this.SelectedItemModel = tmpModel;
                  this.genericpopup.Close();                                                     
                  if(this.ItemLoadedFor == ClassId.SubTable) this.LoadSelectedSub(tmpModel);                  
                  if(this.ItemLoadedFor == ClassId.AccTable) this.LoadSelectedAcc(tmpModel);                 
            }       
        },        

        LoadSelectedAcc: function(selectedModel){
            var alreadyExist = false;
            var newModel = new BaseModel();
            this.accessories.each(function(model){
                if(model.get("AccessoryCode") == selectedModel.get("ItemCode")) alreadyExist = true;
            });

            if(alreadyExist){
                this.ValidationError = "AccessoryExist";
                this.trigger('validationError');
                return;
            }

            this.accessories.HasChanges = true;

            var self = this;
            if(this.ItemIndex && this.ItemIndex != ""){
                this.accessories.each(function(model){
                    if(model.get("accIndex") == self.ItemIndex){
                        model.set({
                            AccessoryCode: selectedModel.get("ItemCode"),
                            AccessoryName: selectedModel.get("ItemName"),
                            AccessoryDesc: selectedModel.get("ItemDescription")
                        });                         
                        $("#" + self.ItemIndex + ClassId.AccCode).html(Shared.EscapedModel(model).get("AccessoryCode"));
                        $("#" + self.ItemIndex + ClassId.AccName).html(Shared.EscapedModel(model).get("AccessoryName"));
                        $("#" + self.ItemIndex + ClassId.AccDesc).html(Shared.EscapedModel(model).get("AccessoryDesc"));
                    }
                });
                return;
            }

            newModel.set({
                AccessoryCode: selectedModel.get("ItemCode"),
                AccessoryName: selectedModel.get("ItemName"),
                AccessoryDesc: selectedModel.get("ItemDescription")
            }); 
            this.accessories.add(newModel);            
            this.RenderAccLine(newModel, this.accessories.length);
        },

        LoadSelectedSub: function(selectedModel){
            var alreadyExist = false;
            var newModel = new BaseModel();
            this.substitutes.each(function(model){
                if(model.get("SubstituteCode") == selectedModel.get("ItemCode")) alreadyExist = true;
            });

            if(alreadyExist){
                this.ValidationError = "SubstituteExist";
                this.trigger('validationError');
                return;
            }
            
            this.substitutes.HasChanges = true;

            var self = this;
            if(this.ItemIndex && this.ItemIndex != ""){
                this.substitutes.each(function(model){
                    if(model.get("subIndex") == self.ItemIndex){
                        model.set({
                            SubstituteCode: selectedModel.get("ItemCode"),
                            SubstituteName: selectedModel.get("ItemName"),
                            SubstituteDesc: selectedModel.get("ItemDescription")
                        });                         
                        $("#" + self.ItemIndex + ClassId.SubCode).html(Shared.EscapedModel(model).get("SubstituteCode"));
                        $("#" + self.ItemIndex + ClassId.SubName).html(Shared.EscapedModel(model).get("SubstituteName"));
                        $("#" + self.ItemIndex + ClassId.SubDesc).html(Shared.EscapedModel(model).get("SubstituteDesc"));
                    }
                });
                return;
            }
                     
            newModel.set({
                SubstituteCode: selectedModel.get("ItemCode"),
                SubstituteName: selectedModel.get("ItemName"),
                SubstituteDesc: selectedModel.get("ItemDescription")
            }); 
            this.substitutes.add(newModel);            
            this.RenderSubLine(newModel, this.substitutes.length);            
        },

        LoadProductCollection: function (_itemCode, loadFor, itemIndex) {
            this.ItemLoadedFor = loadFor;
            this.ItemIndex = itemIndex;
            this.InitializeProductLookUp();
            this._productLookUp.set({ 
                StringValue: _itemCode, 
            });
            this._productLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETITEMLIST;
            this._productLookUp.save();
            Shared.Products.Overlay.Show();
        },

        InitializeProductLookUp: function () {
            if (!this._productLookUp) {
                this._productLookUp = new BaseModel();
                this._productLookUp.on('sync', this.ProductLookUpLoadSuccess, this);
                this._productLookUp.on('error', this.ProductLookUpLoadError, this);
            }
        },

        ProductLookUpLoadSuccess: function (model, response, options) {
            if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            if (!this._products) this._products = new BaseCollection();
            this._products.reset(response.Items); 

            if(this.model){
                if(this.model.get("ItemCode") && this.model.get("ItemCode") != ""){
                    var itemToRemove;
                    var itemCode = this.model.get("ItemCode");
                    this._products.each(function(item){
                        if(itemToRemove) return;
                        if(item.get("ItemCode") == itemCode) itemToRemove = item;
                    });
                    if(itemToRemove) this._products.remove(itemToRemove);
                }
            }

            this.ShowProductLookUp();
        },

        ProductLookUpLoadError: function (model, error, options) {
            if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            console.log(model);
            Shared.Products.Overlay.Hide();
        },

        DisplaySubstitutes: function(){
            if(this.substitutes){
                $(ClassId.SubTable).html("");
                var self = this;
                var _modelIndex = 0;
                this.substitutes.each(function(model){                     
                    _modelIndex++;
                    self.RenderSubLine(model, _modelIndex);                     
                });
            } else {
                $(ClassId.SubTable).html("");
            }
        },

        RenderSubLine: function(model, _modelIndex){
            if(!_modelIndex) _modelIndex = this.substitutes.length + 1;

            var itemDesc = (model.get("SubstituteDesc") || model.get("ItemDescription"));

            model.set({
                subIndex: "subLine" + _modelIndex,
                SubstituteDesc: itemDesc
            });

            $(ClassId.SubTable).append(this._subLine(Shared.EscapedModel(model).toJSON()));

            this.Collapse(ClassId.SubCollapse, true);

            this.BindeSubLineEvents(model);        
            this.RefreshiScroll(); 
        },
        
        BindeSubLineEvents: function(model){
            var self = this;
            var cid = ClassId.SubTable + " #" + model.get("subIndex");            
            $(cid + ClassId.SubDel).on("tap", function (e) { e.preventDefault(); self.DeleteSubLine(model.get("subIndex")); });
            $(cid + ClassId.SubName).on("tap", function (e) { e.preventDefault(); self.LoadProductCollection(null, ClassId.SubTable, model.get("subIndex")); });
        },

        DeleteSubLine: function(subIndex){
            var modelToDelete;
            if(this.substitutes){
                this.substitutes.each(function(model){  
                    if(modelToDelete) return;
                    if(subIndex == model.get("subIndex")){
                        modelToDelete = model;
                    }
                });
            }
            if(modelToDelete){
                this.substitutes.remove(modelToDelete);
                this.substitutes.HasChanges = true;
                this.DisplaySubstitutes();
            }
        },

        DisplayAccessories: function(){
            if(this.accessories){
                $(ClassId.AccTable).html("");
                var self = this;
                var _modelIndex = 0;
                this.accessories.each(function(model){                     
                    _modelIndex++;
                    self.RenderAccLine(model, _modelIndex);                     
                });
            } else {
                $(ClassId.AccTable).html("");
            }
        },     

        RenderAccLine: function(model, _modelIndex){
            if(!_modelIndex) _modelIndex = this.accessories.length + 1;

            var itemDesc = (model.get("AccessoryDesc") || model.get("ItemDescription"));

            model.set({
                accIndex: "accLine" + _modelIndex,
                AccessoryDesc: itemDesc
            });

            $(ClassId.AccTable).append(this._accLine(Shared.EscapedModel(model).toJSON()));
            
            this.Collapse(ClassId.AccCollapse, true);
            
            this.BindeAccLineEvents(model);
            this.RefreshiScroll();             
        },

        BindeAccLineEvents: function(model){
            var self = this;
            var cid = ClassId.AccTable + " #" + model.get("accIndex");            
            $(cid + ClassId.AccDel).on("tap", function (e) { e.preventDefault(); self.DeleteAccLine(model.get("accIndex")); });
            $(cid + ClassId.AccName).on("tap", function (e) { e.preventDefault(); self.LoadProductCollection(null, ClassId.AccTable, model.get("accIndex")); });
        },
          
        DeleteAccLine: function(accIndex){
            var modelToDelete;
            if(this.accessories){
                this.accessories.each(function(model){  
                    if(modelToDelete) return;
                    if(accIndex == model.get("accIndex")){
                        modelToDelete = model;
                    }
                });
            }
            if(modelToDelete){
                this.accessories.remove(modelToDelete);
                this.accessories.HasChanges = true;
                this.DisplayAccessories();
            }
        }

    });
    return UOMView;
});



