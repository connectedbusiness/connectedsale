define(["backbone","shared/global","shared/service","shared/method","model/department","collection/departments","view/15.1.0/products/departments/details","view/15.1.0/products/departments/detail/adddepartment","view/15.1.0/products/controls/generic-list","text!template/15.1.0/products/departments/departments.tpl.html","text!template/15.1.0/products/controls/generic-layout.tpl.html"],function(e,t,i,n,s,a,r,o,d,h,l){var c="",m=function(e){1===e&&c.LoadSearchItem()},p=function(e){1===e&&c.LoadSelectedItem()},w={SearchInput:"#txt-search",DepartmentsForm:"#departments-form"},u=e.View.extend({_departmentsFormTemplate:_.template(h),_genericLayoutTemplate:_.template(l),initialize:function(){},render:function(){return this.$el.html(this._departmentsFormTemplate),this.$(w.DepartmentsForm).html(this._genericLayoutTemplate),c=this,this},btnSearch:function(e){this.LoadItems($(w.SearchInput).val())},Show:function(){this.LoadItems(),this.render()},InitializeChildViews:function(){},InitializeDepartmentLookUp:function(){this.departmentLookup||(this.departmentLookup=new s,this.departmentLookup.on("sync",this.DepartmentLookUpLoadSuccess,this),this.departmentLookup.on("error",this.DepartmentLookUpLoadError,this))},DepartmentLookUpLoadSuccess:function(e,i,n){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.departments=new a,this.departments.reset(i.Departments),this.DisplayItemList()},HasChanges:function(){if(t.FormHasChanges)return this.UnloadConfirmationMessage="Do you want to cancel Adding new Depertment?",!0},AddDepartment:function(){t.FormHasChanges===!1&&(this.IsNullOrWhiteSpace(this.addnewDepartment)||this.addnewDepartment.unbind(),this.addnewDepartment=new o({el:$("#right-panel")}),this.addnewDepartment.InitializeChildViews(),this.addnewDepartment.BindToForm(this),t.FormHasChanges=!0)},DepartmentLookUpLoadError:function(e,i,n){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()},LoadItems:function(e,s){this.IsNullOrWhiteSpace(s)||(this.isNewLyAdded=!0,this.newModel=s),this.InitializeDepartmentLookUp();var a=1e3;this.departmentLookup.set({StringValue:e});this.departmentLookup.url=t.ServiceUrl+i.PRODUCT+n.GETDEPARTMENTDETAILS+a,this.departmentLookup.save()},IsNullOrWhiteSpace:function(e){return!e||(""===e||null===e||void 0===e)},GetFirstItem:function(e){var t=new s;this.IsNullOrWhiteSpace(this.isNewLyAdded)&&1!=this.isNewLyAdded?t=this.genericListView.GetFirstModel():t.set(this.newModel),this.IsNullOrWhiteSpace(this.departmentDetailView)||this.departmentDetailView.unbind(),this.departmentDetailView=new r({el:$("#right-panel"),model:this.genericListView.GetFirstModel(),IsReadOnly:this.options.IsReadOnly}),this.departmentDetailView.toBeSearched=this.genericListView.GetItemToSearch(),this.departmentDetailView.BindToForm(this),this.departmentDetailView.InitializeChildViews(),this.isNew=!1,this.IsNullOrWhiteSpace(this.isNewLyAdded)&&1!=this.isNewLyAdded||this.SelectNewlyAddedItem()},SelectNewlyAddedItem:function(){var e=new s;e.set(this.newModel),this.genericListView.SelectByAttribute("DepartmentCode",e.get("DepartmentCode")),this.LoadSelectedItem(this.newModel),this.newModel=null,this.isNewLyAdded=!1},DisplayItemList:function(){this.genericListView?this.genericListView.RefreshList(this.departments):(this.genericListView=new d({el:"#left-panel",DisableAdd:this.options.IsReadOnly}),this.genericListView.on("search",this.SearchItem,this),this.genericListView.on("selected",this.SelectedItem,this),this.genericListView.on("add",this.AddDepartment,this),this.genericListView.on("loaded",this.GetFirstItem,this),this.genericListView.collection=this.departments,this.genericListView.SetPlaceHolder("Search Department"),this.genericListView.SetDisplayField("DepartmentCode"),this.genericListView.Show())},SearchItem:function(){this.genericListView&&(1==t.FormHasChanges?navigator.notification.confirm("Do you want to cancel changes?",m,"Confirmation",["Yes","No"]):this.LoadSearchItem())},LoadSearchItem:function(){this.LoadItems(this.genericListView.GetItemToSearch()),t.FormHasChanges=!1},LoadSelectedItem:function(e){if(e){var i=new s;i.set(e),this.departmentModel=i}else this.departmentModel=this.genericListView.GetSelectedModel();this.IsNullOrWhiteSpace(this.departmentDetailView)||this.departmentDetailView.unbind(),this.departmentDetailView=new r({el:$("#right-panel"),model:this.departmentModel,IsReadOnly:this.options.IsReadOnly}),this.departmentDetailView.BindToForm(this),this.departmentDetailView.InitializeChildViews(),t.FormHasChanges=!1},SelectedItem:function(){this.genericListView&&(1==t.FormHasChanges?navigator.notification.confirm("Do you want to cancel changes?",p,"Confirmation",["Yes","No"]):this.LoadSelectedItem())}});return u});