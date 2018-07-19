define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/shared","shared/method","model/base","collection/base","text!template/18.2.0/products/unitmeasure/uomdetail.tpl.html","text!template/18.2.0/products/unitmeasure/uomdetail/uom-info.tpl.html"],function(e,t,i,a,o,n,s,r,d,l,u,c){var h,v={Body:".uomdetail-body div",Footer:".uomdetail-footer"},U=function(e){1===e&&h.DeleteUOM()},M=a.View.extend({_uomDetailTemplate:i.template(u),_uomInfoTemplate:i.template(c),events:{"tap #btn-finish":"btnClick_Finish","tap #btn-cancel":"btnClick_Cancel","tap #btn-Save":"btnClick_Update","tap #btn-Delete":"btnClick_Delete","focus #data-UOMQuantity":"SaveAndClearValue","blur #data-UOMQuantity":"RevertPreviousValue","change #data-UOMCode":"UOMCode_Change"},initialize:function(){h=this,this.IsNew=!1},render:function(){return this.model?(this.$el.html(this._uomDetailTemplate),this.$(v.Footer).hide()):(this.$el.html(""),this.DisplayNoRecordFound()),this.CheckReadOnlyMode(),this},CheckReadOnlyMode:function(){this.options.IsReadOnly&&(e("#data-UOMCode").addClass("ui-readonly"),e("#data-UOMDescription").addClass("ui-readonly"),e("#data-UOMQuantity").addClass("ui-readonly"),e("#btn-Save").addClass("ui-disabled"),e("#btn-Delete").addClass("ui-disabled"))},btnClick_Cancel:function(e){e.stopImmediatePropagation(),this.trigger("cancel",this)},DoCancel:function(){this.ClearFields(),this.$(v.Footer).hide(),this.IsNew=!1},btnClick_Finish:function(t){t.preventDefault(),this.ValidateBeforeProcess()&&(this.ValidateNewRecord()?this.SaveNewUOM():e("#data-UOMCode").removeAttr("readonly"))},btnClick_Update:function(e){e.preventDefault(),this.ValidateBeforeProcess()&&this.UpdateUOM()},btnClick_Delete:function(e){e.preventDefault(),navigator.notification.confirm("Are you sure you want to delete this unit of measure?",U,"Confirmation",["Yes","No"])},AddMode:function(){this.IsNew=!0,this.$(v.Footer).show(),e("#data-UOMCode").removeAttr("readonly"),e("#uom-title").text("New Unit of Measure"),this.$("#paddingRight div").css("visibility","hidden"),this.ClearFields(),this.LoadUnitMeasureSchema()},AssignDescriptionFromUOMCode:function(){var t=e("#data-UOMCode").val(),i=e("#data-UOMDescription").val();this.IsNew&&null!=t&&""!=t&&(null!=i&&""!=i||this.AssignDescription(t))},AssignDescription:function(t){e("#data-UOMDescription").val(t)},ClearFields:function(){e("#data-UOMCode").val(""),e("#data-UOMDescription").val(""),e("#data-UOMQuantity").val("")},DeleteUOM:function(){var t=this;uom=this.InitializeUOM(),uom.set({IsActive:this.model.get("IsActive"),UnitMeasureDescription:e("#data-UOMDescription").val(),UnitMeasureQuantity:e("#data-UOMQuantity").val(),UnitMeasureCode:e("#data-UOMCode").val()}),s.Products.Overlay.Show(),uom.url=o.ServiceUrl+n.PRODUCT+r.DELETEUNITOFMEASURE,uom.save(null,{success:function(i,a,o){a?s.Products.ShowNotification(a.ErrorMessage,!0):s.Products.ShowNotification("Unit of Measure '"+e("#data-UOMCode").val()+"' was successfully deleted!"),t.trigger("delete",uom),s.Products.Overlay.Hide()},error:function(){s.Products.RequestTimeOut()}})},DisplayNoRecordFound:function(){s.Products.DisplayNoRecordFound("#right-panel",".list-wrapper",this.toBeSearched)},ForceAdd:function(){this.$el.html(this._uomDetailTemplate),this.$(v.Body).html(this._uomInfoTemplate()),this.AddMode()},InitializeUOM:function(){var e=new d;return e.on("sync",this.SaveSuccess,this),e.on("error",this.SaveError,this),e},LoadSelectedUOM:function(){this.model&&(this.$(v.Body).html(this._uomInfoTemplate()),e("#data-UOMCode").val(this.model.get("UnitMeasureCode")),e("#data-UOMIsActive").prop("checked",this.model.get("IsActive")),e("#data-UOMDescription").val(this.model.get("UnitMeasureDescription")),e("#data-UOMQuantity").val(this.model.get("UnitMeasureQuantity")))},LoadUnitMeasureSchema:function(){e("#data-UOMQuantity").val("1")},SaveNewUOM:function(){uom=this.InitializeUOM(),uom.set({IsActive:!0,UnitMeasureDescription:e("#data-UOMDescription").val(),UnitMeasureQuantity:e("#data-UOMQuantity").val(),UnitMeasureCode:e("#data-UOMCode").val()}),uom.url=o.ServiceUrl+n.PRODUCT+r.CREATEUNITOFMEASURE,uom.save(),s.Products.Overlay.Show()},SaveSuccess:function(t,i,a){s.Products.Overlay.Hide(),i&&(i.ErrorMessage?s.Products.ShowNotification(i.ErrorMessage,!0):s.Products.ShowNotification("Unit of Measure '"+i.UnitMeasureCode+"' was successfully created!"),this.ClearFields(),this.$(v.Footer).hide(),e("#data-UOMCode").attr("readonly","readonly"),this.$("#paddingRight div").css("visibility","visible"),this.trigger("saved",t),this.IsNew=!1)},SaveError:function(){s.Products.RequestTimeOut()},Show:function(){this.render(),s.Products.DisplayWait(),this.LoadSelectedUOM(),this.CheckReadOnlyMode()},UpdateUOM:function(){var t=this;uom=this.InitializeUOM(),uom.set({IsActive:this.model.get("IsActive"),UnitMeasureDescription:e("#data-UOMDescription").val(),UnitMeasureQuantity:e("#data-UOMQuantity").val(),UnitMeasureCode:e("#data-UOMCode").val()}),s.Products.Overlay.Show(),uom.url=o.ServiceUrl+n.PRODUCT+r.UPDATEUNITOFMEASURE,uom.save(null,{success:function(e,i,a){i&&(t.trigger("updated",e),s.Products.ShowNotification("Changes successfully saved!"),s.Products.Overlay.Hide())}})},UOMCode_Change:function(e){e.preventDefault(),this.AssignDescriptionFromUOMCode()},ValidateFields:function(){var t=(e("#data-UOMDescription").val(),e("#data-UOMQuantity").val()),i=e("#data-UOMCode").val();return!s.IsNullOrWhiteSpace(t)&&!s.IsNullOrWhiteSpace(i)},ValidateQuantity:function(t){var i=0;return i=o.InventoryPreference.IsAllowFractional?parseFloat(e("#data-UOMQuantity").val()):parseInt(e("#data-UOMQuantity").val()),0!=i&&i>0},ValidateBeforeProcess:function(){var e=this.ValidateFields(),t=this.ValidateQuantity(),i=!1;return e||s.Products.ShowNotification("Please fill out all fields before continuing.",!0),t||i||s.Products.ShowNotification("Quantity must not be zero(0) and must be a positive number.",!0),!t&&i&&s.Products.ShowNotification("Please fill out all fields before continuing.",!0),!(!e||!t)},ValidateNewRecord:function(){var t=e("#data-UOMCode").val(),i=this.collection.find(function(e){return e.get("UnitMeasureCode").toUpperCase()===t.toUpperCase()});return!i||(console.log("CAN'T EXIST"),s.Products.ShowNotification("Unit of Measure '"+t+"' entered already exist. Try again..",!0),!1)},AssignNumericValidation:function(e){o.InventoryPreference.IsAllowFractional?s.Input.NonNegative("#"+e.target.id):s.Input.NonNegativeInteger("#"+e.target.id)},SaveAndClearValue:function(t){var i="#"+t.target.id,a=e(i).val();this.lastQty=a,e(i).val(""),this.AssignNumericValidation(t)},RevertPreviousValue:function(t){var i="#"+t.target.id,a=e(i).val(),o="";o=""!==a?parseFloat(a):this.lastQty,e(i).val(o)}});return M});