define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/base","model/lookupcriteria","collection/base","view/16.0.0/products/controls/generic-list","view/16.0.0/products/products/products-detail","text!template/16.0.0/products/products/products-form.tpl.html","text!template/16.0.0/products/controls/generic-layout.tpl.html"],function(e,t,i,o,s,c,n,r,d,h,a,l,u,w,p){var m,f={SearchInput:"#txt-search",ProductForm:"#products-form"},g=o.View.extend({_productsFormTemplate:i.template(w),_genericLayoutTemplate:i.template(p),events:{},initialize:function(){m=this,this.UnloadConfirmationMessage=null,this.IsNew=!1},render:function(){return this.$el.html(this._productsFormTemplate),this.$(f.ProductForm).html(this._genericLayoutTemplate),this},Show:function(){this.LoadItems(),this.render()},InitializeChildViews:function(){},InitializeProductLookUp:function(){this._productLookUp||(this._productLookUp=new h,this._productLookUp.on("sync",this.ProductLookUpLoadSuccess,this),this._productLookUp.on("error",this.ProductLookUpLoadError,this))},ProductLookUpLoadSuccess:function(e,t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this._products||(this._products=new a),this._products.reset(t.Items),this.DisplayItemList(),r.Products.Overlay.Hide()},ProductLookUpLoadError:function(e,t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),console.log(e),r.Products.Overlay.Hide()},LoadItems:function(e){this.InitializeProductLookUp(),this._productLookUp.set({StringValue:e}),this._productLookUp.url=s.ServiceUrl+c.PRODUCT+n.GETITEMLIST,this._productLookUp.save(),r.Products.Overlay.Show()},DisplayItemList:function(){this.genericListView?this.genericListView.RefreshList(this._products):(this.genericListView=new l({el:"#left-panel",DisableAdd:this.options.IsReadOnly}),this.genericListView.on("search",this.SearchItem,this),this.genericListView.on("selected",this.SelectedItem,this),this.genericListView.on("add",this.AddMode,this),this.genericListView.on("loaded",this.ListLoaded,this),this.genericListView.collection=this._products,this.genericListView.SetPlaceHolder("Search Products"),this.genericListView.SetDisplayField("ItemName"),this.genericListView.SetExtDisplayField("ItemDescription"),this.genericListView.Show()),this.SelectedItem()},ListLoaded:function(){if(this.PreventItemLoad){if(this.genericListView){var e=this.productDetailView.model.get("ItemCode");this.genericListView.SelectByAttribute("ItemCode",e)}this.productDetailView.toBeSearched=this.genericListView.GetItemToSearch(),this.productDetailView.Show()}},SearchItem:function(){this.ConfirmCancelChanges("DoSearchItem")},DoSearchItem:function(){this.HasChanges(!0),this.genericListView&&this.LoadItems(this.genericListView.GetItemToSearch())},InitializeProductDetailView:function(){this.productDetailView=new u({el:"#right-panel",IsReadOnly:this.options.IsReadOnly}),this.productDetailView.on("cancel",this.CancelNew,this),this.productDetailView.on("saved",this.Saved,this),this.productDetailView.on("updated",this.Updated,this),this.productDetailView.on("deleted",this.Deleted,this)},CancelNew:function(){this.ConfirmCancelChanges("DoCancelNew")},DoCancelNew:function(){this.IsNew=!1,this.productDetailView.HasChanges(!0),this.SelectedItem()},Saved:function(){var e=this.productDetailView.ItemCode;r.Products.ShowNotification("Product '"+e+"' was successfully created!"),this.IsNew=!1,this.PreventItemLoad=!0,this.productDetailView.model=new d({ItemCode:e}),this.genericListView.ClearSearchBox(),this.genericListView.TriggerSearch()},Updated:function(){r.Products.ShowNotification("Changes successfully saved!")},Deleted:function(){var e=this.productDetailView.ItemCode;this.SearchItem(),r.Products.ShowNotification("Product '"+e+"' was successfully deleted!")},SelectedItem:function(){return this.PreventItemLoad?void(this.PreventItemLoad=!1):void this.ConfirmCancelChanges("DoSelectedItem","RefocusItem")},RefocusItem:function(){if(this.genericListView){var e=this.productDetailView.model.get("ItemCode");this.genericListView.SelectByAttribute("ItemCode",e,!0)}},DoSelectedItem:function(){if(this.HasChanges(!0),this.genericListView){if(this.productDetailView||this.InitializeProductDetailView(),this.genericListView.GetSelectedModel()||this.genericListView.GetFirstModel()){this.productDetailView.model=new d;var e=this.genericListView.GetSelectedModel()||this.genericListView.GetFirstModel();this.productDetailView.model.set(e.attributes)}else this._products&&(this._products.models.length>0?(this.productDetailView.model=new d,this.productDetailView.model.set(this._products.at(0))):this.productDetailView.model=null);this.productDetailView.toBeSearched=this.genericListView.GetItemToSearch(),this.productDetailView.Show()}},AddMode:function(){this.IsNew||this.ConfirmCancelChanges("DoAddMode")},DoAddMode:function(){this.productDetailView&&(this.productDetailView.model=new d,this.productDetailView.Show(),this.productDetailView.AddMode(),this.IsNew=!0)},HasChanges:function(e){if(e)return this.IsNew=!1,void(this.productDetailView&&this.productDetailView.HasChanges(!0));if(this.IsNew)return this.UnloadConfirmationMessage="Do you want to cancel this new record?",!0;if(this.productDetailView&&this.productDetailView.HasChanges()){var t=this.productDetailView.model.get("ItemCode");return this.UnloadConfirmationMessage="Do you want to cancel changes made in item '"+t+"'?",!0}},ConfirmCancelChanges:function(e,t){this.DoOnCancel=t,this.DoOnConfirm=e,this.HasChanges()?navigator.notification.confirm(this.UnloadConfirmationMessage,V,"Confirmation",["Yes","No"]):this.ConfirmExecute()},ConfirmExecute:function(){this.DoOnConfirm&&this[this.DoOnConfirm]()},CancelExecute:function(){this.DoOnCancel&&this[this.DoOnCancel]()}}),V=function(e){1==e?m.ConfirmExecute():m.CancelExecute()};return g});