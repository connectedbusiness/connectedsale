define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/department","collection/departments","text!template/20.0.0/products/departments/detail/adddepartment.tpl.html"],function(e,t,n,i,r,a,o,s,d,p,c){var l,m=i.View.extend({_template:n.template(c),events:{"tap .saveBtn ":"saveBtn_Tap","tap .cancelBtn ":"cancelBtn_Tap","change #departmentCode":"departmentCode_Change"},initialize:function(){l=this,this.render()},render:function(){this.$el.html(this._template)},InitializeChildViews:function(){this.InitializeParentDepartments(),e("departmentStatus-div").trigger("create")},BindToForm:function(e){this.mainView=e},InitializeParentDepartments:function(){this.productLookUp=new d;var e=100,t=this;this.productLookUp.url=r.ServiceUrl+a.PRODUCT+o.GETDEPARTMENTDETAILS+e,this.productLookUp.save(null,{success:function(e,n){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.LoadParentDepartments(n.Departments)}})},LoadParentDepartments:function(t){if(e('#cmbParentDepartment > option[val !=""]').remove(),this.departmentCollection=new p,this.departmentCollection.reset(t),this.departmentCollection.sortVar="DepartmentCode",this.departmentCollection.comparator=function(e){return e.get("DepartmentCode")},this.departmentCollection.add({DepartmentCode:"DEFAULT"}),this.departmentCollection.sort({silent:!0}),this.departmentCollection.length>0){this.departmentCollection.each(function(t){var n=t.get("DepartmentCode");e("#cmbParentDepartment").append(new Option(n,n))});var n=[];e("select option").each(function(){e.inArray(this.value,n)!=-1&&e(this).remove(),n.push(this.value)})}e("#cmbParentDepartment").val("DEFAULT")},saveBtn_Tap:function(e){e.preventDefault(),e.stopImmediatePropagation(),this.ValidateFields()},cancelBtn_Tap:function(e){e.preventDefault(),e.stopImmediatePropagation(),navigator.notification.confirm("Do you want to cancel Adding new Department?",u,"Confirmation",["Yes","No"])},DoCancelNew:function(){r.FormHasChanges=!1,this.mainView.LoadItems()},ValidateFields:function(){return this.departmentCode=e("#departmentCode").val(),this.parentDepartment=e("#cmbParentDepartment").val(),this.description=e("#description").val(),this.IsNullOrWhiteSpace(e.trim(this.departmentCode))?void s.Products.ShowNotification("Department Code is Required.",!0):this.IsNullOrWhiteSpace(this.parentDepartment)?void s.Products.ShowNotification("Parent Department is Required.",!0):this.IsNullOrWhiteSpace(e.trim(this.description))?void s.Products.ShowNotification("Description is Required.",!0):(s.Products.Overlay.Show(),void this.CreateDepartment())},IsNullOrWhiteSpace:function(e){return!e||(""===e||null===e||void 0===e)},CreateDepartment:function(){this.departmentModel=new d,this.departmentModel.set({DepartmentCode:this.departmentCode,ParentDepartment:this.parentDepartment,IsActive:!0,Description:this.description});var e=this;this.departmentModel.url=r.ServiceUrl+a.PRODUCT+o.CREATESELLINGDEPARTMENT,this.departmentModel.save(null,{success:function(t,n){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.DepartmentSavedCompleted(n)},error:function(e,t,n){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error")}})},DepartmentSavedCompleted:function(e){e.ErrorMessage?(navigator.notification.alert(e.ErrorMessage,null,"Failed to Add Department","OK"),s.Products.Overlay.Hide()):(s.Products.ShowNotification("Department Succesfully Saved."),s.Products.Overlay.Hide(),r.FormHasChanges=!1,this.mainView.LoadItems("",e))},departmentCode_Change:function(e){e.preventDefault(),this.AssignDescriptionFromDepartmentCode()},AssignDescriptionFromDepartmentCode:function(){var t=e("#departmentCode").val(),n=e("#description").val();null!=t&&""!=t&&(null!=n&&""!=n||this.AssignDescription(t))},AssignDescription:function(t){e("#description").val(t)}}),u=function(e){1==e&&l.DoCancelNew()};return m});