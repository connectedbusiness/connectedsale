
define([
    'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',	
    'model/base',
    'model/lookupcriteria',
    'collection/base',
    'view/15.1.0/products/openingbalance/controls/ob-item',
	'text!template/15.1.0/products/controls/generic-list.tpl.html',
    'js/libs/iscroll.js'
], function ($, $$, _, Backbone, Global, 
             BaseModel, LookUpCriteriaModel,
             BaseCollection,
             GenericItemView,
             GenericListTemplate) {

    var ClassID = {
        SearchInput: "#txt-search",
        ClearButton: "#btn-clear"
    }

    var DisplayField = "ConvertedTransactionDate";
    
    var PlaceHolder = "Search";
    var SelectedModel = null;

    var GenericListView = Backbone.View.extend({

        _genericListTemplate: _.template(GenericListTemplate),

        events: {
            "tap #btn-search": "btnSearch_click",
            // "keyup #txt-search": "txtSearch_keyup",
            "keypress #txt-search": "txtSearch_keypress",
            "blur #txt-search": "txtSearch_Blur",
            "focus #txt-search": "txtSearch_Focus",
            "tap #btn-add": "btnAdd_click",
            "tap #btn-clear": "btnClear_Click"
        },

        btnAdd_click: function (e) { e.preventDefault(); this.trigger("add"); },
        btnSearch_click: function (e) { e.preventDefault(); this.TriggerSearch(); },
        btnClear_Click: function (e) { if (e) e.preventDefault(); $(ClassID.SearchInput).val(''); $(ClassID.SearchInput).focus(); },
        txtSearch_Focus: function () { $(ClassID.ClearButton).fadeIn(); },
        txtSearch_Blur: function () { $(ClassID.ClearButton).fadeOut(); },
        //txtSearch_keyup: function (e) { if (e.keyCode === 13) { this.TriggerSearch(); } },
        txtSearch_keypress: function (e) { if (e.keyCode === 13) { this.TriggerSearch(); } },

        initialize: function () {
            this.DisplayField = "ItemDescription"; //Default
            this.ExtDisplayField = null;
            this.PlaceHolder = "Search";
            this.SelectedModel = null;
            this.FirstModel = null;
            this.$el.show();
        },

        render: function () {
            this.$el.html(this._genericListTemplate({ PlaceHolder: this.PlaceHolder }));

            if (this.options.DisableAdd) $("#btn-add").addClass('ui-disabled');
            else $("#btn-add").removeClass('ui-disabled');

            return this;
        },

        Show: function () {
            this.render();
            this.DisplayItemList();
        },

        InitializeChildViews: function () {
        },

        SetDisplayField: function (val) { this.DisplayField = val; },
        SetExtDisplayField: function (val) { this.ExtDisplayField = val; },
        SetPlaceHolder: function (val) { this.PlaceHolder = val; },
        GetItemToSearch: function () { return $(ClassID.SearchInput).val(); },
        ClearSearchBox: function () { $(ClassID.SearchInput).val(''); },
        GetSelectedModel: function () { return this.SelectedModel; },
        GetFirstModel: function () { return this.FirstModel; },

        TriggerSearch: function (_val) {
            if (_val) $(ClassID.SearchInput).val(_val);
            this.trigger("search");
        },

        TriggerItemSelect: function (model) {
            this.SelectedModel = model;
            this.HighlightItem(model);
            this.trigger("selected");
        },

        HighlightItem: function (model) {
            var viewID = model.get("ViewID");
            $(".list .item").removeClass("selectedItem");
            $("#" + viewID).addClass("selectedItem");
        },

        SelectByAttribute: function (attr, val, preventScroll) {
            if (!attr || !val || !this.collection) return;
            var modelMatch = null;
            this.collection.each(function (model) {
                if (model.attributes[attr] == val) {
                    if (!modelMatch) modelMatch = model;
                }
            });
            if (modelMatch) {
                this.HighlightItem(modelMatch);
                if (preventScroll) return;
                if (this.myScroll) {
                    var viewID = modelMatch.get("ViewID");
                    this.myScroll.scrollToElement("#" + viewID, 100);
                    this.myScroll.refresh();
                }
            }
        },

        RefreshiScroll: function () {
            if (Global.isBrowserMode) return;
            if (this.myScroll) {
                this.myScroll.refresh();
                if ($("#list").height() < $("#list-wrapper").height()) this.myScroll.scrollToElement('li:first-child', 100);
            }
            else {
                this.myScroll = new iScroll("list", { vScrollbar: true, vScroll: true, snap: true, momentum: true });
            }
        },

        RefreshList: function (collection) {
            if (collection) this.collection = collection;
            this.DisplayItemList();
        },

        DisplayItemList: function () {

            this.SelectedModel = null;
            this.FirstModel = null;
            
            if (!this.collection) return;
            $("#list-wrapper").html("<ul></ul>");
            
            var oldLetter = "", newLetter = "", isColored = false, self = this, isFirstItem = true;
            var _createNewModel = function () { return new BaseModel(); };            
            var _render = function (model) {
                var _view = new GenericItemView();
                _view.model = model;
                $("#list-wrapper ul").append(_view.render().$el.html());
                if (!model.attributes.IsHeader) $("#" + _view.cid).on("tap", function () { self.TriggerItemSelect(model); });
            }

            this._copiedCollection = new BaseCollection();       
            this._copiedCollection.reset(this.collection.models);
			
            this._copiedCollection.sortedField = DisplayField;
            this._copiedCollection.each(function (model) {
            	
                var DisplayAttributes = { IsHeader: false, IsItem: false, IsColored: false, DisplayText: "" };
                
                newLetter = model.get(DisplayField);
                
                if (newLetter != oldLetter) {
                    var _model = _createNewModel();
                    _model.attributes.IsHeader = true;
                    _model.attributes.IsItem = false;
                    _model.attributes.IsColored = false;
                    _model.attributes.DisplayText = newLetter;                    
                    _model.attributes.IsSelected = false;
                    _model.attributes.ExtDisplayField = null;
                    _model.attributes.Type = "ConvertedTransactionDate";        
                    
                    _render(_model);
                    isColored = false;
                }
                oldLetter = newLetter;
                model.attributes.IsHeader = false;
                model.attributes.IsItem = true;                
                model.attributes.IsColored = isColored;
                model.attributes.DisplayText = model.get(DisplayField);                
                model.attributes.Type = "ConvertedTransactionDate";                                        
                model.attributes.Quantity = model.get("Quantity");
                model.attributes.Cost =  model.get("Cost").toFixed(2);    
                model.attributes.UoM =  model.get("UnitMeasureCode");                     
               	model.attributes.CurrencySymbol =  Global.CurrencySymbol;
               	
               	model.attributes.IsSelected = isFirstItem;
               	if (isFirstItem) this.FirstModel = model;
                isFirstItem = false;
               	
                _render(model);
                if (isColored) isColored = false; else isColored = true;
            });
            if(Global.isBrowserMode) return;
            else this.RefreshiScroll();
        }

    });
    return GenericListView;
});



