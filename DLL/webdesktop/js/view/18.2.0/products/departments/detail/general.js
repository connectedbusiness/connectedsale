define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/department","collection/departments","text!template/18.2.0/products/departments/detail/general.tpl.html"],function(e,t,n,a,i,r,o,s,d,p,m){var l,c=function(e){1===e?l.ValidateRemoveDepartment():l.CancelAction()},h=a.View.extend({_template:n.template(m),events:{"tap #departmentSaveBtn":"SaveDepartment","tap #departmentRemoveBtn":"RemoveDepartment"},initialize:function(){this.render()},render:function(){this.$el.html(this._template),this.InitializeGeneralView(),l=this,i.FormHasChanges=!1,i.IsSaveChanges=!1,e("departmentStatus-div").trigger("create"),this.CheckReadOnlyMode()},CheckReadOnlyMode:function(){this.options.IsReadOnly&&(e("#departmentSaveBtn").addClass("ui-disabled"),e("#departmentRemoveBtn").addClass("ui-disabled"),e("#description").addClass("ui-readonly"),e("#departmentCode").addClass("ui-readonly"),e("#cmbParentDepartment").addClass("ui-readonly"))},BindToForm:function(e){this.mainView=e},InitializeGeneralView:function(){this.departmentLookUp=new d;var e=100,t=this;this.departmentLookUp.set({StringValue:this.model.get("DepartmentCode")}),this.departmentLookUp.url=i.ServiceUrl+r.PRODUCT+o.GETDEPARTMENTDETAILS+e,this.departmentLookUp.save(null,{success:function(e,n){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.DisplayDepartmentDetails(n.Departments)}})},CancelAction:function(){i.IsSaveChanges=!1},DisplayDepartmentDetails:function(t){var n=this,a=new p;a.reset(t),a.length>0&&a.each(function(t){t.get("DepartmentCode")==n.model.get("DepartmentCode")&&(e("#description").val(t.get("Description")),e("#departmentCode").val(t.get("DepartmentCode")),n.parentDepartment=t.get("ParentDepartment"))}),this.InitializeParentDepartments()},InitializeParentDepartments:function(){this.departmentLookUp=new d;var e=100,t=this;this.departmentLookUp.url=i.ServiceUrl+r.PRODUCT+o.GETDEPARTMENTDETAILS+e,this.departmentLookUp.save(null,{success:function(e,n){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.LoadParentDepartments(n.Departments)}})},LoadParentDepartments:function(t){e('#cmbParentDepartment > option[val !=""]').remove(),this.departmentCollection=new p,this.departmentCollection.reset(t);var n=this;if(this.SortVar="DepartmentCode",this.departmentCollection.SortVar="DepartmentCode",this.departmentCollection.comparator=function(e){return e.get(n.SortVar)},this.departmentCollection.add({DepartmentCode:"DEFAULT"}),this.departmentCollection.sort({silent:!0}),this.departmentCollection.length>0){this.departmentCollection.sort("DepartmentCode").each(function(t){var n=t.get("DepartmentCode");e("#cmbParentDepartment").append(new Option(n,n))});var a=[];e("select option").each(function(){e.inArray(this.value,a)!=-1&&e(this).remove(),a.push(this.value)})}e("#cmbParentDepartment").val(this.parentDepartment)},SaveDepartment:function(e){e.preventDefault(),e.stopImmediatePropagation(),this.ValidateFields()},RemoveDepartment:function(e){e.preventDefault(),e.stopImmediatePropagation(),this.ConfirmationMessage()},ConfirmationMessage:function(e){i.IsSaveChanges&&0!=i.IsSaveChanges||(i.IsSaveChanges=!0,navigator.notification.confirm("Are you sure want to remove this Department?",c,"Confirmation",["Yes","No"]))},ValidateRemoveDepartment:function(){this.departmentLookUp=new d;var e=100,t=this;this.departmentLookUp.url=i.ServiceUrl+r.PRODUCT+o.GETDEPARTMENTDETAILS+e,this.departmentLookUp.save(null,{success:function(e,n){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.CheckIfParent(n.Departments)}})},CheckIfParent:function(t){var n=!1,a=this;if(this.departmentCode=e("#departmentCode").val(),this.parentDepartmentCollection=new p,this.parentDepartmentCollection.reset(t),this.parentDepartmentCollection.each(function(e){e.get("ParentDepartment")==a.departmentCode&&(n=!(a.departmentCode=e.get("DepartmentCode")))}),n===!0){var r="This department cannot be deleted because there are item(s) associated with this record. Please remove this association then retry.";navigator.notification.alert(r,null,"Failed to Remove Department","Ok"),i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()}else this.RemoveDepartmentAccepted()},RemoveDepartmentAccepted:function(){this.departmentModel=new d,this.departmentCode=e("#departmentCode").val(),this.parentDepartment=e("#cmbParentDepartment").val(),this.departmentModel.set({DepartmentCode:this.departmentCode,ParentDepartment:this.parentDepartment,IsActive:!0,Description:this.description});var t=this;this.departmentModel.url=i.ServiceUrl+r.PRODUCT+o.DELETESELLINGDEPARTMENT,this.departmentModel.save(null,{success:function(e,n){t.RemoveDepartmentCompleted(n)},error:function(e,n,a){t.RemoveDepartmentCompleted(n)}})},RemoveDepartmentCompleted:function(e){if(i.IsSaveChanges=!1,e){var t=e.ErrorMessage;navigator.notification.alert(t,null,"Unable to Remove Department","OK"),i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()}else s.Products.ShowNotification("Department successfully deleted."),this.mainView.LoadItems()},ValidateFields:function(){return this.departmentCode=e("#departmentCode").val(),this.parentDepartment=e("#cmbParentDepartment").val(),this.description=e("#description").val(),""===this.categoryCode?void s.Products.ShowNotification("Department Code is Required.",!0):""===this.parentCategory?void s.Products.ShowNotification("Parent Department is Required.",!0):void this.UpdateDepartment()},UpdateDepartment:function(){this.departmentModel=new d,this.departmentModel.set({DepartmentCode:this.departmentCode,ParentDepartment:this.parentDepartment,IsActive:!0,Description:this.description});var e=this;this.departmentModel.url=i.ServiceUrl+r.PRODUCT+o.UPDATESELLINGDEPARTMENT,this.departmentModel.save(null,{success:function(t,n){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.DepartmentSavedCompleted(n)},error:function(e,t,n){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error")}})},DepartmentSavedCompleted:function(e){null==e.ErrorMessage?(s.Products.ShowNotification("Department Succesfuly Saved."),i.IsSaveChanges=!1):(navigator.notification.alert(e.ErrorMessage,null,"Saving Faiiled","OK"),i.IsSaveChanges=!1)}});return h});