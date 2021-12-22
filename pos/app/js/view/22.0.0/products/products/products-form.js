
/**
 * PRODUCT - MAINTENANCE
 * @author MJFIGUEROA | 02-27-2013
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
    'model/lookupcriteria',
    'collection/base',
    'view/22.0.0/products/controls/generic-list',
    'view/22.0.0/products/products/products-detail',
	'text!template/22.0.0/products/products/products-form.tpl.html',
    'text!template/22.0.0/products/controls/generic-layout.tpl.html'
], function ($, $$, _, Backbone, Global, Service, Method, Shared,
             BaseModel, LookUpCriteriaModel,
             BaseCollection,
             GenericListView, ProductsDetailView,
             ProductsFormTemplate, GenericLayOutTemplate) {

    var ClassID = {
        SearchInput: "#txt-search",
        ProductForm: "#products-form"
    }
    var currentInstance;
    var ProductsMainView = Backbone.View.extend({

        _productsFormTemplate: _.template(ProductsFormTemplate),
        _genericLayoutTemplate: _.template(GenericLayOutTemplate),

        events: {
        },

        initialize: function () {
            currentInstance = this;
            this.UnloadConfirmationMessage = null;
            this.IsNew = false;
        },

        render: function () {
            this.$el.html(this._productsFormTemplate);
            this.$(ClassID.ProductForm).html(this._genericLayoutTemplate);
            return this;
        },

        Show: function () {
            this.LoadItems();
            this.render();
        },

        InitializeChildViews: function () {
        },

        InitializeProductLookUp: function () {
            if (!this._productLookUp) {
                this._productLookUp = new LookUpCriteriaModel();
                this._productLookUp.on('sync', this.ProductLookUpLoadSuccess, this);
                this._productLookUp.on('error', this.ProductLookUpLoadError, this);
            }
        },

        ProductLookUpLoadSuccess: function (model, response, options) {
            if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            if (!this._products) this._products = new BaseCollection();
            this._products.reset(response.Items);
            this.DisplayItemList();
            Shared.Products.Overlay.Hide();
        },

        ProductLookUpLoadError: function (model, error, options) {
            if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            console.log(model);
            Shared.Products.Overlay.Hide();
        },

        LoadItems: function (_itemCode) {
            this.InitializeProductLookUp();

            this._productLookUp.set({ 
                StringValue: _itemCode, 
            });

            this._productLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETITEMLIST;
            this._productLookUp.save();
            Shared.Products.Overlay.Show();
        },

        DisplayItemList: function () {
            if (!this.genericListView) {
                this.genericListView = new GenericListView({ el: "#left-panel", DisableAdd : this.options.IsReadOnly });
                this.genericListView.on("search", this.SearchItem, this);
                this.genericListView.on("selected", this.SelectedItem, this);
                this.genericListView.on("add", this.AddMode, this);
                this.genericListView.on("loaded", this.ListLoaded, this);
                this.genericListView.collection = this._products;
                this.genericListView.SetPlaceHolder("Search Products");
                this.genericListView.SetDisplayField("ItemName");
                this.genericListView.SetExtDisplayField("ItemDescription");
                this.genericListView.Show();
            } else {
                this.genericListView.RefreshList(this._products);
            }
            this.SelectedItem();
        },

        ListLoaded: function(){
            if(this.PreventItemLoad){                                   
                if(this.genericListView){
                    var itemCode = this.productDetailView.model.get("ItemCode");
                    this.genericListView.SelectByAttribute("ItemCode",itemCode);
                }
                this.productDetailView.toBeSearched = this.genericListView.GetItemToSearch();
                this.productDetailView.Show();                 
            }
        },

        SearchItem: function () { 
            this.ConfirmCancelChanges("DoSearchItem");
        },

        DoSearchItem : function(){
            this.HasChanges(true); 
            if (this.genericListView) this.LoadItems(this.genericListView.GetItemToSearch());
        },

        InitializeProductDetailView: function () {
            this.productDetailView = new ProductsDetailView({ el: "#right-panel", IsReadOnly : this.options.IsReadOnly });
            this.productDetailView.on('cancel', this.CancelNew, this);
            this.productDetailView.on('saved', this.Saved, this);
            this.productDetailView.on('updated', this.Updated, this);
            this.productDetailView.on('deleted', this.Deleted, this);
        },

        CancelNew: function () {
            this.ConfirmCancelChanges("DoCancelNew");     
        },

        DoCancelNew: function(){
            this.IsNew = false;
            this.productDetailView.HasChanges(true);
            this.SelectedItem();        
        },

        Saved: function () {
            var itemCode = this.productDetailView.ItemCode;
            Shared.Products.ShowNotification("Product '" + itemCode + "' was successfully created!");
            this.IsNew = false;
            this.PreventItemLoad = true;
            this.productDetailView.model = new BaseModel({ ItemCode : itemCode });
            this.genericListView.ClearSearchBox();
            this.genericListView.TriggerSearch();            
        },

        Updated: function () {
            Shared.Products.ShowNotification("Changes successfully saved!");
        },

        Deleted: function () {
            var itemCode = this.productDetailView.ItemCode;
            this.SearchItem();
            Shared.Products.ShowNotification("Product '" + itemCode + "' was successfully deleted!");
        },

        SelectedItem : function(){ 
            if(this.PreventItemLoad) {
                this.PreventItemLoad = false;             
                return;
            }            
            this.ConfirmCancelChanges("DoSelectedItem", "RefocusItem");                
        },

        RefocusItem: function(){                                 
            if(this.genericListView){
                var itemCode = this.productDetailView.model.get("ItemCode");
                this.genericListView.SelectByAttribute("ItemCode",itemCode,true);
            } 
        },

        DoSelectedItem: function () {                 
            this.HasChanges(true); 
            if (this.genericListView) {
                if (!this.productDetailView) this.InitializeProductDetailView();
                if (this.genericListView.GetSelectedModel() || this.genericListView.GetFirstModel()) {
                    this.productDetailView.model = new BaseModel();
                    var tmpModel = this.genericListView.GetSelectedModel() || this.genericListView.GetFirstModel();
                    this.productDetailView.model.set(tmpModel.attributes);
                } else {
                    if (this._products) if (this._products.models.length > 0) {
                        this.productDetailView.model = new BaseModel();
                        this.productDetailView.model.set(this._products.at(0));
                    }
                    else this.productDetailView.model = null;
                }
                this.productDetailView.toBeSearched = this.genericListView.GetItemToSearch();

                this.productDetailView.Show();
            }
        },

        AddMode : function(){
            if(this.IsNew) return;            
            this.ConfirmCancelChanges("DoAddMode");          
        },

        DoAddMode: function () {
            if (this.productDetailView) {
                this.productDetailView.model = new BaseModel();                
                this.productDetailView.Show();
                this.productDetailView.AddMode();
                this.IsNew = true;                
            }
        },

        HasChanges: function (_clear) {
            if(_clear){
                this.IsNew = false; 
                if(this.productDetailView) this.productDetailView.HasChanges(true);
                return;
            }

            if (this.IsNew) {
                this.UnloadConfirmationMessage = "Do you want to cancel this new record?";
                return true;
            }
            if(this.productDetailView) if(this.productDetailView.HasChanges()){
                var itemCode = this.productDetailView.model.get("ItemCode");
                this.UnloadConfirmationMessage = "Do you want to cancel changes made in item '" + itemCode + "'?";
                return true;
            }
        },

        ConfirmCancelChanges: function(onYes, onNo){            
            this.DoOnCancel = onNo;
            this.DoOnConfirm = onYes;
            if(this.HasChanges()){
                navigator.notification.confirm(this.UnloadConfirmationMessage, cancelChanges, "Confirmation", ['Yes','No']);                            
            } else {
                this.ConfirmExecute();
            }
        },

        ConfirmExecute : function(){
            if(!this.DoOnConfirm) return;
            this[this.DoOnConfirm]();  
        },

        CancelExecute: function(){
            if(!this.DoOnCancel) return;
            this[this.DoOnCancel]();     
        }

    });

    var cancelChanges = function(button){
        if(button == 1){
            currentInstance.ConfirmExecute();
        } else {
            currentInstance.CancelExecute();
        }
    }

    return ProductsMainView;
});



