define(["jquery","mobile","underscore","backbone","shared/shared","shared/global","shared/service","shared/method","model/base","model/postal","collection/postal","text!template/15.1.0/products/location/locationdetail.tpl.html","text!template/15.1.0/products/location/locationdetail/locationinfo.tpl.html","view/15.1.0/pos/postal/addpostal"],function(t,a,o,e,i,n,l,s,d,c,r,u,h,v){var C,y={Body:".locationdetail-body div",Footer:".locationdetail-footer"},p=function(t){1==t?C.AddNewPostal():C.ClearPostalDetails()},f=function(t){1===t&&C.CheckIfAllowedToDelete()},P=e.View.extend({_locationDetailTemplate:o.template(u),_locationInfoTemplate:o.template(h),events:{"tap #btn-finish":"btnClick_Finish","tap #btn-cancel":"btnClick_Cancel","tap #btn-Save":"btnClick_Update","tap #btn-Delete":"btnClick_Delete","keyup #data-locationPostal":"keyupPostal","change #data-locationPostal":"CheckLoadPostal","change #data-locationCode":"locationCode_Change","focus #data-locationTelephone":"AssignNumericValidation","keyup #data-locationTelephone":"keyupTel","blur #data-locationTelephone":"RevertPreviousValue","change #data-locationCountry":"CountryChanged"},CheckLoadPostal:function(a){if(console.log("ChangePOstal"),!this.proceedToEvent)return void(this.proceedToEvent=!0);var o=t("#data-locationPostal").val();""!=o?this.LoadPostal(o):this.ClearCityAndState()},keyupPostal:function(a){if(console.log("KeyupPOStal"),13===a.keyCode){var o=t("#data-locationPostal").val();""!=o&&this.LoadPostal(o),this.proceedToEvent=!1}},changePostal:function(a){a.preventDefault();var o=t("#data-locationPostal").val();""!=o?this.LoadPostal(o):this.ClearCityAndState()},btnClick_Cancel:function(t){t.preventDefault(),this.trigger("cancel",this)},DoCancel:function(){this.ClearFields(),t("#location-title").text("Location Details"),t("#paddingRight div").css("visibility","visible"),this.$(y.Footer).hide(),this.IsNew=!1},btnClick_Finish:function(a){a.preventDefault(),this.ValidateBeforeProcess()&&(this.ValidateNewRecord()?this.SaveNewLocation():t("#data-locationCode").removeAttr("readonly"))},btnClick_Update:function(t){t.preventDefault(),this.ValidateBeforeProcess()&&this.UpdateLocation()},btnClick_Delete:function(t){t.preventDefault(),navigator.notification.confirm("Are you sure you want to delete this location?",f,"Confirmation",["Yes","No"])},CheckIfAllowedToDelete:function(){i.Products.Overlay.Show();var t=this.model.get("WarehouseCode"),a=new d;a.on("sync",this.FetchComplete,this),a.on("error",this.FetchFailed,this),a.url=n.ServiceUrl+l.POS+s.CHECKIFDEFAULTLOCATION,a.set({StringValue:t}),a.save()},FetchComplete:function(t,a,o){if(i.Products.Overlay.Hide(),a){var e="This location cannot be deleted because it is being used as default location.";i.Products.ShowNotification(e,!0)}else this.DeleteLocation()},FetchFailed:function(t,a,o){i.Products.RequestTimeOut()},DisplayNoRecordFound:function(){i.Products.DisplayNoRecordFound("#right-panel",".list-wrapper",this.toBeSearched)},initialize:function(){C=this,this._country=this.options.countries,this.isPostalValid=!0,this.IsNew=!1},InitializePostal:function(){this.postalmodel||(this.postalmodel=new c),this.postalCollection||(this.postalCollection=new r)},render:function(){this.model?(this.$el.html(this._locationDetailTemplate),this.$(y.Footer).hide()):(this.$el.html(""),this.DisplayNoRecordFound()),this.CheckReadOnlyMode()},CheckReadOnlyMode:function(){this.options.IsReadOnly&&(t("#data-locationCode").addClass("ui-readonly"),t("#data-locationDescription").addClass("ui-readonly"),t("#data-locationAddress").addClass("ui-readonly"),t("#data-locationCountry").addClass("ui-readonly"),t("#data-locationCity").addClass("ui-readonly"),t("#data-locationState").addClass("ui-readonly"),t("#data-locationPostal").addClass("ui-readonly"),t("#data-locationCounty").addClass("ui-readonly"),t("#data-locationEmail").addClass("ui-readonly"),t("#data-locationTelephone").addClass("ui-readonly"),t("#data-locationWebsite").addClass("ui-readonly"),t("#data-locationTaxCode").addClass("ui-readonly"),t("#btn-Save").addClass("ui-disabled"),t("#btn-Delete").addClass("ui-disabled"))},Show:function(){this.render(),this.model&&(i.Products.DisplayWait(),this.LoadSelectedLocation()),this.CheckReadOnlyMode()},LoadSelectedLocation:function(){this.$(y.Body).html(this._locationInfoTemplate()),this.BindCountries(this._country),this.BindCities(this.model),this.BindFields(this.model),this.FetchTaxSchemes()},BindFields:function(a){t("#data-locationCode").val(a.get("WarehouseCode")),t("#data-locationDescription").val(a.get("WarehouseDescription")),t("#data-locationAddress").val(a.get("Address")),t("#data-locationCountry option[value='"+a.get("Country")+"']").attr("selected","selected"),t("#data-locationCity option[value='"+a.get("City")+"']").attr("selected","selected"),t("#data-locationState").val(a.get("State")),t("#data-locationPostal").val(a.get("PostalCode")),t("#data-locationCounty").val(a.get("County")),t("#data-locationEmail").val(a.get("Email")),t("#data-locationTelephone").val(a.get("Telephone")),t("#data-locationWebsite").val(a.get("Website")),t("#data-locationTaxCode").val(a.get("SalesTaxCode"))},BindCountries:function(a){a.each(function(a){t("#data-locationCountry").append(new Option(a.get("CountryCode"),a.get("CountryCode")))})},BindCities:function(a){t('#data-locationCity > option[val !=""]').remove(),a.models?(a.each(function(a){null!=a.get("City")&&t("#data-locationCity").append(new Option(a.get("City"),a.get("City")))}),this.BindStates(a)):null==a.get("City")&&null==a.get("State")||(t("#data-locationCity").append(new Option(a.get("City"),a.get("City"))),t("#data-locationState").val(a.get("State")))},BindStates:function(a){var o=t("#data-locationCity option:selected").val(),e=a.find(function(t){return t.get("City")==o});e&&t("#data-locationState").val(e.get("StateCode"))},LoadPostal:function(a){var o=new r,e=this,n=t("#data-locationCountry option:selected").val();i.LoadPostalByCode(a,function(t){o.reset(t),o.reset(e.FilterPostalByCountry(o,n)),o.length>0?(e.BindCities(o),e.isPostalValid=!0):(e.isPostalValid=!1,i.IsNullOrWhiteSpace(e.isPostalViewLoaded)&&navigator.notification.confirm("The Postal Code '"+a+"' does not exist in the country selected. Do you want to add '"+a+"' ?",p,"Postal Not Found",["Yes","No"]))},function(a){o.reset(),o.RequestError(a,"Error Loading Postal Code"),e.model?t("#data-locationPostal").val(e.model.get("PostalCode")):e.ClearCityAndState()})},AddNewPostal:function(){var a=t("#addPostalCodeContainer"),o=t("#data-locationPostal").val(),e=t("#data-locationCountry option:selected").val();t(a).html("<div id='addPostalContainer' style='display: none'></div>");var n=t("#addPostalContainer");i.IsNullOrWhiteSpace(this.newPostalView)?this.newPostalView=new v({el:n}):(this.newPostalView.remove(),this.newPostalView=new v({el:n})),i.Products.Overlay.Show(),this.isPostalViewLoaded=!0,this.newPostalView.on("AcceptPostal",this.AcceptPostal,this),this.newPostalView.on("ClearPostal",this.ClearPostalDetails,this),this.newPostalView.Show(o,e,this._country)},AcceptPostal:function(a){this.isPostalViewLoaded=!1,t("#data-locationCountry").val(a.CountryCode),t("#data-locationCountry").trigger("change"),t("#data-locationPostal").val(a.PostalCode),t("#data-locationState").val(a.StateCode);var o=a.PostalCode,e=a.City;this.LoadPostal(o),t('#data-locationCity > option[val !=""]').remove(),i.IsNullOrWhiteSpace(e)||t("#data-locationCity").append(new Option(e,e))},CountryChanged:function(){this.ClearPostalDetails(),this.ClearCityAndState()},ClearPostalDetails:function(){this.isPostalViewLoaded=!1,t("#data-locationPostal").val(""),this.ClearCityAndState()},ClearCityAndState:function(){this.isPostalValid&&(this.isPostalValid=!0),t('#data-locationCity > option[val !=""]').remove(),t("#data-locationState").val(""),t("#data-locationPostal").val("")},FilterPostalByCountry:function(t,a){var o=t.reject(function(t){return t.get("CountryCode")!=a});return o},AddMode:function(){this.IsNew=!0,t("#data-locationCode").removeAttr("readonly"),t("#location-title").text("New Location"),t("#paddingRight div").css("visibility","hidden"),this.$(y.Footer).show(),this.ClearFields(),this.RetrieveLocationDefaults()},ForceAdd:function(){this.$el.html(this._locationDetailTemplate),this.$(y.Body).html(this._locationInfoTemplate()),this.BindCountries(this._country),this.AddMode()},ClearFields:function(){t("#data-locationCode").val(""),t("#data-locationDescription").val(""),t("#data-locationAddress").val(""),t("#data-locationPostal").val(""),t("#data-locationState").val(""),t("#data-locationCity").empty(),t("#data-locationCountry").prop("selectedIndex",0),t("#data-locationTelephone").val(""),t("#data-locationCounty").val(""),t("#data-locationEmail").val(""),t("#data-locationWebsite").val("")},InitializeLocation:function(){var t=new d;return t.on("sync",this.SaveSuccess,this),t.on("error",this.SaveError,this),t},RetrieveLocationDefaults:function(){var t=this;inventoryLocation=this.InitializeLocation(),inventoryLocation.url=n.ServiceUrl+l.PRODUCT+s.GETINVENTORYLOCATIONDEFAULTS,inventoryLocation.fetch({success:function(a,o,e){i.Products.Overlay.Hide(),t.BindCities(a),t.SetSalesTax(a),t.BindFields(a),t.FetchTaxSchemes(a)},error:function(){i.Products.RequestTimeOut()}})},SetSalesTax:function(t){null!=t.get("SalesTaxCode")&&""!=t.get("SalesTaxCode")||t.set({SalesTaxCode:this.GetDefaultSalesTax})},SaveNewLocation:function(){inventoryLocation=this.InitializeLocation(),inventoryLocation.set({IsActive:!0,WarehouseDescription:t("#data-locationDescription").val(),Address:t("#data-locationAddress").val(),WarehouseCode:t("#data-locationCode").val(),City:t("#data-locationCity option:selected").val(),State:t("#data-locationState").val(),PostalCode:t("#data-locationPostal").val(),Country:t("#data-locationCountry option:selected").val(),County:t("#data-locationCounty").val(),Email:t("#data-locationEmail").val(),Telephone:t("#data-locationTelephone").val(),Website:t("#data-locationWebsite").val(),SalesTaxCode:t("#data-locationTaxCode").val()}),i.Products.Overlay.Show("Saving in Progress.. This may take a while.."),inventoryLocation.url=n.ServiceUrl+l.PRODUCT+s.CREATEINVENTORYLOCATION,inventoryLocation.save(null,{timeout:0})},DeleteLocation:function(){var a=this;inventoryLocation=this.InitializeLocation(),inventoryLocation.set({IsActive:!0,WarehouseDescription:t("#data-locationDescription").val(),Address:t("#data-locationAddress").val(),WarehouseCode:t("#data-locationCode").val(),City:t("#data-locationCity option:selected").val(),State:t("#data-locationState").val(),PostalCode:t("#data-locationPostal").val(),Country:t("#data-locationCountry option:selected").val(),County:t("#data-locationCounty").val(),Email:t("#data-locationEmail").val(),Telephone:t("#data-locationTelephone").val(),Website:t("#data-locationWebsite").val(),SalesTaxCode:t("#data-locationTaxCode").val()}),i.Products.Overlay.Show("Deleting Location.. This may take a while.."),inventoryLocation.url=n.ServiceUrl+l.PRODUCT+s.DELETEINVENTORYLOCATION,inventoryLocation.save(null,{success:function(o,e,l){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e?(i.Products.ShowNotification("This location cannot be deleted because there are item(s) associated with this record.",!0),a.trigger("delete",null)):(i.Products.ShowNotification("Location '"+inventoryLocation.get("WarehouseCode")+"' was successfully deleted!"),a.trigger("delete",inventoryLocation)),t("#location-title").text("Location Details"),i.Products.Overlay.Hide()},error:function(){i.Products.RequestTimeOut()}})},UpdateLocation:function(){var a=this;inventoryLocation=this.InitializeLocation(),inventoryLocation.set({IsActive:!0,WarehouseCode:t("#data-locationCode").val(),WarehouseDescription:t("#data-locationDescription").val(),Address:t("#data-locationAddress").val(),City:t("#data-locationCity option:selected").val(),State:t("#data-locationState").val(),PostalCode:t("#data-locationPostal").val(),Country:t("#data-locationCountry option:selected").val(),County:t("#data-locationCounty").val(),Email:t("#data-locationEmail").val(),Telephone:t("#data-locationTelephone").val(),Website:t("#data-locationWebsite").val(),SalesTaxCode:t("#data-locationTaxCode").val()}),i.Products.Overlay.Show("Saving in Progress.. This may take a while.."),inventoryLocation.url=n.ServiceUrl+l.PRODUCT+s.UPDATEINVENTORYLOCATION,inventoryLocation.save(null,{timeout:0,success:function(o,e,l){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),""===e.ErrorMessage||null===e.ErrorMessage?(i.Products.ShowNotification("Changes successfully saved!"),i.Products.Overlay.Hide(),t("#location-title").text("Location Details"),a.trigger("updated",o)):(i.Products.ShowNotification(e.ErrorMessage,!0),a.trigger("failed",a.model))},error:function(){i.Products.RequestTimeOut()}})},ResetTemplates:function(){this.ClearFields(),this.$(y.Footer).hide(),t("#location-title").text("Location Details"),this.IsNew=!1},SaveSuccess:function(a,o,e){if(n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),i.Products.Overlay.Hide(),t("#data-locationCode").attr("readonly","readonly"),t("#paddingRight div").css("visibility","visible"),o){if(o.ErrorMessage)return void i.Products.ShowNotification(o.ErrorMessage,!0);i.Products.ShowNotification("Location '"+a.get("WarehouseCode")+"' was successfully created!"),this.trigger("saved",a)}},SaveError:function(){i.Products.RequestTimeOut()},ValidateFields:function(){var a=t("#data-locationCode").val();t("#data-locationDescription").val(),t("#data-locationAddress").val(),t("#data-locationCity option:selected").val(),t("#data-locationState").val(),t("#data-locationCountry option:selected").val(),t("#data-locationPostal").val();return!i.IsNullOrWhiteSpace(a)},ValidateLocationCodeFormat:function(){var a=t("#data-locationCode").val(),o=a.replace(/\"/g," ");return o.indexOf("'")===-1},ValidateNewRecord:function(){var a=t("#data-locationCode").val(),o=this.collection.find(function(t){return t.get("WarehouseCode").toUpperCase()===a.toUpperCase()});return!o||(console.log("CAN'T EXIST"),i.Products.ShowNotification("The Location "+a+" entered already exist. Try again.",!0),!1)},ValidateEmail:function(){var a=t("#data-locationEmail").val();return""==a||!i.ValidateEmailFormat(a)},ValidateUrl:function(){var a=t("#data-locationWebsite").val();return""==a||!i.ValidateUrlFormat(a)},ValidateBeforeProcess:function(){var t=this.ValidateFields(),a=this.ValidateEmail(),o=this.ValidateUrl(),e=this.ValidateLocationCodeFormat(),n=!1;return a||o||(n=!0),t||i.Products.ShowNotification("Please fill out all fields before continuing.",!0),e||i.Products.ShowNotification("Location code must not contain single quote (').",!0),a||n||i.Products.ShowNotification("Email format is invalid.",!0),o||n||i.Products.ShowNotification("URL format is invalid.",!0),a||o||!n||i.Products.ShowNotification("Email and URL format is invalid.",!0),this.isPostalValid||i.Products.ShowNotification("Postal Code is invalid.",!0),this.isPostalValid||o||i.Products.ShowNotification("Postal Code and URL is invalid.",!0),this.isPostalValid||a||i.Products.ShowNotification("Postal Code and Email is invalid.",!0),!!(t&&a&&o&&this.isPostalValid&&e)},GetDefaultSalesTax:function(){return"Sales No Tax"},AssignNumericValidation:function(a){this.lastVal=t("#"+a.target.id).val(),i.Input.NonNegativeInteger("#"+a.target.id)},RevertPreviousValue:function(a){var o=t("#"+a.target.id).val();this.keyUpTriggered&&""!==o&&(this.keyUpTriggered=!1,this.lastVal=parseFloat(o),t("#"+a.target.id).val(this.lastVal))},keyupTel:function(t){this.keyUpTriggered=!0},locationCode_Change:function(t){t.preventDefault(),this.AssignDescriptionFromLocationCode()},AssignDescriptionFromLocationCode:function(){var a=t("#data-locationCode").val(),o=t("#data-locationDescription").val();this.IsNew&&null!=a&&""!=a&&(null!=o&&""!=o||this.AssignDescription(a))},AssignDescription:function(a){t("#data-locationDescription").val(a)},FetchTaxSchemes:function(){var t=new d;t.on("sync",this.FetchTaxSchemeSuccess,this),t.on("error",this.FetchTaxSchemeFailed,this),t.url=n.ServiceUrl+l.PRODUCT+s.LOCATIONTAXSCHEMELOOKUP+100,t.set({StringValue:""}),t.save()},FetchTaxSchemeSuccess:function(t,a){return n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),i.IsNullOrWhiteSpace(a.ErrorMessage)?void this.ResetTaxSchemes(a.SystemTaxSchemes):void navigator.notification.alert("Fetching Tax Response : "+a.ErrorMessage,null,"Error","OK")},FetchTaxSchemeFailed:function(t,a,o){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),navigator.notification.alert("Error Fetching Tax Schemes",null,"")},ResetTaxSchemes:function(a){t('#data-locationTaxCode > option[val !=""]').remove(),this.taxSchemeCollection=new r,this.taxSchemeCollection.reset(a),this.taxSchemeCollection.each(this.FillTaxCombobox,this),this.SetSelectedTaxCode(this.model.get("SalesTaxCode"))},FillTaxCombobox:function(a){var o=a.get("TaxDescription"),e=a.get("TaxCode");t("#data-locationTaxCode").append(new Option(o,e))},TaxCodeChanged:function(a){var o=a.target.id,e=t("#"+o).val();this.taxCode=e},SetSelectedTaxCode:function(a){this.IsNew||!a?t("#data-locationTaxCode").val(this.GetDefaultSalesTax).change():t("#data-locationTaxCode").val(a).change()}});return P});