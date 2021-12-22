/** 
* @author MJFIGUEROA | 05-01-2013 

DOCUMENTATION OF FUNCTIONS:

SetDisplayField(val)    
    * Sets the model's Attribute/Field to display in the list. Default is "ItemDescription"

SetPlaceHolder(val)     
    * Sets the PlaceHolder text in the Search Input Box. Default is "Search".

GetItemToSearch()       
    * Gets the Search Input Box value.

ClearSearchBox()        
    * Clears the Search Input Box.

GetSelectedModel()      
    * Gets the currently selected model by the user from the last Tap/Click. Default is NULL if user does not click any item even there are items in the list.

GetFirstModel()         
    * Gets the first model in the list (sorted). If there are no item in the list, returns NULL.

SelectByAttribute(attr, val, preventScroll)
    * High-lights the item on the list that matches the value (val) of the indicated attribute (attr) then scrolls to that item if found.
    * If preventScroll is set to true, it will prevent the list from scrolling to that item.
    * Ex. genericList.SelectByAttribute("ItemCode", "ITEM-0001", true);
    * >> Will look for the item whose attribute named 'ItemCode' is eqaul to 'ITEM-0001', and prevent it from srolling to that item.

RefreshList(collection)
    * Refreshes the item list with the new collection. If new collection is not specified, it will reload the existing collection from last load.

*/
define([
    'jquery',
	'mobile',
	'underscore',
	'backbone',	
    'shared/global',
    'model/base',
    'collection/base',
    'view/22.0.0/products/controls/generic-item',
	'text!template/22.0.0/products/controls/generic-list.tpl.html',
    'js/libs/iscroll.js',
    'js/libs/format.min.js'
], function ($, $$, _, Backbone, Global,
             BaseModel,
             BaseCollection,
             GenericItemView,
             GenericListTemplate) {

    var ClassID = {
        SearchInput: "#txt-search",
        ClearButton: "#btn-clear"
    }

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
            this.Sorted = true;
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
        DisplayItemList: function () {

            this.SelectedModel = null;
            this.FirstModel = null;

            if (!this.collection) return;
            $("#list-wrapper").html("<ul></ul>");

            var oldLetter = "", newLetter = "", isColored = false, self = this;
            var _createNewModel = function () { return new BaseModel(); };
            var _render = function (model) {
                var _view = new GenericItemView();
                _view.model = model;
                $("#list-wrapper ul").append(_view.render().$el.html());
                if (!model.attributes.IsHeader) $("#" + _view.cid).on("tap", function () { self.TriggerItemSelect(model); });
            }

            this._copiedCollection = new BaseCollection();
            this._copiedCollection.reset(this.collection.models);

            //Sorting Method
            this._copiedCollection.sortedField = this.DisplayField;
            this._copiedCollection.comparator = function (collection) {
                var self = this;
                return (collection.get(self.sortedField));
            };
            var isFirstItem = true;
            var self = this;

            var _each = function (model) {

                var DisplayAttributes = { IsHeader: false, IsItem: false, IsColored: false, DisplayText: "" };
                var transactionDate = self.JSONtoDate(model.get("TransactionDate"));
				newLetter = transactionDate;
                //newLetter = model.get(self.DisplayField).substr(0, 1);
                if (newLetter != oldLetter) {
                    var _model = _createNewModel();
                    _model.attributes.IsHeader = true;
                    _model.attributes.IsItem = false;
                    _model.attributes.IsColored = false;
                    _model.attributes.DisplayText = newLetter;
                    _model.attributes.IsSelected = false;
                    _model.attributes.ExtDisplayField = null;
                    _render(_model);
                    isColored = false;
                }

                oldLetter = newLetter;
                model.attributes.IsHeader = false;
                model.attributes.IsItem = true;
                model.attributes.IsColored = isColored;
                model.attributes.DisplayText = model.get(self.DisplayField);

                if (self.ExtDisplayField) model.attributes.ExtDisplayField = model.get(self.ExtDisplayField);
                else model.attributes.ExtDisplayField = null;

                model.attributes.IsSelected = isFirstItem;
                if (isFirstItem) self.FirstModel = model;
                isFirstItem = false;
                _render(model);
                if (isColored) isColored = false; else isColored = true;
            }

            if (this.Sorted) this._copiedCollection.sort(this.DisplayField).each(_each);
            else this._copiedCollection.each(_each);
                        
            this.RefreshiScroll();
            this.trigger('loaded');

        }

    });
    return GenericListView;
});



