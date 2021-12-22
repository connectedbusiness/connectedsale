define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/base","collection/base","view/20.1.0/products/products/detail/general","view/20.1.0/products/products/detail/pricing","view/20.1.0/products/products/detail/unitofmeasure","view/20.1.0/products/products/detail/more","view/20.1.0/products/products/detail/summary","text!template/20.1.0/products/products/products-detail.tpl.html"],function(e,t,i,s,o,a,r,n,h,c,l,d,u,g,m,w){var p,C={Body:".detail-body div",Main:".detail-body"},f={General:"General",Pricing:"Pricing",UnitOfMeasure:"UnitOfMeasure",More:"More",Summary:"Summary"},P={Next:"#btn-next",Back:"#btn-back",Finish:"#btn-finish",Cancel:"#btn-cancel"},b=s.View.extend({_productsDetailTemplate:i.template(w),events:{"tap #general":"tabGeneral_click","tap #pricing":"tabPricing_click","tap #unitofmeasure":"tabUoM_click","tap #more":"tabMore_click","tap #btn-cancel":"btnClick_Cancel","tap #btn-back":"btnClick_Back","tap #btn-next":"btnClick_Next","tap #btn-finish":"btnClick_Finish","tap #btn-Save":"btnClick_Save","tap #btn-Delete":"btnClick_Delete"},tabGeneral_click:function(e){e.preventDefault(),this.ChangeTab(f.General)},tabPricing_click:function(e){e.preventDefault(),this.ChangeTab(f.Pricing)},tabUoM_click:function(e){e.preventDefault(),this.ChangeTab(f.UnitOfMeasure)},tabMore_click:function(e){e.preventDefault(),this.ChangeTab(f.More)},btnClick_Cancel:function(e){e.preventDefault(),this.trigger("cancel",this)},btnClick_Back:function(e){e.preventDefault(),this.NavigateTab()},btnClick_Next:function(e){e.preventDefault(),this.NavigateTab(!0)},btnClick_Finish:function(e){e.preventDefault(),this.SaveNewProduct()},btnClick_Save:function(e){e.preventDefault(),this.SaveChanges()},btnClick_Delete:function(e){e.preventDefault(),this.ConfirmDelete()},CurrentTab:"General",initialize:function(){p=this,this.CurrentTab=f.General,this.IsNew=!1,this.$el.show()},render:function(){return this.model?this.$el.html(this._productsDetailTemplate()):(this.$el.html(""),this.DisplayNoRecordFound()),this.CheckReadOnlyMode(),this},CheckReadOnlyMode:function(){this.options.IsReadOnly&&(e("#btn-Save").addClass("ui-disabled"),e("#btn-Delete").addClass("ui-disabled"))},Show:function(){this.render(),this.DisplayWait(),this.GetItemDetails()},InitializeChildViews:function(){},DisplayWait:function(){n.Products.DisplayWait(C.Body)},DisplayError:function(){n.Products.DisplayError(C.Body)},DisplayNoRecordFound:function(){n.Products.DisplayNoRecordFound("#right-panel",".list-wrapper",this.toBeSearched)},ChangeTab:function(e){this.CurrentTab!=e&&this.ValidateChangeTab()&&(e==f.General&&this.LoadGeneralView(),e==f.Pricing&&this.LoadPricingView(),e==f.UnitOfMeasure&&this.LoadUOMView(),e==f.More&&this.LoadMoreView(),this.CurrentTab=e)},ChangeDisplayTab:function(t){e(".detail-header .tab-active").addClass("tab"),e(".detail-header .tab").removeClass("tab-active"),e(t).addClass("tab-active"),e(t).removeClass("tab")},NavigateTab:function(e){if(this.ValidateChangeTab())switch(this.CurrentTab){case f.General:e&&(this.IsNew?(this.ToggleNextButton(!0),this.generalView.ValidateItemName(this,"ValidateItemName_Success","ValidateItemName_Error")):this.LoadPricingView());break;case f.Pricing:e?this.LoadUOMView():this.LoadGeneralView();break;case f.UnitOfMeasure:e?this.LoadMoreView():this.LoadPricingView();break;case f.More:e?this.LoadSummaryView():this.LoadUOMView();break;case f.Summary:e||this.LoadMoreView()}},ToggleNextButton:function(t){t?(e("#btn-next i").removeClass("icon-chevron-right"),e("#btn-next i").addClass("icon-spinner"),e("#btn-next i").addClass("icon-spin")):(e("#btn-next i").removeClass("icon-spinner"),e("#btn-next i").removeClass("icon-spin"),e("#btn-next i").addClass("icon-chevron-right"))},ValidateItemName_Success:function(){this.LoadPricingView(),this.ToggleNextButton()},ValidateItemName_Error:function(){this.ToggleNextButton()},ValidateChangeTab:function(){switch(this.CurrentTab){case f.General:if(!this.ValidateGeneralDetails())return!1;break;case f.Pricing:if(!this.ValidatePricing())return!1;break;case f.UnitOfMeasure:if(!this.ValidateUOM())return!1;break;case f.More:if(!this.ValidateMore())return!1}return!0},InitializeNewModels:function(){this.InitializeItemModel(),this.InitializePricingModel(),this.InitializeUOMCollection(),this.InitializeCategoryCollection(),this.InitializeDepartmentCollection(),this.InitializeAccessoryCollection(),this.InitializeSubstituteCollection()},InitializeItemModel:function(){this.model=new h,this.model.set({ItemCode:"",ItemName:"",ItemDescription:"",RetailPrice:0,WholesalePrice:0,AverageCost:0,StandardCost:0,CurrentCost:0,ItemType:"Stock",SerializeLot:"None",AutoGenerate:!1,DontEarnPoints:!1})},InitializePricingModel:function(){this.pricingModel=new h,this.pricingModel.set({ItemCode:"",StandardCost:0,RetailPrice:0,WholesalePrice:0})},InitializeUOMCollection:function(){this.uoms=new c;var e=new h;e.set({IsNew:!0,IsBase:!0,UnitMeasureQuantity:1,UnitMeasureQty:1,UPCCode:"",UnitMeasureCode:"EACH",DefaultSelling:!0}),this.uoms.add(e)},InitializeAccessoryCollection:function(){this.accessories=new c},InitializeSubstituteCollection:function(){this.substitutes=new c},InitializeCategoryCollection:function(){this.categories=new c},InitializeDepartmentCollection:function(){this.departments=new c},ResetMain:function(){e(C.Main).html("<div></div>")},ResetTabViews:function(){this.generalView&&this.generalView.Close(),this.generalView=null,this.pricingView&&this.pricingView.Close(),this.pricingView=null,this.uomView&&this.uomView.Close(),this.uomView=null,this.moreView&&this.moreView.Close(),this.moreView=null},ResetUM:function(){console.log("Unit Measure Reset: "+Math.random()),this.uoms.reset(),this.InitializeUOMCollection()},LoadGeneralView:function(){var e=this;this.ChangeDisplayTab("#general"),this.model&&(this.CurrentTab=f.General,this.generalView&&this.generalView.Close(),this.ResetMain(),this.generalView=new l({el:C.Body,IsReadOnly:this.options.IsReadOnly}),this.generalView.el=C.Body,this.generalView.on("validationError",function(){e.ShowWarning(e.generalView.ValidationError)}),this.generalView.on("resetUM",function(){e.ResetUM()}),this.pricingModel&&this.pricingModel.get("RetailPrice")&&this.model.set({RetailPrice:this.pricingModel.get("RetailPrice")}),this.generalView.model=this.model,this.generalView.IsNew=this.IsNew,this.DisplayWait(),this.generalView.Show(),this.ToggleWizard())},LoadPricingView:function(){var e=this;this.ChangeDisplayTab("#pricing"),this.pricingModel&&this.model&&(this.CurrentTab=f.Pricing,this.pricingView&&this.pricingView.Close(),this.ResetMain(),this.pricingView=new d({el:C.Body,IsReadOnly:this.options.IsReadOnly}),this.pricingView.on("validationError",function(){e.ShowWarning(e.pricingView.ValidationError)}),this.pricingView.model=this.model,this.pricingView.pricing=this.pricingModel,this.pricingView.IsNew=this.IsNew,this.DisplayWait(),this.pricingView.Show(),this.ToggleWizard())},LoadUOMView:function(){var e=this;this.ChangeDisplayTab("#unitofmeasure"),this.uoms&&(this.CurrentTab=f.UnitOfMeasure,this.uomView&&this.uomView.Close(),this.ResetMain(),this.uomView=new u({el:C.Body,IsReadOnly:this.options.IsReadOnly}),this.uomView.on("validationError",function(){e.ShowWarning(e.uomView.ValidationError)}),this.uomView.model=this.model,this.uomView.collection=this.uoms,this.uomView.substitutes=this.substitutes,this.uomView.accessories=this.accessories,this.uomView.IsNew=this.IsNew,this.DisplayWait(),this.uomView.Show(),this.ToggleWizard())},LoadMoreView:function(){var e=this;this.ChangeDisplayTab("#more"),this.categories&&(this.CurrentTab=f.More,this.moreView&&this.moreView.Close(),this.ResetMain(),this.moreView=new g({el:C.Body,IsReadOnly:this.options.IsReadOnly}),this.moreView.on("validationError",function(){e.ShowWarning(e.moreView.ValidationError)}),this.moreView.categories=this.categories,this.moreView.departments=this.departments,this.moreView.IsNew=this.IsNew,this.DisplayWait(),this.moreView.Show(),this.ToggleWizard())},LoadSummaryView:function(e){this.CurrentTab=f.Summary,this.summaryView&&this.summaryView.Close(),this.ResetMain(),this.summaryView=new m({el:C.Body}),this.summaryView.IsNew=this.IsNew,this.summaryView.itemModel=this.model,this.summaryView.pricingModel=this.pricingModel,this.summaryView.uoms=this.uoms,this.summaryView.departments=this.departments,this.summaryView.categories=this.categories,this.summaryView.accessories=this.accessories,this.summaryView.substitutes=this.substitutes,this.DisplayWait(),this.summaryView.Show(),this.ToggleWizard()},ToggleWizard:function(){if(this.IsNew)switch(this.CurrentTab){case f.General:e(P.Back).css("display","none"),e(P.Next).css("display","block");break;case f.Pricing:case f.UnitOfMeasure:case f.More:e(P.Back).css("display","block"),e(P.Next).css("display","block");break;case f.Summary:e(P.Back).css("display","block"),e(P.Next).css("display","none")}},GetItemDetails:function(){if(this.model){var e=new h;e.set({StringValue:this.model.get("ItemCode")}),e.url=o.ServiceUrl+a.PRODUCT+r.GETITEMDETAILS,e.on("sync",this.GetItemDetailsSuccess,this),e.on("error",this.GetItemDetailsError,this),e.save()}},GetItemDetailsSuccess:function(e,t){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.InitializeNewModels(),e.get("ItemDetails")&&e.get("ItemDetails")[0]&&this.model.set(e.get("ItemDetails")[0]),e.get("ItemPricingDetails")&&e.get("ItemPricingDetails")[0]&&this.pricingModel.set(e.get("ItemPricingDetails")[0]),e.get("UnitOfMeasures")&&e.get("UnitOfMeasures").length>0&&this.uoms.reset(e.get("UnitOfMeasures")),e.get("ItemCategories")&&e.get("ItemCategories").length>0&&this.categories.reset(e.get("ItemCategories")),e.get("ItemDepartments")&&e.get("ItemDepartments").length>0&&this.departments.reset(e.get("ItemDepartments")),e.get("Accessories")&&e.get("Accessories").length>0&&this.accessories.reset(e.get("Accessories")),e.get("Substitutes")&&e.get("Substitutes").length>0&&this.substitutes.reset(e.get("Substitutes")),this.uoms&&this.uoms.each(function(e){var t=e.get("UnitMeasureQty");e.set({UnitMeasureQuantity:t})}),this.LoadGeneralView()},GetItemDetailsError:function(e,t,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.DisplayError()},AddMode:function(){e("#item-details").addClass("addmode"),this.IsNew=!0,this.InitializeNewModels(),this.ResetTabViews(),this.LoadGeneralView()},ShowValidationError:function(e){},ValidateModel:function(e){return!((e||this.CurrentTab==f.General)&&!this.ValidateGeneralDetails())&&(!((e||this.CurrentTab==f.Pricing)&&!this.ValidatePricing())&&(!((e||this.CurrentTab==f.UnitOfMeasure)&&!this.ValidateUOM())&&!((e||this.CurrentTab==f.More)&&!this.ValidateMore())))},ValidateGeneralDetails:function(){return!this.generalView||this.generalView.Validate()},ValidatePricing:function(){return!this.pricingView||this.pricingView.Validate()},ValidateUOM:function(){return!this.uomView||this.uomView.Validate()},ValidateMore:function(){return!this.moreView||this.moreView.Validate()},ShowWarning:function(e){return"ItemName"==e?(n.Products.ShowNotification("Item Name is required!",!0),void(this.CurrentTab!=f.General&&this.LoadGeneralView())):"ItemDescription"==e?(n.Products.ShowNotification("Item Description is required!",!0),void(this.CurrentTab!=f.General&&this.LoadGeneralView())):"ItemExists"==e?(n.Products.ShowNotification("Item Name already exists.",!0),void(this.CurrentTab!=f.General&&this.LoadGeneralView())):"ValidationError"==e?(n.Products.ShowNotification("An error was encountered during validation.",!0),void(this.CurrentTab!=f.General&&this.LoadGeneralView())):"AverageCost"==e?(n.Products.ShowNotification("Item Cost can not be less than zero!",!0),void(this.CurrentTab!=f.Pricing&&this.LoadPricingView())):"RetailPrice"==e?(n.Products.ShowNotification("Retail Price can not be less than zero!",!0),void(this.CurrentTab!=f.Pricing&&this.LoadPricingView())):"WholesalePrice"==e?(n.Products.ShowNotification("Wholesale Price can not be less than zero!",!0),void(this.CurrentTab!=f.Pricing&&this.LoadPricingView())):"UnitMeasureCode"==e?(n.Products.ShowNotification("Unit of Measure code is required!",!0),void(this.CurrentTab!=f.UnitOfMeasure&&this.LoadUOMView())):"UnitMeasureQuantity"==e?(n.Products.ShowNotification("Unit of Measure Quantity can not be equal or less than zero!",!0),void(this.CurrentTab!=f.UnitOfMeasure&&this.LoadUOMView())):"UOM_Duplicate"==e?(n.Products.ShowNotification("Duplicate Unit of Measure!",!0),void(this.CurrentTab!=f.UnitOfMeasure&&this.LoadUOMView())):"AccessoryExist"==e?(n.Products.ShowNotification("Accessory Already Exists!",!0),void(this.CurrentTab!=f.UnitOfMeasure&&this.LoadUOMView())):"SubstituteExist"==e?(n.Products.ShowNotification("Substitute Already Exists!",!0),void(this.CurrentTab!=f.UnitOfMeasure&&this.LoadUOMView())):"CategoryCode"==e?(n.Products.ShowNotification("Category cannot be empty!",!0),void(this.CurrentTab!=f.More&&this.LoadMoreView())):"Category_Duplicate"==e?(n.Products.ShowNotification("Duplicate Categories!",!0),void(this.CurrentTab!=f.More&&this.LoadMoreView())):"DepartmentCode"==e?(n.Products.ShowNotification("Department cannot be empty!",!0),void(this.CurrentTab!=f.More&&this.LoadMoreView())):"DepartmentCode_Duplicate"==e?(n.Products.ShowNotification("Duplicate Departments!",!0),void(this.CurrentTab!=f.More&&this.LoadMoreView())):void 0},HasChanges:function(e,t){return e?(this.model&&(this.model.HasChanges=!1),this.pricingModel&&(this.pricingModel.HasChanges=!1),this.categories&&(this.categories.HasChanges=!1),this.departments&&(this.departments.HasChanges=!1),this.uoms&&(this.uoms.HasChanges=!1),this.accessories&&(this.accessories.HasChanges=!1),this.substitutes&&(this.substitutes.HasChanges=!1),this.HasPhotoChanges(!0),void(this.IsNew=!1)):!(!this.model||!this.model.HasChanges)||(!(!this.pricingModel||!this.pricingModel.HasChanges)||(!(!this.categories||!this.categories.HasChanges)||(!(!this.departments||!this.departments.HasChanges)||(!(!this.uoms||!this.uoms.HasChanges)||(!(!this.accessories||!this.accessories.HasChanges)||(!(!this.substitutes||!this.substitutes.HasChanges)||(!(t||!this.HasPhotoChanges())||void 0)))))))},HasPhotoChanges:function(e){if(this.model)return e?void this.model.set({OPhotoB64:null}):!(!this.model.get("PhotoB64")||!this.model.get("OPhotoB64")||this.model.get("PhotoB64")==this.model.get("OPhotoB64"))},UpdateValuesByItemType:function(){if(this.model&&this.pricingModel){var e=this.model.get("ItemType");if("Gift Card"==e||"Gift Certificate"==e){var t=this.pricingModel.get("WholesalePrice");this.pricingModel.set({RetailPrice:t}),this.model.set({AverageCost:0,StandardCost:0,CurrentCost:0}),this.accessories.reset()}}},UpdateAccessoriesAndSubstitutes:function(){var e=this.model.get("ItemCode");this.IsNew&&(e="[To Be Generated]"),this.accessories.each(function(t){t.set({ItemCode:e})}),this.substitutes.each(function(t){t.set({ItemCode:e})})},SaveNewProduct:function(){if(this.ValidateModel(!0)){var e=new h;this.ResetPhotoFromModel(this.model);var t=new c,i=new c;this.UpdateValuesByItemType(),this.UpdateAccessoriesAndSubstitutes(),t.add(this.model),i.add(this.pricingModel),e.set({ItemDetails:t.toJSON(),ItemPricingDetails:i.toJSON(),UnitOfMeasures:this.uoms.toJSON(),ItemCategories:this.categories.toJSON(),ItemDepartments:this.departments.toJSON(),Accessories:this.accessories.toJSON(),Substitutes:this.substitutes.toJSON()}),e.on("sync",this.SaveNewProductSuccess,this),e.on("error",this.SaveNewProductError,this),e.url=o.ServiceUrl+a.PRODUCT+r.CREATEINVENTORYITEM,e.save({timeout:0}),n.Products.Overlay.Show()}},SaveNewProductSuccess:function(e,t){return o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),n.Products.Overlay.Hide(),e.get("ErrorMessage")?(this.model&&this.PhotoQue&&this.model.set({Photo:this.PhotoQue.Photo,PhotoB64:this.PhotoQue.PhotoB64,OPhotoB64:this.PhotoQue.OPhotoB64}),void n.Products.ShowNotification(e.get("ErrorMessage"),!0)):(this.ItemCode=e.get("ItemPricingDetails")[0].ItemCode,this.IsNew=!1,this.HasChanges(!0),this.trigger("saved",this),void this.DoUploadPhoto())},SaveNewProductError:function(e,t,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),n.Products.Overlay.Hide(),navigator.notification.alert("An error was encounter when trying to save new product!",null,"Saving Error","OK")},SaveChanges:function(){return o.isBrowserMode||(document.activeElement.blur(),e("input").blur()),this.HasChanges(!1,!0)?void this.DoSaveChanges():this.HasPhotoChanges()?void this.SaveImage():void n.Products.ShowNotification("No Changes Made!")},DoSaveChanges:function(){if(this.ValidateModel(!0)){var e=new h,t=new c,i=new c;this.UpdateValuesByItemType(),this.UpdateAccessoriesAndSubstitutes();var s=this.model.get("ItemCode");this.ItemCode=s,this.ResetPhotoFromModel(this.model),t.add(this.model),i.add(this.pricingModel),e.set({ItemDetails:t.toJSON(),ItemPricingDetails:i.toJSON(),UnitOfMeasures:this.uoms.toJSON(),ItemCategories:this.categories.toJSON(),ItemDepartments:this.departments.toJSON(),Accessories:this.accessories.toJSON(),Substitutes:this.substitutes.toJSON()}),e.on("sync",this.UpdateProductSuccess,this),e.on("error",this.UpdateProductError,this),e.url=o.ServiceUrl+a.PRODUCT+r.UPDATEINVENTORYITEM,e.save({timeout:0}),n.Products.Overlay.Show()}},UpdateProductSuccess:function(e,t){return o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),n.Products.Overlay.Hide(),e.get("ErrorMessage")?void navigator.notification.alert(e.get("ErrorMessage"),null,"Saving Error","OK"):(this.HasChanges(!0),this.trigger("updated",this),void this.DoUploadPhoto())},UpdateProductError:function(e,t,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),n.Products.Overlay.Hide(),navigator.notification.alert("An error was encounter when trying to update product!",null,"Saving Error","OK")},ResetPhotoFromModel:function(e){var t,i,s;return e?(t=this.model.get("Photo"),i=this.model.get("PhotoB64"),s=this.model.get("OPhotoB64"),this.model.set({Photo:null}),this.model.set({PhotoB64:null}),this.model.set({OPhotoB64:null}),void(this.PhotoQue={Photo:t,PhotoB64:i,OPhotoB64:s,IsNew:this.IsNew})):void(this.model&&this.PhotoQue&&this.model.set({Photo:this.PhotoQue.Photo,PhotoB64:this.PhotoQue.PhotoB64,OPhotoB64:this.PhotoQue.OPhotoB64}))},DoUploadPhoto:function(){this.PhotoQue&&(this.ResetPhotoFromModel(),this.HasPhotoChanges()&&this.SaveImage())},ConfirmDelete:function(){navigator.notification.confirm("Are you sure you want to delete this product?",v,"Confirm Delete",["Yes","No"])},DoDelete:function(){var e=this.model.get("ItemCode"),t=new h;this.ItemCode=e,t.set({StringValue:e}),t.on("sync",this.DeleteSuccess,this),t.on("error",this.DeleteError,this),t.url=o.ServiceUrl+a.PRODUCT+r.DELETEITEMBYITEMCODE,t.save({timeout:0}),n.Products.Overlay.Show()},DeleteSuccess:function(e,t){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),n.Products.Overlay.Hide(),t.ErrorMessage?t.ErrorMessage.indexOf("DELETE statement conflicted")>-1?n.Products.ShowNotification("The product selected is currently being used as part of another record!",!0,5e3):navigator.notification.alert(t.ErrorMessage,null,"Delete Error","OK"):(this.HasChanges(!0),this.trigger("deleted",this))},DeleteError:function(e,t,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),n.Products.Overlay.Hide(),navigator.notification.alert("An error was encounter when trying to delete product!",null,"Delete Error","OK")},SaveImage:function(){if(this.model.get("PhotoB64")){var e=this.model.get("PhotoB64");e=n.Products.Base64Only(e);for(var t=this.model.get("ItemCode"),i="REFID-"+Math.random()+"-"+Math.random(),s=8e3,l=0,d=new c,u=function(e,t,i,s,o){return new h({ItemCode:e,ReferenceID:t,PartCount:i,PartNumber:s,Base64Content:o})},g=!0;g;){l++;var m=e.substr((l-1)*s,s);0==e.substr(l*s).length&&(g=!1),d.add(u(t,i,l,l,m))}d.each(function(e){e.set({PartCount:l})});var w=0,p=0,C=this,f=0,P=function(e,t){return e||p++,e?w>=3?(n.Products.ShowNotification("Photo Not Uploaded! Error on index : "+f+" ; "+t,!0),void n.Products.Overlay.Hide()):(w++,void b()):(w=0,void(w+p==l?p==l?(n.Products.Overlay.Hide(),n.Products.ShowNotification("Photo Uploaded!"),C.PhotoQue&&C.PhotoQue.IsNew&&C.generalView&&(C.generalView.model.set({Photo:[0]}),C.generalView.LoadImage(C.PhotoQue.PhotoB64)),C.PhotoQue=null,C.HasPhotoChanges(!0)):(n.Products.Overlay.Hide(),n.Products.ShowNotification("Photo Not Uploaded! "+t,!0)):(f++,b())))},b=function(){n.Products.Overlay.Show();var e=d.at(f);e.set({PartCount:l}),e.url=o.ServiceUrl+a.PRODUCT+r.SAVEPHOTOBYPARTS,e.save(e,{success:function(e,t){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.Value?P():P(!0,t.ErrorMessage)},error:function(e,t,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),P(!0,"Request Time out")},timeout:0})};b()}}}),v=function(e){1==e&&p.DoDelete()};return b});