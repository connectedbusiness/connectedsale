define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/lookupcriteria","model/base","collection/base","text!template/18.2.0/products/category/detail/general.tpl.html"],function(e,t,o,i,a,r,n,s,c,d,l,g){var C,y=function(e){1===e?C.RemoveCategoryAccepted():C.CancelAction()},h=i.View.extend({_template:o.template(g),events:{"tap #categorySaveBtn":"SaveCategory","tap #categoryRemoveBtn":"RemoveCategory"},initialize:function(){this.render()},render:function(){this.$el.html(this._template),this.InitializeGeneralView(),a.FormHasChanges=!1,a.IsSaveChanges=!1,e("categoryStatus-div").trigger("create"),C=this,this.CheckReadOnlyMode()},CheckReadOnlyMode:function(){this.options.IsReadOnly&&(e("#categorySaveBtn").addClass("ui-disabled"),e("#categoryRemoveBtn").addClass("ui-disabled"),e("#description").addClass("ui-readonly"),e("#categoryCode").addClass("ui-readonly"),e("#cmbParentCategory").addClass("ui-readonly"))},InitializeChildViews:function(){},BindToForm:function(e){this.mainCategoryView=e},InitializeGeneralView:function(){this.InitializeParentCategories(),this.DisplayDetails()},DisplayDetails:function(){this.model&&(e("#description").val(this.model.get("Description")),e("#categoryCode").val(this.model.get("CategoryCode")),e("#cmbParentCategory").val(this.model.get("ParentCategory")))},CancelAction:function(){a.IsSaveChanges=!1},InitializeParentCategories:function(){var e=1e3,t=this;this.parentCategoryModel=new c,this.parentCategoryModel.url=a.ServiceUrl+r.PRODUCT+n.GETCATEGORYDETAILS+e,this.parentCategoryModel.save(null,{success:function(e,o){a.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.LoadParentCategories(o.SystemCategories)},error:function(){s.Products.RequestTimeOut()}})},LoadParentCategories:function(t){this.categoryParentCollection||(this.categoryParentCollection=new l),e('#cmbParentCategory > option[val !=""]').remove(),this.categoryParentCollection.reset(t),this.categoryParentCollection.comparator=function(e){return e.get("CategoryCode")},this.categoryParentCollection.add({CategoryCode:"DEFAULT"}),this.categoryParentCollection.sort({silent:!0}),this.categoryParentCollection.each(function(t){var o=t.get("CategoryCode");e("#cmbParentCategory").append(new Option(o,o))}),e("#cmbParentCategory").val(this.model.get("ParentCategory")),this.DisplayDetails()},SaveCategory:function(e){e.preventDefault(),e.stopImmediatePropagation(),this.ValidateFields()},RemoveCategory:function(e){e.preventDefault(),e.stopImmediatePropagation(),this.ConfirmationMessage()},ConfirmationMessage:function(){a.IsSaveChanges&&0!=a.IsSaveChanges||(a.IsSaveChanges=!0,navigator.notification.confirm("Are you sure want to remove this Category?",y,"Confirmation",["Yes","No"]))},ValidateRemoveCategory:function(){this.categoryLookUp=new c;var e=100,t=this;this.categoryLookUp.set({SortOrderCriteria:"ParentCategory"}),this.categoryLookUp.url=a.ServiceUrl+r.PRODUCT+n.GETCATEGORYDETAILS+e,this.categoryLookUp.save(null,{success:function(e,o){a.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.CheckIfParent(o.SystemCategories)},error:function(){s.Products.RequestTimeOut()}})},CheckIfParent:function(t){var o=!1,i=this;if(this.categoryCode=e("#categoryCode").val(),this.parentCategoryCollection=new l,this.parentCategoryCollection.reset(t),this.parentCategoryCollection.each(function(e){e.get("ParentCategory")==i.categoryCode&&(o=!(i.categoryCode=e.get("CategoryCode")))}),o===!0){var r="This category cannot be deleted because there are item(s) associated with this record. Please remove this association then retry.";navigator.notification.confirm(r,null,"Failed to Remove Category","Ok"),a.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()}else this.RemoveCategoryAccepted()},RemoveCategoryAccepted:function(){this.categoryModel=new d,this.categoryCode=e("#categoryCode").val(),this.parentCategory=e("#cmbParentCategory").val(),this.categoryModel.set({CategoryCode:this.categoryCode,ParentCategory:this.parentCategory,IsActive:!0,Description:this.description});var t=this;this.categoryModel.url=a.ServiceUrl+r.PRODUCT+n.DELETESYSTEMCATEGORY,this.categoryModel.save(null,{success:function(e,o){a.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.RemoveCategoryCompleted(o)},error:function(e,o,i){a.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.RemoveCategoryCompleted(o),s.Products.RequestTimeOut()}})},RemoveCategoryCompleted:function(e){if(a.IsSaveChanges=!1,e){var t=e.ErrorMessage;navigator.notification.alert(t,null,"Failed to Remove Category","OK"),a.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()}else s.Products.ShowNotification("Category successfully deleted."),this.mainCategoryView.LoadItems()},RemoveCategoryFailed:function(e){},IsNullOrWhiteSpace:function(e){return!e||(""===e||null===e||void 0===e)},ValidateFields:function(){return this.categoryCode=e("#categoryCode").val(),this.parentCategory=e("#cmbParentCategory").val(),this.description=e("#description").val(),this.IsNullOrWhiteSpace(this.categoryCode)?void s.Products.ShowNotification("Category Code is Required.",!0):this.IsNullOrWhiteSpace(this.parentCategory)?void s.Products.ShowNotification("Parent Category is Required.",!0):this.IsNullOrWhiteSpace(this.description)?void s.Products.ShowNotification("Description is Required.",!0):void this.CreateSystemCategory()},CreateSystemCategory:function(){this.categoryModel=new d,this.categoryModel.set({CategoryCode:this.categoryCode,ParentCategory:this.parentCategory,IsActive:!0,Description:this.description});var e=this;this.categoryModel.url=a.ServiceUrl+r.PRODUCT+n.UPDATESYSTEMCATEGORY,this.categoryModel.save(null,{success:function(t,o){a.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.CategorySavedCompleted(o)},error:function(e,t,o){a.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error"),s.Products.RequestTimeOut()}})},CategorySavedCompleted:function(e){null==e.ErrorMessage?(s.Products.ShowNotification("Category Successfully Saved."),a.IsSaveChanges=!1,this.mainCategoryView.LoadItems("",e)):(navigator.notification.alert(e.ErrorMessage,null,"Saving Faiiled","OK"),a.IsSaveChanges=!1)}});return h});