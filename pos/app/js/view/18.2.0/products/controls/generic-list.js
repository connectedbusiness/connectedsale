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
    'shared/shared',
	'backbone',
    'shared/global',
    'model/base',
    'collection/base',
    'view/18.2.0/products/receivestocks/controls/generic-item',
	'text!template/18.2.0/products/controls/generic-list-cid.tpl.html',
    'js/libs/iscroll.js'
], function ($, $$, _, Shared, Backbone, Global,
             BaseModel,
             BaseCollection,
             GenericItemView,
             GenericListTemplate) {


    var GenericListView = Backbone.View.extend({

        _genericListTemplate: _.template(GenericListTemplate),

        events: {/*
            "tap #btn-search": "btnSearch_click",
            "keyup #txt-search": "txtSearch_keyup",
            "blur #txt-search": "txtSearch_Blur",
            "focus #txt-search": "txtSearch_Focus",
            "tap #btn-add": "btnAdd_click",
            "tap #btn-clear": "btnClear_Click"
        */
        },

        btnAdd_click: function (e) { e.preventDefault(); this.trigger("add"); },
        btnSearch_click: function (e) { e.preventDefault(); this.TriggerSearch(); },
        btnClear_Click: function (e) { if (e) e.preventDefault(); $(this.ClassID.SearchInput).val(''); $(this.ClassID.SearchInput).focus(); },
        txtSearch_Focus: function () { $(this.ClassID.ClearButton).fadeIn(); },
        txtSearch_Blur: function () { $(this.ClassID.ClearButton).fadeOut(); },
        txtSearch_keyup: function (e) { if (e.keyCode === 13) { this.TriggerSearch(); } },

        initialize: function () {
            this.Sorted = true;
            this.DisplayField = "ItemDescription"; //Default
            this.ExtDisplayField = null;
            this.PlaceHolder = "Search";
            this.SelectedModel = null;
            this.FirstModel = null;
            this.$el.show();
            this.BindEvents();
        },

        BindEvents: function () {
            var self = this;
            var cid = '-' + this.cid;
            this.$el.addClass(this.cid);
            this.ClassID = {
                SearchInput: "#txt-search" + cid,
                SearchButton: "#btn-search" + cid,
                ClearButton: "#btn-clear" + cid,
                AddButton: "#btn-add" + cid,
                List: "#list" + cid,
                ListWrapper: "#list-wrapper" + cid,
                CID: "." + this.cid
            }

            $(this.ClassID.CID).on("keyup", self.ClassID.SearchInput, function (e) { self.txtSearch_keyup(e); });
            $(this.ClassID.CID).on("focus", self.ClassID.SearchInput, function (e) { self.txtSearch_Focus(e); });
            $(this.ClassID.CID).on("blur", self.ClassID.SearchInput, function (e) { self.txtSearch_Blur(e); });
            $(this.ClassID.CID).on("tap", self.ClassID.AddButton, function (e) { self.btnAdd_click(e); });
            $(this.ClassID.CID).on("tap", self.ClassID.SearchButton, function (e) { self.btnSearch_click(e); });
            $(this.ClassID.CID).on("tap", self.ClassID.ClearButton, function (e) { self.btnClear_Click(e); });
        },

        render: function () {
            this.$el.html(this._genericListTemplate({ PlaceHolder: this.PlaceHolder, cid: this.cid }));
            if (this.IsPopUp) $("#list-header-" + this.cid).addClass('list-header-popup');

            if (this.options.DisableAdd) $(this.ClassID.AddButton).addClass('ui-disabled');
            else $(this.ClassID.AddButton).removeClass('ui-disabled');

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
        SetPlaceHolder: function (val) {
            this.PlaceHolder = val;
            $(this.ClassID.SearchInput).attr('placeholder', val);
        },
        GetItemToSearch: function () { return $(this.ClassID.SearchInput).val(); },
        ClearSearchBox: function () { $(this.ClassID.SearchInput).val(''); },
        GetSelectedModel: function () { return this.SelectedModel; },
        GetFirstModel: function () { return this.FirstModel; },

        TriggerSearch: function (_val) {
            if (_val) $(this.ClassID.SearchInput).val(_val);
            this.trigger("search");
        },

        TriggerItemSelect: function (model) {
            this.SelectedModel = model;
            this.HighlightItem(model);
            this.trigger("selected");
        },

        HighlightItem: function (model) {
            if (this.IsPopUp) return;
            var viewID = model.get("ViewID");
            $(".list .item").removeClass("selectedItem");
            $("#" + viewID).addClass("selectedItem");
        },

        SelectByAttribute: function (attr, val, preventScroll, setAsSelectedModel) {
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
            if (setAsSelectedModel) this.SelectedModel = modelMatch;
            return modelMatch;
        },

        RefreshiScroll: function () {
            if (Global.isBrowserMode) return;
            if (this.myScroll) {
                this.myScroll.refresh();
                if ($(this.ClassID.List).height() < $(this.ClassID.ListWrapper).height()) this.myScroll.scrollToElement('li:first-child', 100);
            }
            else {
                this.myScroll = new iScroll("list-" + this.cid, { vScrollbar: true, vScroll: true, snap: true, momentum: true });
            }
        },

        RefreshList: function (collection) {
            if (collection) this.collection = collection;
            this.DisplayItemList();
        },

        DisplayItemList: function () {
            var self = this;

            this.SelectedModel = null;
            this.FirstModel = null;

            if (!this.collection) return;
            $(this.ClassID.ListWrapper).html("<ul></ul>");

            var oldLetter = "", newLetter = "", isColored = false, self = this;
            var _createNewModel = function () { return new BaseModel(); };
            var _render = function (model) {
                var _view = new GenericItemView();
                _view.model = model;
                $(self.ClassID.ListWrapper + " ul").append(_view.render().$el.html());
                if (!model.attributes.IsHeader) $("#" + _view.cid).on("tap", function () { self.TriggerItemSelect(model); });
            }

            this._copiedCollection = new BaseCollection();
            this._copiedCollection.reset(this.collection.models);

            //Sorting Method
            this._copiedCollection.sortedField = this.DisplayField;
            this._copiedCollection.comparator = function (collection) {
                var self = this;
                return (collection.get(self.sortedField).toUpperCase());
            };
            var isFirstItem = true;

            var _each = function (model) {

                var DisplayAttributes = { IsHeader: false, IsItem: false, IsColored: false, DisplayText: "" };

                newLetter = model.get(self.DisplayField).substr(0, 1).toUpperCase();
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

                if (self.IsPopUp) model.attributes.IsSelected = false;
                else model.attributes.IsSelected = isFirstItem;
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



