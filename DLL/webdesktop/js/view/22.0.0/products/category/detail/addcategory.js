define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/lookupcriteria","model/base","collection/base","text!template/22.0.0/products/category/detail/addcategory.tpl.html"],function(e,t,o,i,r,a,n,s,c,l,d,g){var u,C=i.View.extend({_template:o.template(g),events:{"tap .saveBtn ":"saveBtn_Tap","tap .cancelBtn ":"cancelBtn_Tap","change #categoryCode":"categoryCode_Change"},initialize:function(){u=this,this.render()},render:function(){this.$el.html(this._template)},InitializeChildViews:function(){this.InitializeParentCategories(),e("categoryStatus-div").trigger("create")},BindToForm:function(e){this.mainCategoryView=e},InitializeParentCategories:function(){this.categoryLookUp=new c;var e=100,t=this;this.categoryLookUp.url=r.ServiceUrl+a.PRODUCT+n.GETCATEGORYDETAILS+e,this.categoryLookUp.save(null,{success:function(e,o){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.LoadParentCategories(o.SystemCategories)},error:function(){s.Products.RequestTimeOut()}})},LoadParentCategories:function(t){if(e('#cmbParentCategory > option[val !=""]').remove(),this.categoryCollection=new d,this.categoryCollection.reset(t),this.categoryCollection.comparator=function(e){return e.get("CategoryCode")},this.categoryCollection.add({CategoryCode:"DEFAULT"}),this.categoryCollection.sort({silent:!0}),this.categoryCollection.length>0){this.categoryCollection.each(function(t){var o=t.get("CategoryCode");e("#cmbParentCategory").append(new Option(o,o))});var o=[];e("select option").each(function(){e.inArray(this.value,o)!=-1&&e(this).remove(),o.push(this.value)})}e("#cmbParentCategory").val("DEFAULT")},saveBtn_Tap:function(e){e.preventDefault(),e.stopImmediatePropagation(),this.ValidateFields()},cancelBtn_Tap:function(e){e.preventDefault(),e.stopImmediatePropagation(),navigator.notification.confirm("Do you want to cancel Adding new Category?",h,"Confirmation",["Yes","No"])},DoCancelNew:function(){r.FormHasChanges=!1,this.mainCategoryView.LoadItems()},IsNullOrWhiteSpace:function(e){return!e||(""===e||null===e||void 0===e)},ValidateFields:function(){return this.categoryCode=e("#categoryCode").val(),this.parentCategory=e("#cmbParentCategory").val(),this.description=e("#description").val(),s.IsNullOrWhiteSpace(this.categoryCode)?void s.Products.ShowNotification("Category Code is Required.",!0):s.IsNullOrWhiteSpace(this.parentCategory)?void s.Products.ShowNotification("Parent Category is Required.",!0):s.IsNullOrWhiteSpace(this.description)?void s.Products.ShowNotification("Description is Required.",!0):(s.Products.Overlay.Show(),void this.CreateSystemCategory())},CreateSystemCategory:function(){this.categoryModel=new l,this.categoryModel.set({CategoryCode:this.categoryCode,ParentCategory:this.parentCategory,IsActive:!0,Description:this.description});var e=this;this.categoryModel.url=r.ServiceUrl+a.PRODUCT+n.CREATESYSTEMCATEGORY,this.categoryModel.save(null,{success:function(t,o){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.CategorySavedCompleted(o)},error:function(e,t,o){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error"),s.Products.RequestTimeOut()}})},CategorySavedCompleted:function(e){e.ErrorMessage?(navigator.notification.alert(e.ErrorMessage,null,"Unable to Add Category","OK"),s.Products.Overlay.Hide()):(s.Products.ShowNotification("Category Successfully Saved"),s.Products.Overlay.Hide(),r.FormHasChanges=!1,this.mainCategoryView.LoadItems("",e))},categoryCode_Change:function(e){e.preventDefault(),this.AssignDescriptionFromCategoryCode()},AssignDescriptionFromCategoryCode:function(){var t=e("#categoryCode").val(),o=e("#description").val();null!=t&&""!=t&&(null!=o&&""!=o||this.AssignDescription(t))},AssignDescription:function(t){e("#description").val(t)}}),h=function(e){1==e&&u.DoCancelNew()};return C});