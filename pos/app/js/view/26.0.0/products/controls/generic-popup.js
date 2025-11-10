
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
    'shared/shared',
    'view/26.0.0/products/controls/generic-list',
	'text!template/26.0.0/products/controls/generic-popup.tpl.html'
], function ($, $$, _, Backbone, Global, Shared, GenericListView, GenericPopUpTemplate) {

    var GenericPopUpView = Backbone.View.extend({

        _genericPopUpTemplate: _.template(GenericPopUpTemplate),

        initialize: function () {
            this.$el.show();
        },

        events: {
            "tap .close-popup": "Close"
        },

        render: function () {
            this.$el.html(this._genericPopUpTemplate());
            $(".generic-popup-content").html("<div></div>");
            this.genericList = new GenericListView({ el: ".generic-popup-content div" });
            this.genericList.on("search", this.SearchItem, this);
            this.genericList.on("selected", this.SelectedItem, this);
            this.genericList.collection = this.collection;
            this.genericList.IsPopUp = true;
            this.genericList.SetPlaceHolder(this.PlaceHolder);
            this.genericList.SetDisplayField(this.DisplayField);
            this.genericList.SetExtDisplayField(this.ExtDisplayField);
            if (this.Title) this.SetTitle(this.Title);
            this.genericList.Show();
            return this;
        },

        SetTitle: function (val) {
            this.Title = val;
            $(".popup-title").text(val);
        },

        SearchItem: function () {
            this.trigger('search');
        },

        SelectedItem: function () {
            this.SelectedModel = null;
            if (this.genericList) {
                this.SelectedModel = this.genericList.GetSelectedModel();
            }
            this.trigger('selected');
        },

        GetSelectedModel: function () {
            return this.SelectedModel;
        },

        SetPlaceHolder: function (val) {
            this.PlaceHolder = val;
        },

        SetDisplayField: function (val) {
            this.DisplayField = val;
        },

        SetExtDisplayField: function (val) {
            this.ExtDisplayField = val;
        },

        GetItemToSearch: function () {
            if (this.genericList) return this.genericList.GetItemToSearch();
            return "";
        },

        Show: function () {
            Shared.Products.Overlay.Show();
            this.render();
        },

        RefreshList: function (collection) {
            if (this.genericList) this.genericList.RefreshList(collection);
        },

        Close: function () {
            Shared.Products.Overlay.Hide();
            this.$el.hide();
            if (this.genericList) {
                this.genericList.unbind();
                this.genericList.remove();
            }
            this.unbind();
            this.remove();
            this.Closed = true;
        }

    });
    return GenericPopUpView;
});



