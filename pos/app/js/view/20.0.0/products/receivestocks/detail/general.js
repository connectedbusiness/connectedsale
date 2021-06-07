
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'view/20.0.0/products/receivestocks/detail/inventoryitemlist',
	'text!template/20.0.0/products/receivestocks/detail/general.tpl.html',
	'js/libs/moment.min.js',
], function ($, $$, _, Backbone, Global, InventoryItemListView, template) {

    var categoryForm;

    var StockGeneralView = Backbone.View.extend({
        _template: _.template(template),

        initialize: function () {
            this.render();
            this.InitializeTransactionDate();
        },

        render: function () {
            this.$el.html(this._template(this.model.toJSON()));

            Global.FormHasChanges = false;
            Global.IsSaveChanges = false;
            categoryForm = this;
        },

        InitializeInventoryItemList: function () {
            var itemlistView = new InventoryItemListView({
                el: $("#inventoryItems-area"),
                model: this.model
            });
        },

        InitializeTransactionDate: function () {
            var DateFormat = 'L';
            var transactionDate = moment((this.model.get("TransactionDate"))).format(DateFormat);
            this.$("#transactionDate").val(this.JSONtoDate(transactionDate));
            this.InitializeInventoryItemList();
        },

        JSONtoDate: function (transactionDate) {
            //var DateFormat = 'dd MMMM YYYY';
            var DateFormat = (Global.isBrowserMode) ? 'YY-MM-DD' : 'YYYY-MM-DD';
            var tDate = moment(transactionDate).format(DateFormat);
            return tDate;
        }

    });
    return StockGeneralView;
});
