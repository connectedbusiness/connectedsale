define(["backbone","shared/global","shared/service","shared/method","shared/shared","model/lookupcriteria","model/base","collection/base","view/15.1.0/products/receivestocks/detail/addreceivestock","view/15.1.0/products/receivestocks/details","view/15.1.0/products/receivestocks/controls/generic-list","text!template/15.1.0/products/receivestocks/stocks.tpl.html","text!template/15.1.0/products/controls/generic-layout.tpl.html"],function(e,t,i,s,o,n,c,a,r,d,h,l,w){var k="",m=function(e){1===e&&k.LoadSearchItem()},u=function(e){1===e&&k.LoadSelectedItem()},L={SearchInput:"#txt-search",StocksForm:"#receivestocks-form"},p=e.View.extend({_stocksFormTemplate:_.template(l),_genericLayoutTemplate:_.template(w),btnSearch:function(e){this.LoadItems($(L.SearchInput).val())},initialize:function(){},render:function(){this.$el.html(this._stocksFormTemplate),this.$(L.StocksForm).html(this._genericLayoutTemplate),k=this},AddStock:function(){t.FormHasChanges===!1&&(this.addStockView&&(this.addStockView.remove(),this.addStockView.unbind(),this.addStockView=null),$("#right-panel").html(""),$("#right-panel").append("<div id='stockContainer'></div>"),this.addStockView=new r({el:$("#stockContainer"),type:this.adjustmentType,view:this}),this.addStockView.InitializeChildViews(),t.FormHasChanges=!0,this.isNew=!0)},DisplayItemList:function(){this.genericListView?this.genericListView.RefreshList(this.stocks):(this.genericListView=new h({el:"#left-panel",DisableAdd:this.options.IsReadOnly}),this.genericListView.on("search",this.SearchItem,this),this.genericListView.on("selected",this.SelectedItem,this),this.genericListView.on("add",this.AddStock,this),this.genericListView.on("loaded",this.GetFirstItem,this),this.genericListView.collection=this.stocks,this.genericListView.SetPlaceHolder("Search Adjustment Code"),this.genericListView.SetDisplayField("AdjustmentCode"),this.genericListView.Sorted=!1,this.genericListView.Show())},GetFirstItem:function(){o.IsNullOrWhiteSpace(this.isNewLyAdded)&&1!=this.isNewLyAdded?this.LoadDetailsView(this.genericListView.GetFirstModel()):this.SelectNewlyAddedItem()},HasChanges:function(){if(t.FormHasChanges)return this.UnloadConfirmationMessage="Do you want to cancel Creating new Stock Adjustment?",!0},InitializeFirstModel:function(){var e=1,o=this;this.stocksLookUp.url=t.ServiceUrl+i.PRODUCT+s.INVENTORYADJUSTMENTLOOKUP+e,this.stocksLookUp.save(null,{success:function(e,i){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),o.GetFirstItem(i)}})},InitializeStocksLookUp:function(){this.stocksLookUp||(this.stocksLookUp=new n,this.stocksLookUp.on("sync",this.StocksLookUpLoadSuccess,this),this.stocksLookUp.on("error",this.StocksLookUpLoadError,this))},LoadDetailsView:function(e){this.stockDetailView&&(this.stockDetailView.remove(),this.stockDetailView.unbind(),this.stockDetailView=null),$("#right-panel").html(""),$("#right-panel").append("<div id='stockInventoryContainer'></div>"),this.stockDetailView=new d({el:$("#stockInventoryContainer"),model:e?e:this.genericListView.GetFirstModel()}),this.stockDetailView.toBeSearched=this.genericListView.GetItemToSearch(),this.stockDetailView.render()},LoadItems:function(e,n){o.IsNullOrWhiteSpace(n)||(this.isNewLyAdded=!0,this.newModel=n),this.InitializeStocksLookUp();var c=100;this.stocksLookUp.set({StringValue:e,AdjustmentType:this.adjustmentType}),this.stocksLookUp.url=t.ServiceUrl+i.PRODUCT+s.INVENTORYADJUSTMENTLOOKUP+c,this.stocksLookUp.save()},LoadSearchItem:function(){this.LoadItems(this.genericListView.GetItemToSearch()),t.FormHasChanges=!1},LoadSelectedItem:function(e){e?this.stocksModel=new n(e):this.stocksModel=this.genericListView.GetSelectedModel(),this.LoadDetailsView(this.stocksModel)},SearchItem:function(){this.genericListView&&(1==t.FormHasChanges?navigator.notification.confirm("Do you want to cancel changes?",m,"Confirmation",["Yes","No"]):this.LoadSearchItem())},SelectedItem:function(){this.genericListView&&(1==t.FormHasChanges?navigator.notification.confirm("Do you want to cancel changes?",u,"Confirmation",["Yes","No"]):this.LoadSelectedItem())},SelectNewlyAddedItem:function(){var e=new c;e.set(this.newModel),this.genericListView.SelectByAttribute("AdjustmentCode",e.get("AdjustmentCode")),this.LoadSelectedItem(e),this.newModel=null,this.isNewLyAdded=!1},Show:function(e){this.adjustmentType=e,this.LoadItems(),this.render()},StocksLookUpLoadError:function(e,i,s){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()},StocksLookUpLoadSuccess:function(e,i,s){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.stocks=new a,this.stocks.reset(i.InventoryAdjustments),this.DisplayItemList()}});return p});