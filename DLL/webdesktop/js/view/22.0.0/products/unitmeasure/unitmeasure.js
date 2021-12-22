define(["jquery","mobile","underscore","backbone","shared/global","shared/method","shared/service","shared/shared","model/base","model/lookupcriteria","collection/base","view/22.0.0/products/controls/generic-list","view/22.0.0/products/unitmeasure/unitmeasuredetail","text!template/22.0.0/products/unitmeasure/uomform.tpl.html","text!template/22.0.0/products/controls/generic-layout.tpl.html"],function(e,i,t,s,o,n,r,h,a,c,l,u,m,d,w){var f,L={SearchInput:"#txt-search",UOMForm:"#uom-form"},g=s.View.extend({_uomFormTemplate:t.template(d),_genericLayoutTemplate:t.template(w),initialize:function(){this.UnloadConfirmationMessage=null,this.IsNew=!1,f=this},render:function(){this.$el.html(this._uomFormTemplate),this.$(L.UOMForm).html(this._genericLayoutTemplate),console.log("IsAllowFractional : "+o.InventoryPreference.IsAllowFractional)},Show:function(){this.LoadUOM(),this.render()},InitializeUnitMeasureLookup:function(){this.unitMeasureLookup||(this.unitMeasureLookup=new c,this.unitMeasureLookup.on("sync",this.LookupSuccess,this),this.unitMeasureLookup.on("error",this.LookupError,this))},LookupSuccess:function(e,i,s){this.uomActive||(this.uomActive=new l),this.uomList||(this.uomList=new l);var o=t.reject(i.SystemUnitMeasure,function(e){return 0==e.IsActive});this.uomActive.reset(o),this.uomList.reset(i.SystemUnitMeasure),this.DisplayUOM(),h.Products.Overlay.Hide()},LookupError:function(e,i,t){console.log("ERR "+i),h.Products.Overlay.Hide()},HasChanges:function(){if(this.IsNew)return this.UnloadConfirmationMessage="Do you want to cancel this new record?",!0},LoadUOM:function(e){this.recentModel=null,this.InitializeUnitMeasureLookup(),this.unitMeasureLookup.set({StringValue:e}),this.unitMeasureLookup.url=o.ServiceUrl+r.PRODUCT+n.UNITOFMEASURELOOKUP+"100",this.unitMeasureLookup.save(),h.Products.Overlay.Show()},DisplayUOM:function(){this.genericListView?this.genericListView.RefreshList(this.uomActive):(this.genericListView=new u({el:"#left-panel",DisableAdd:this.options.IsReadOnly}),this.genericListView.on("search",this.SearchItem,this),this.genericListView.on("selected",this.SelectedItem,this),this.genericListView.on("add",this.AddMode,this),this.genericListView.collection=this.uomActive,this.genericListView.SetPlaceHolder("Search Unit of Measure"),this.genericListView.SetDisplayField("UnitMeasureCode"),this.genericListView.Show()),this.recentModel?this.SetSelectedAfterSave(this.recentModel):this.SelectedItem()},SelectedItem:function(){if(this.genericListView){if(this.uomDetailView||this.InitializeUOMDetailView(),this.genericListView.GetSelectedModel()||this.genericListView.GetFirstModel()){this.uomDetailView.model=new a;var e=this.genericListView.GetSelectedModel()||this.genericListView.GetFirstModel();this.uomDetailView.model.set(e.attributes)}else this.uomActive&&(this.uomActive.models.length>0?(this.uomDetailView.model=new a,this.uomDetailView.model.set(this.uomActive.at(0))):this.uomDetailView.model=null);this.uomDetailView.toBeSearched=this.genericListView.GetItemToSearch(),this.uomDetailView.Show()}},SearchItem:function(){this.genericListView&&this.LoadUOM(this.genericListView.GetItemToSearch())},SetSelectedAfterSave:function(e){this.genericListView&&this.genericListView.TriggerItemSelect(e),h.Products.Overlay.Hide()},InitializeUOMDetailView:function(){this.uomDetailView=new m({el:"#right-panel",collection:this.uomList,IsReadOnly:this.options.IsReadOnly}),this.uomDetailView.on("cancel",this.CancelNew,this),this.uomDetailView.on("saved",this.Saved,this),this.uomDetailView.on("updated",this.Saved,this),this.uomDetailView.on("delete",this.Deleted,this)},AddMode:function(){this.uomDetailView&&(this.genericListView&&this.genericListView.ClearSearchBox(),this.uomDetailView.ForceAdd(),this.IsNew=!0)},CancelNew:function(){this.ConfirmCancelChanges("DoCancelNew")},DoCancelNew:function(){this.uomDetailView.DoCancel(),this.recentModel=this.uomActive.at(0),this.LoadUOM(),this.IsNew=!1},Saved:function(e){this.LoadUOM(),this.recentModel=e,this.IsNew=!1},Deleted:function(e){var i=this.uomActive.find(function(i){return i.get("UnitMeasureCode").toUpperCase()===e.get("UnitMeasureCode")});i&&this.uomActive.remove(i),this.recentModel=this.uomActive.at(0),this.LoadUOM(),this.IsNew=!1},ConfirmCancelChanges:function(e,i){this.DoOnCancel=i,this.DoOnConfirm=e,this.HasChanges()?navigator.notification.confirm(this.UnloadConfirmationMessage,M,"Confirmation",["Yes","No"]):this.ConfirmExecute()},ConfirmExecute:function(){this.DoOnConfirm&&this[this.DoOnConfirm]()},CancelExecute:function(){this.DoOnCancel&&this[this.DoOnCancel]()}}),M=function(e){1==e?f.ConfirmExecute():f.CancelExecute()};return g});