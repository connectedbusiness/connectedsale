define(["jquery","mobile","underscore","backbone","shared/global","shared/method","shared/service","shared/shared","model/base","model/lookupcriteria","collection/base","collection/countries","view/18.1.0/products/controls/generic-list","view/18.1.0/products/location/locationDetail","text!template/18.1.0/products/location/locationform.tpl.html","text!template/18.1.0/products/controls/generic-layout.tpl.html"],function(t,e,i,o,n,s,c,a,l,h,r,u,d,w,L,f){var m,C={SearchInput:"#txt-search",LocationForm:"#location-form"},p=o.View.extend({_locationTemplate:i.template(L),_genericLayoutTemplate:i.template(f),initialize:function(){this.UnloadConfirmationMessage=null,this.IsNew=!1,m=this},render:function(){this.$el.html(this._locationTemplate),this.$(C.LocationForm).html(this._genericLayoutTemplate)},Show:function(){this.LoadCountry()},HasChanges:function(){if(this.IsNew)return this.UnloadConfirmationMessage="Do you want to cancel this new record?",!0},InitializeLocationLookup:function(){this.locationLookup||(this.locationLookup=new h,this.locationLookup.on("sync",this.LookupSuccess,this),this.locationLookup.on("error",this.LookupError,this))},LookupSuccess:function(t,e,o){this.locationActive||(this.locationActive=new r),this.locationList||(this.locationList=new r);var n=i.reject(e.Warehouses,function(t){return 0==t.IsActive});this.locationActive.reset(n),this.locationList.reset(e.Warehouses),this.DisplayLocation(),a.Products.Overlay.Hide()},LookupError:function(t,e,i){a.Products.RequestTimeOut()},LoadLocation:function(t){this.recentModel=null,this.InitializeLocationLookup(),this.locationLookup.set({StringValue:t}),this.locationLookup.url=n.ServiceUrl+c.PRODUCT+s.GETLOCATIONLOOKUP+"100",this.locationLookup.save(),a.Products.Overlay.Show()},DisplayLocation:function(){this.genericListView?this.genericListView.RefreshList(this.locationActive):(this.genericListView=new d({el:"#left-panel",DisableAdd:this.options.IsReadOnly}),this.genericListView.on("search",this.SearchItem,this),this.genericListView.on("selected",this.SelectedItem,this),this.genericListView.on("add",this.AddMode,this),this.genericListView.collection=this.locationActive,this.genericListView.SetPlaceHolder("Search Location"),this.genericListView.SetDisplayField("WarehouseCode"),this.genericListView.Show()),this.recentModel?this.SetSelectedAfterSave(this.recentModel):this.SelectedItem()},SetSelectedAfterSave:function(t){this.genericListView&&this.genericListView.TriggerItemSelect(t),a.Products.Overlay.Hide()},AddMode:function(){this.locationDetailView&&(this.genericListView&&this.genericListView.ClearSearchBox(),this.locationDetailView.ForceAdd(),this.IsNew=!0)},SelectedItem:function(){this.genericListView&&(this.locationDetailView||this.InitializeLocationDetailView(),this.genericListView.GetSelectedModel()?(this.locationDetailView.model=new l,this.locationDetailView.model.set(this.genericListView.GetSelectedModel().attributes)):this.locationActive&&(this.locationActive.models.length>0?(this.locationDetailView.model=new l,this.locationDetailView.model.set(this.locationActive.at(0))):this.locationDetailView.model=null),this.locationDetailView.IsNew=this.IsNew,this.locationDetailView.toBeSearched=this.genericListView.GetItemToSearch(),this.locationDetailView.Show())},SearchItem:function(){this.genericListView&&this.LoadLocation(this.genericListView.GetItemToSearch())},InitializeLocationDetailView:function(){this.locationDetailView=new w({el:"#right-panel",collection:this.locationList,countries:this.countryCollection,IsReadOnly:this.options.IsReadOnly}),this.locationDetailView.on("cancel",this.CancelNew,this),this.locationDetailView.on("saved",this.Saved,this),this.locationDetailView.on("delete",this.Deleted,this),this.locationDetailView.on("updated",this.Saved,this),this.locationDetailView.on("failed",this.LoadPreviousModel,this)},LoadCountry:function(){this.countryCollection||(this.countryCollection=new u);var t=this,e=new h;e.url=n.ServiceUrl+c.CUSTOMER+s.COUNTRYCODELOOKUP+300,e.save(null,{success:function(e,i,o){i&&t.countryCollection.reset(i.Countries),t.LoadLocation(),t.render()},error:function(){a.Products.RequestTimeOut()}})},CancelNew:function(){this.ConfirmCancelChanges("DoCancelNew")},DoCancelNew:function(){this.recentModel=this.locationActive.at(0),this.IsNew=!1,this.LoadLocation()},Saved:function(t){this.LoadLocation(),this.recentModel=t,this.IsNew=!1,this.locationDetailView.ResetTemplates()},Deleted:function(t){if(t){var e=this.locationActive.find(function(e){return e.get("WarehouseCode").toUpperCase()===t.get("WarehouseCode").toUpperCase()});e&&this.locationActive.remove(e)}this.recentModel=this.locationActive.at(0),this.LoadLocation(),this.IsNew=!1},LoadPreviousModel:function(t){this.LoadLocation(),this.recentModel=t,this.IsNew=!1},ConfirmCancelChanges:function(t,e){this.DoOnCancel=e,this.DoOnConfirm=t,this.HasChanges()?navigator.notification.confirm(this.UnloadConfirmationMessage,V,"Confirmation",["Yes","No"]):this.ConfirmExecute()},ConfirmExecute:function(){this.DoOnConfirm&&this[this.DoOnConfirm]()},CancelExecute:function(){this.DoOnCancel&&this[this.DoOnCancel]()}}),V=function(t){1==t?m.ConfirmExecute():m.CancelExecute()};return p});