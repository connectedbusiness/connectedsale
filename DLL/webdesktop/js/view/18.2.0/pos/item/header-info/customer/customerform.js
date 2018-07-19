define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/base","model/postal","model/country","model/customerschema","model/lookupcriteria","collection/postal","collection/countries","collection/classtemplates","collection/base","text!template/18.2.0/pos/item/header-info/customer/customerform.tpl.html","view/spinner","view/18.2.0/pos/postal/addpostal"],function(e,t,s,o,i,a,l,r,n,c,m,d,u,C,h,p,T,y,v,g){var S,f={NewCustomer:{FormTitle:"New Customer",AttribName:"CustomerName"},EditCustomer:{FormTitle:"Edit Customer",AttribName:"CustomerName"}},w=function(e){1==e?S.AddNewPostal():S.ClearPostalDetails()},b="#chkloyalty-points",P=!1,E=o.View.extend({_template:s.template(y),events:{"keypress #customer-PostalCode":"buttonLoadOnTap","blur #customer-PostalCode":"buttonLoadOnFocus","tap #customer-save-btn":"buttonSaveOnTap","tap #customer-cancel-btn":"buttonCancelOnTap","change #customer-City":"SetState","tap #customer-country":"CountryTap","change #customer-country":"CountryChanged","change #cmb-customer-classtemplate":"ClassTemplateChanged","change #cmb-shipto-classtemplate":"ShipToClassTemplateChanged","focus #customer-Phone":"AssignNumericValidation","tap #chkloyalty-points":"LoyaltyPointsCheck_Changed"},customerCode:"",classsCode:"",classTemplate:"",paymentTerm:"",paymentTermCode:"",taxCode:"",postal:"",customerName:"",address:"",city:"",state:"",phone:"",email:"",website:"",country:"",formType:"",county:"",initialize:function(){this.formType=this.options.FormType,S=this,this.render(this.formType)},render:function(t){switch(this.InitializeThings(),t){case f.NewCustomer.FormTitle:this.$el.append(this._template({FormTitle:f.NewCustomer.FormTitle,Name:f.NewCustomer.AttribName})),e("#customerForm").trigger("create"),e("#customerForm").css("top","40%"),this.onLoad=!1;break;case f.EditCustomer.FormTitle:this.$el.append(this._template({FormTitle:f.EditCustomer.FormTitle,Name:f.EditCustomer.AttribName})),e("#customerForm").trigger("create"),e("#customerForm").css("top","42%"),this.onLoad=!0}this.CheckProductEdition(),this.EnableSaveButton()},EnableSaveButton:function(t){t?(e("#customer-save-btn").removeClass("ui-disabled"),e("#customer-save-btn").removeAttr("disabled","true")):(e("#customer-save-btn").addClass("ui-disabled"),e("#customer-save-btn").attr("disabled","true"))},InitializePostalModel:function(){this.postalmodel=new c},InitializeCustomerSchemaModel:function(){this.customerschema=new d,this.customerschema.url=i.ServiceUrl+a.CUSTOMER+l.GETNEWCUSTOMERSCHEMA,this.LoadCustomerSchema()},InitializePostalCollection:function(){this.postalCollection=new C},InitializeThings:function(){this.InitializePostalModel(),this.InitializePostalCollection(),this.InitializeCountryModel(),this.InitializeCountryCollection(),this.InitializeCustomerSchemaModel()},InitializeCountryModel:function(){_rows=1e4,this.countryModel=new m,this.countryModel.url=i.ServiceUrl+a.CUSTOMER+l.COUNTRYCODELOOKUP+_rows},InitializeCountryCollection:function(){this.countryCollection=new h,this.LoadCountries()},CheckProductEdition:function(){i._UserIsCS,this.formType===f.EditCustomer.FormTitle&&(r.ShowHideClassTemplates("customer-ClassTemplate-container"),r.ShowHideClassTemplates("shipto-ClassTemplate-container"),r.ShowHideClassTemplates("customer-PaymentTerm-container"),r.ShowHideClassTemplates("customer-TaxCode-container"),r.ShowHideClassTemplates("customer-CustomerType-container"))},LoadCountries:function(){var e=this;this.index=0,this.countryModel.set({Criteria:""}),this.countryModel.save(null,{success:function(t,s){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.countryCollection.reset(s.Countries),e.DisplayCountries(),e.EnableSaveButton(!0)},error:function(t,s,o){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.RequestError(s,"Error Loading Country List"),e.EnableSaveButton(!0)}})},IsPrioritizeFromPostalCode:function(e,t){var s=e.find(function(e){return e.get("CountryCode")===t&&(e.get("IsRetailCustomerBillToClassPostal")===!0||e.get("IsWholesaleCustomerBillToClassPostal")===!0)});return s&&(s.get("IsRetailCustomerBillToClassPostal")===!0?this.priorityPostalType="Retail":s.get("IsWholesaleCustomerBillToClassPostal")===!0&&(this.priorityPostalType="Wholesale")),!!s},DisplayCountries:function(){0===this.countryCollection.length?(console.log("no countries available."),navigator.notification.alert("No country available.",null,"No Country Found","OK")):(e('#customer-country > option[val !=""]').remove(),this.LoadRetrievedCountry(),this.formType==f.EditCustomer.FormTitle?this.trigger("formLoaded",this):this.SetSelectedCountry())},LoadRetrievedCountry:function(){this.countryCollection.each(this.SetCountryOptions,this)},SetCountryOptions:function(t){var s=t.get("CountryCode");e("#customer-country").append(new Option(s,s))},SetSelectedCountry:function(){this.countryCollection&&0!=this.countryCollection.length&&(e("#customer-country option:selected").removeAttr("selected"),e("#customer-country > option[value='"+this.countrySelected+"']").attr("selected","selected"),e("#customer-country").trigger("change"),e("#customer-name").focus())},CountryTap:function(){this.isCountryTapped=!0},RemoveInvalidPostals:function(e){var t=e.get("CountryCode");t===this.countrySelected&&this.newCollection.add(e)},AddNewPostal:function(){var t=this.postal,s=e("#addPostalCodeContainer");e(s).html("<div id='addPostalContainer' style='display: none'></div>");var o=e("#addPostalContainer");r.IsNullOrWhiteSpace(this.newPostalView)?this.newPostalView=new g({el:o}):(this.newPostalView.remove(),this.newPostalView=new g({el:o})),this.newPostalView.on("AcceptPostal",this.AcceptPostal,this),this.newPostalView.on("ClearPostal",this.ClearPostalDetails,this),this.newPostalView.Show(t,this.countrySelected,this.countryCollection)},AcceptPostal:function(t){this.countrySelected=t.CountryCode,this.SetSelectedCountry(),e("#customer-PostalCode").val(t.PostalCode),this.postal=t.PostalCode,this.city=t.City,e("#customer-State").val(t.StateCode),this.LoadPostal(this.postal,this.city)},ClearPostalDetails:function(){e("#customer-PostalCode").val(""),e("#customer-State").val(""),this.ClearCity(),this.postal=e("#customer-PostalCode").val()},DisplayResultOnPostal:function(t,s){this.newCollection=new C,this.postalCollection.each(this.RemoveInvalidPostals,this),this.postalCollection=this.newCollection,0===this.postalCollection.length?navigator.notification.confirm("The Postal Code '"+t+"' does not exist in the Country selected. Do you want to add '"+t+"' ?",w,"Postal Not Found",["Yes","No"]):(e('#customer-City > option[val !=""]').remove(),this.LoadRetrievedPostal(),""==s?e("#customer-City").prop("selectedIndex",0):e("#customer-City option[value='"+s+"']").attr("selected","selected"),e("#customer-City").trigger("change"))},LoyaltyPointsCheck_Changed:function(){P=r.CustomCheckBoxChange(b,P)},CountryChanged:function(t){var s=t.target.id,o=e("#"+s).val(),i=e("#customer-PostalCode").val();this.countrySelected!=o&&i.length>0&&this.ClearPostalDetails(),this.countrySelected=o,this.formType==f.NewCustomer.FormTitle&&this.LoadClassTemplatesByCountry(o),this.PreviousCountrySelected=o},FetchClassCodes:function(e){if(e&&""!=e){var t=this,s=new u;s.url=i.ServiceUrl+a.CUSTOMER+l.CLASSTEMPLATELOOKUP+100+"/false",s.set({StringValue:e}),s.save(null,{success:function(e,s){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.ResetClassTemplates(s.ClassTemplates)},error:function(e,s,o){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(s,"Error Fetching Class Template List"),t.SetDefaultClassCode()}})}},ResetClassTemplates:function(t){this.classTemplateCollection||(this.classTemplateCollection=new p),this.classIndex=0,this.classTemplateCollection.reset(t),0!==this.classTemplateCollection.length&&(e('#cmb-customer-classtemplate > option[val !=""]').remove(),this.classTemplateCollection.each(this.FillClassTemplateComboBox,this),i.Preference.AllowChangeClassTemplate&&void 0!==i.Preference.AllowChangeClassTemplate&&null!==i.Preference.AllowChangeClassTemplate?(e("#cmb-customer-classtemplate").removeClass("ui-disabled"),e("#cmb-customer-classtemplate").removeAttr("disabled")):(e("#cmb-customer-classtemplate").addClass("ui-disabled"),e("#cmb-customer-classtemplate").attr("disabled","true")),this.formType===f.EditCustomer.FormTitle&&this.trigger("formLoaded",this))},FillClassTemplateComboBox:function(t){var s=t.get("ClassDescription"),o=t.get("ClassCode");e("#cmb-customer-classtemplate").append(new Option(o+" | "+s,o)),o===i.DefaultClassCode&&(e("#cmb-customer-classtemplate").prop("selectedIndex",this.classIndex),this.selectedClassCode=o,e("#cmb-customer-classtemplate").trigger("change")),this.classIndex++},CustomerTypeChanged:function(t){var s=t.target.id,o=e("#"+s).val();if(this.SelectedClassCode!==o&&o&&""!=o){this.businessType=o;var a;if(a="Wholesale"==o?this.WholesaleClass:this.RetailClass,!a)return;this.paymentTermCode=a.get("PaymentTermCode"),this.paymentTermGroup=a.get("PaymentTermGroup"),this.SetSelectedTaxCode(a.get("TaxCode")),i._UserIsCS&&(this.SelectedClassCode=a.get("ClassCode"),this.FindCTemplate(a)),this.FetchPaymentTerms(this.paymentTermGroup)}},ClassTemplateChanged:function(t){var s=t.target.id,o=e("#"+s).val();this.SelectedClassCode!==o&&(this.SelectedClassCode=o,void 0!==this.customerClassTemplateCollection&&0!==this.customerClassTemplateCollection.length&&this.customerClassTemplateCollection.each(this.FindCTemplate,this))},ShipToClassTemplateChanged:function(t){var s=t.target.id,o=e("#"+s).val();this.SelectedShipToClassCode!==o&&(this.SelectedShipToClassCode=o,void 0!==this.shipToClassTemplateCollection&&0!==this.shipToClassTemplateCollection.length&&this.shipToClassTemplateCollection.each(this.FindShipToClassTemplate,this))},FindCTemplate:function(e){this.SelectedClassCode===e.get("ClassCode")&&(console.log(e.get("ClassDescription")+" | "+e.get("ClassCode")),this.classCode=e.get("ClassCode"),this.classTemplate=e.get("ClassCode"))},FindShipToClassTemplate:function(e){this.SelectedShipToClassCode===e.get("ClassCode")&&(console.log(e.get("ClassDescription")+" | "+e.get("ClassCode")),this.shipToClassCode=e.get("ClassCode"),e.get("TaxCode")&&this.SetSelectedTaxCode(e.get("TaxCode")),e.get("PaymentTermCode")&&(this.paymentTermCode=e.get("PaymentTermCode")),e.get("PaymentTermGroup")&&(this.paymentTermGroup=e.get("PaymentTermGroup")))},SetDefaultClassCode:function(){e('#cmb-customer-classtemplate > option[val !=""]').remove(),e("#cmb-customer-classtemplate").append(new Option(this.classCode,this.classCode)),e("#cmb-customer-classtemplate").prop("selectedIndex",0),e("#cmb-customer-classtemplate").trigger("change")},LoadClassTemplatesByCountry:function(e){this.formType!==f.EditCustomer.FormTitle&&(this.LoadCustomerClassTemplatesByCountry(e),this.LoadShipToClassTemplatesByCountry(e))},LoadCustomerClassTemplatesByCountry:function(e){if(e&&""!=e){var t=this,s=new n({StringValue:e});s.url=i.ServiceUrl+a.CUSTOMER+"getcustomerclasstemplatebycountry/",s.save(s,{success:function(e,s){if(i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.get("ClassTemplates")&&0!=e.get("ClassTemplates").length){var o=e.get("ClassTemplates");t.PopulateCustomerClassTemplates(o)}},error:function(e,t,s){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()}})}},LoadShipToClassTemplatesByCountry:function(e){if(e&&""!=e){var t=this,s=new n({StringValue:e});s.url=i.ServiceUrl+a.CUSTOMER+"getshiptoclasstemplatebycountry/",s.save(s,{success:function(e,s){if(i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.get("ClassTemplates")&&0!=e.get("ClassTemplates").length){var o=e.get("ClassTemplates");t.PopulateShipToClassTemplates(o)}},error:function(e,t,s){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()}})}},PopulateCustomerClassTemplates:function(t){var s=this,o=0,a=0,l=new p;l.reset(t),this.customerClassTemplateCollection||(this.customerClassTemplateCollection=new p),this.customerClassTemplateCollection.reset(t),i.DefaultClassCode=null,e("#cmb-customer-classtemplate").html(""),l.each(function(t){var l=t.get("ClassDescription"),r=t.get("ClassCode");t.get("IsDefault")&&(i.DefaultClassCode=r,s.selectedClassCode=r,a=o),o++,e("#cmb-customer-classtemplate").append(new Option(r+" | "+l,r))}),e("#cmb-customer-classtemplate").prop("selectedIndex",a),e("#cmb-customer-classtemplate").trigger("change")},PopulateShipToClassTemplates:function(t){var s=0,o=0,i=new p;i.reset(t),this.shipToClassTemplateCollection||(this.shipToClassTemplateCollection=new p),this.shipToClassTemplateCollection.reset(t),e("#cmb-shipto-classtemplate").html(""),i.each(function(t){var i=t.get("ClassDescription"),a=t.get("ClassCode");t.get("IsDefault")&&(o=s),s++,e("#cmb-shipto-classtemplate").append(new Option(a+" | "+i,a))}),e("#cmb-shipto-classtemplate").prop("selectedIndex",o),e("#cmb-shipto-classtemplate").trigger("change")},ChangeClassCode:function(e){if(e&&""!=e){var t=new n({StringValue:e}),s=this;t.url=i.ServiceUrl+a.CUSTOMER+"getcustomerclasstemplatebycountry/",t.save(t,{success:function(t,o){if(i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.get("ClassTemplates")&&0!=t.get("ClassTemplates").length){var a=t.get("ClassTemplates");s.RetailClass=new n,s.WholesaleClass=new n;for(var l=0;l<a.length;l++)"Wholesale"==a[l].BusinessType&&(s.WholesaleClass=new n(a[l]),s.WholesaleClass.set({ClassDescription:"Wholesale"}),s.paymentTermCode=a[l].PaymentTermCode,s.paymentTermGroup=a[l].PaymentTermGroup),"Retail"==a[l].BusinessType&&(s.RetailClass=new n(a[l]),s.RetailClass.set({ClassDescription:"Retail"}),i.DefaultClassCode=a[l].ClassCode,s.classCode=a[l].ClassCode,s.classTemplate=a[l].ClassCode,s.paymentTerm=a[l].PaymentTermCode,s.paymentTermGroup=a[l].PaymentTermGroup,s.paymentTermCode=a[l].PaymentTermCode,s.taxCode=a[l].TaxCode);s.ClassCodeCompleted(),i._UserIsCS&&s.formType===f.EditCustomer.FormTitle||s.FetchClassCodes(e)}},error:function(e,t,s){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()}})}},ClassCodeCompleted:function(){e("#cmb-customer-customertype").trigger("change")},FetchPaymentTerms:function(e,t){var s=new n;s.on("sync",this.FetchSuccess,this),s.on("error",this.FetchFailed,this),s.url=i.ServiceUrl+a.CUSTOMER+l.PAYMENTTERMLOOKUP+100,s.set({PaymentTermGroup:e,StringValue:t}),s.save()},FetchSuccess:function(e,t){return i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.IsNullOrWhiteSpace(t.ErrorMessage)?void this.ResetPaymentTerms(t):void navigator.notification.alert(t.ErrorMessage,null,"Error","OK")},FetchFailed:function(e,t,s){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),model.RequestError(e,"Error Fetching Payment Terms ")},ResetPaymentTerms:function(t){this.paymentTermCollection||(this.paymentTermCollection=new T),this.paymentTermCollection.reset(t.SystemPaymentTerms),0!==this.paymentTermCollection.length&&(e('#customer-PaymentTerm > option[val !=""]').remove(),this.paymentTermCollection.each(this.FillPaymentTermComboBox,this),e("#customer-PaymentTerm").val(this.paymentTermCode).change(),self.formType===f.EditCustomer.FormTitle&&this.trigger("formLoaded",this))},FillPaymentTermComboBox:function(t){var s=t.get("PaymentTermDescription"),o=t.get("PaymentTermCode");e("#customer-PaymentTerm").append(new Option(s,o))},PaymentTermChanged:function(t){var s=t.target.id,o=e("#"+s).val();this.paymentTerm=o,this.paymentTermCode=o},IsNullOrWhiteSpace:function(e){return!e||null===e||""===e.trim()},AddCustomer:function(e){var t=this;switch(this.options.FormType){case f.NewCustomer.FormTitle:var s=i.ServiceUrl+a.CUSTOMER+l.CREATECUSTOMER;break;case f.EditCustomer.FormTitle:var s=i.ServiceUrl+a.CUSTOMER+l.UPDATECUSTOMER}this.postalmodel.url=s,this.postalmodel.set(e),this.postalmodel.save(null,{success:function(e,s){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.DisplayResult(s)},error:function(e,t,s){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Creating Customer")}})},buttonCancelOnTap:function(e){e.preventDefault(),this.HideCustomerForm()},IsViewOnLoad:function(){return!r.IsNullOrWhiteSpace(this.onLoad)&&(r.IsNullOrWhiteSpace(this.city)||"Please enter city"==this.city||(e('#customer-City > option[val !=""]').remove(),e("#customer-City").append(new Option(this.city,this.city)),e("#customer-City").prop("selectedIndex",0),e("#customer-City").trigger("change")),r.IsNullOrWhiteSpace(this.state)||"Please enter state code"==this.state||e("#customer-State").val(this.state),console.log("CITY : "+this.city+" , STATE :"+this.state),this.onLoad=!1,!0)},buttonLoadOnFocus:function(){this.IsViewOnLoad()||this.postal!==e("#customer-PostalCode").val()&&(this.ResetVariable(),this.postal=e("#customer-PostalCode").val(),this.LoadPostal(this.postal,this.city))},buttonLoadOnTap:function(t){if(13===t.keyCode){if(this.postal===e("#customer-PostalCode").val())return;this.ResetVariable(),this.postal=e("#customer-PostalCode").val(),this.LoadPostal(this.postal)}},buttonSaveOnTap:function(e){e.stopPropagation(),this.ResetVariable(),this.ValidateFields()},ClearFields:function(){e("#customer-PostalCode").val(""),e("#customer-name").val(""),e("#customer-Address").val(""),e("#customer-State").val(""),e("#customer-Phone").val(""),e("#customer-Email").val(""),e("#customer-Site").val(""),this.ClearCity()},GetCity:function(t){this.ResetVariable(),this.postal=e("#customer-PostalCode").val();var s=t.get("City");this.LoadPostal(this.postal,s)},EditCustomer:function(t){if(!i.EditCustomerLoaded){i.EditCustomerLoaded=!0;this.ClearCity(),this.GetCity(t),r.IsNullOrWhiteSpace(t.get("TrackLoyaltyPoints"))?(P=!0,this.LoyaltyPointsCheck_Changed()):(P=!1,this.LoyaltyPointsCheck_Changed()),e("#customer-name").val(t.get("CustomerName")),e("#customer-Address").val(t.get("Address")),e("#customer-Phone").val(t.get("Telephone")),e("#customer-Email").val(t.get("Email")),e("#customer-Site").val(t.get("Website")),this.customerCode=t.get("CustomerCode"),this.countrySelected=t.get("Country"),this.classCode=t.get("ClassCode"),this.paymentTerm=t.get("PaymentTerm"),this.taxCode=t.get("TaxCode"),this.postalCode=t.get("PostalCode"),this.city=t.get("City"),this.state=t.get("State"),this.county=t.get("County"),this.businessType=t.get("BusinessType"),e("#cmb-customer-customertype").html("<option selected>"+this.businessType+"</option>"),e("#cmb-customer-customertype").selectmenu("refresh"),e("#cmb-customer-customertype").addClass("ui-disabled"),this.SetSelectedCountry(),this.originalModel=new n,this.originalModel.set(t.attributes),e("#customer-PostalCode").val(this.postalCode).blur()}},DisplayResult:function(e){if(e.ErrorMessage){console.log(e.ErrorMessage);var t;e.ErrorMessage.indexOf("Invalid E-mail address")!==-1&&(t="Invalid E-mail Address"),t||e.ErrorMessage.indexOf("Invalid URL")===-1||(t="Invalid URL"),t||(t=e.ErrorMessage),navigator.notification.alert(t,null,"Error Saving","OK"),this.HideActivityIndicator()}else{var s=new C;s.add(e),this.options.FormType==f.NewCustomer.FormTitle?this.trigger("createdCustomer",s.at(0),f.NewCustomer.FormTitle):this.trigger("updatedCustomer",s.at(0),f.EditCustomer.FormTitle),i.CurrentCustomer=e,i.ShipTo.ShipToCode=e.ShipToCode,this.HideActivityIndicator(),this.HideCustomerForm()}},ProcessResult:function(){i.CurrentCustomer=model,null===model.ShipToName&&null===model.ShipToAddress?this.SetCustomerName(model.CustomerName,model.CustomerCode,model.DefaultShipToName,model.Address):this.SetCustomerName(model.CustomerName,model.CustomerCode,model.ShipToName,model.ShipToAddress),i.ShipTo.ShipToCode=model.ShipToCode,this.HideActivityIndicator(),this.HideCustomerForm()},HideCustomerForm:function(){P=!1,r.FocusToItemScan(),this.remove(),this.unbind(),this.ClearFields(),this.HideActivityIndicator(),e("#main-transaction-blockoverlay").hide()},LoadRetrievedPostal:function(){this.postalCollection.each(this.SetFields,this)},LoadPostal:function(t,s){if(""==t)this.ClearCity();else{var o=this;r.LoadPostalByCode(t,function(e){o.postalCollection.reset(e),o.DisplayResultOnPostal(t,s);var i=o.IsPrioritizeFromPostalCode(o.countryCollection,o.countrySelected);switch(i){case!0:o.LoadClasscodeFromPostal()}},function(t){o.postalCollection.reset(),o.postalCollection.RequestError(t,"Error Loading Postal Code"),e("#customer-PostalCode").val("")})}},LoadClasscodeFromPostal:function(){var t=this.postalCollection.at(0);if(!r.IsNullOrWhiteSpace(this.postalCollection)&&this.postalCollection.length>0){var t=this.postalCollection.at(0),s=t.get("DefaultRetailCustomerBillToClassTemplate"),o=t.get("DefaultRetailCustomerShipToClassTemplate"),i=t.get("DefaultWholesaleCustomerBillToClassTemplate"),a=t.get("DefaultWholesaleCustomerShipToClassTemplate");!r.IsNullOrWhiteSpace(s)&&!r.IsNullOrWhiteSpace(o)||!r.IsNullOrWhiteSpace(i)&&!r.IsNullOrWhiteSpace(a)?"Retail"===this.priorityPostalType?(e("#cmb-customer-classtemplate option[value='"+s+"']").attr("selected","selected"),e("#cmb-shipto-classtemplate option[value='"+o+"']").attr("selected","selected"),this.SelectedClassCode=s,this.SelectedShipToClassCode=o):(e("#cmb-customer-classtemplate option[value='"+i+"']").attr("selected","selected"),e("#cmb-shipto-classtemplate option[value='"+a+"']").attr("selected","selected"),this.SelectedClassCode=i,this.SelectedShipToClassCode=a):(e("#cmb-customer-classtemplate option[value='"+this.classCode+"']").attr("selected","selected"),e("#cmb-shipto-classtemplate option[value='"+this.shipToClassCode+"']").attr("selected","selected"))}e("#cmb-customer-classtemplate").selectmenu("refresh"),e("#cmb-shipto-classtemplate").selectmenu("refresh")},LoadCustomerSchema:function(){var e=this;this.customerschema.fetch({success:function(t,s,o){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.SetCustomerSchema(s)}})},ResetVariable:function(){this.postal="",this.customerName="",this.address="",this.phone="",this.email="",this.website="",this.country=""},SetCustomerSchema:function(e){this.formType==f.NewCustomer.FormTitle&&(this.businessType=e.BusinessType,this.classCode=e.ClassCode,this.classTemplate=e.ClassCode,this.paymentTerm=e.PaymentTermCode,this.taxCode=e.TaxCode,this.countrySelected=e.Country,this.SetSelectedCountry()),this.formType==f.NewCustomer.FormTitle&&this.FetchTaxSchemes()},FetchTaxSchemes:function(){var e=new n;e.on("sync",this.FetchTaxSchemeSuccess,this),e.on("error",this.FetchTaxSchemeFailed,this),e.url=i.ServiceUrl+a.CUSTOMER+l.TAXSCHEMELOOKUP+100+"/"+i.Preference.CompanyCountry,e.set({StringValue:""}),e.save()},FetchTaxSchemeSuccess:function(e,t){return i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.IsNullOrWhiteSpace(t.ErrorMessage)?(this.ResetTaxSchemes(t.SystemTaxSchemes),void this.EnableDisableClassTemplates()):void navigator.notification.alert("Fetching Tax Response : "+t.ErrorMessage,null,"Error","OK")},FetchTaxSchemeFailed:function(e,t,s){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),model.RequestError(e,"Error Fetching Tax Schemes ")},ResetTaxSchemes:function(t){e('#customer-TaxCode > option[val !=""]').remove(),this.taxSchemeCollection=new T,this.taxSchemeCollection.reset(t),this.taxSchemeCollection.each(this.FillTaxCombobox,this),this.SetSelectedTaxCode()},FillTaxCombobox:function(t){var s=t.get("TaxDescription"),o=t.get("TaxDescription");e("#customer-TaxCode").append(new Option(s,o))},TaxCodeChanged:function(t){var s=t.target.id,o=e("#"+s).val();this.taxCode=o},SetSelectedTaxCode:function(t){t?e("#customer-TaxCode").val(t).change():e("#customer-TaxCode").val(this.taxCode).change()},EnableDisableClassTemplates:function(){i.Preference.AllowChangeClassTemplate&&void 0!==i.Preference.AllowChangeClassTemplate&&null!==i.Preference.AllowChangeClassTemplate?(e("#cmb-customer-classtemplate").removeAttr("disabled"),e("#cmb-shipto-classtemplate").removeAttr("disabled"),e("#customer-ClassTemplate-container .ui-icon-arrow-d").removeClass("ui-disabled"),e("#shipto-ClassTemplate-container .ui-icon-arrow-d").removeClass("ui-disabled")):(e("#customer-ClassTemplate-container .ui-icon-arrow-d").addClass("ui-disabled"),e("#shipto-ClassTemplate-container .ui-icon-arrow-d").addClass("ui-disabled"),e("#cmb-shipto-classtemplate").attr("disabled","disabled"),e("#cmb-customer-classtemplate").attr("disabled","disabled"))},SetCustomerDetails:function(){this.postal=e("#customer-PostalCode").val(),this.customerName=e("#customer-name").val(),this.address=e("#customer-Address").val(),this.city=e("#customer-City").val(),this.state=e("#customer-State").val(),this.country=e("#customer-country").val(),this.phone=e("#customer-Phone").val(),this.email=e("#customer-Email").val(),this.website=e("#customer-Site").val(),this.selectedClassCode=e("#cmb-customer-classtemplate").val(),this.selectedShipToClassCode=e("#cmb-shipto-classtemplate").val();var t=new n;t.set({CustomerCode:this.customerCode,CustomerName:this.customerName,Country:this.country,Address:this.address,City:this.city,State:this.state,County:this.county,PostalCode:this.postal,Telephone:this.phone,Website:this.website,PaymentTerm:this.paymentTerm,PaymentTermCode:this.paymentTerm,Email:this.email,DefaultClassTemplate:this.classTemplate,BusinessType:this.businessType,TaxCode:this.taxCode,TrackLoyaltyPoints:P,AssignedTo:i.Username,ClassCode:this.selectedClassCode?this.selectedClassCode:this.classCode,ShipToClassCode:this.selectedShipToClassCode?this.selectedShipToClassCode:this.shipToClassCode}),this.options.FormType!=f.NewCustomer.FormTitle&&t.set({ClassCode:this.classCode,ShipToClassCode:this.shipToClassCode}),this.AddCustomer(t)},ClearCity:function(){e('#customer-City > option[val !=""]').remove(),e("#customer-City").append(new Option("City...","")),e("#customer-City").prop("selectedIndex",0),e("#customer-City").trigger("change"),e("#customer-State").val("")},SetState:function(){this.county="";var t=e("#customer-City option:selected").val();if(null!=this.state&&void 0!=this.state&&""!=this.state)return e("#customer-State").val(this.state),this.state="",void(this.city="");if(""!=t){var s=this.postalCollection.find(function(e){return t=e.get("City")});r.IsNullOrWhiteSpace(s.get("County"))||(this.county=s.get("County"));var o=s.get("StateCode");e("#customer-State").val(o)}else e("#customer-State").val("")},SetFields:function(t){var s=t.get("City");e("#customer-City").append(new Option(s,s))},SetCustomerName:function(t,s,o,a){e("#label-customername").html(r.TrimCustomerName()),e("#lbl-customerName").html(r.TrimCustomerName()),i.DefaultShipTo=o+",",i.DefaultShipToAddress=a,e("#label-shipto i").html(r.TrimDefaultShipTo()),e("#label-shipto i").append("<br/>"+r.Escapedhtml(i.DefaultShipToAddress))},Show:function(){e("#customerForm").show(),this.InitializeThings(),e("#customerForm").trigger("create")},ShowSpinner:function(){e("#spin").remove(),e("#main-transaction-blockoverlay").addClass("z3000"),target=document.getElementById("customerForm"),this.ShowActivityIndicator(target),e("<h5>Saving...</h5>").appendTo(e("#spin"))},ShowActivityIndicator:function(t){e("<div id='spin'></div>").appendTo(t);var s=document.getElementById("spin");_spinner=v,_spinner.opts.color="#fff",_spinner.opts.lines=13,_spinner.opts.length=7,_spinner.opts.width=4,_spinner.opts.radius=10,_spinner.opts.top="auto",_spinner.opts.left="auto",_spinner.spin(s)},HideActivityIndicator:function(){e("#main-transaction-blockoverlay").removeClass("z3000"),_spinner=v,_spinner.stop(),e("#spin").remove()},ValidateFields:function(){var t=e("#customer-PostalCode").val(),s=e("#customer-name").val(),o=e("#customer-Email").val(),i=e("#customer-Site").val(),a="DefaultPOSShopper"===this.customerCode||"DefaultECommerceShopper"===this.customerCode;""!==t||a?""===s?navigator.notification.alert("Please enter a Customer Name.",null,"Customer Name is Required","OK"):null!=o&&""!=o&&r.ValidateEmailFormat(o)&&!a?navigator.notification.alert("Email format is invalid.",null,"Invalid Email","OK"):r.ValidateUrlFormat(i,!0)&&!a?navigator.notification.alert("Url format is invalid.",null,"Invalid Url","OK"):(this.ShowSpinner(),this.SetCustomerDetails()):navigator.notification.alert("Please input a valid Zip Code.",null,"Zip Code is Required","OK")},IsCheckEmail:function(e){return this.formType!=f.EditCustomer.FormTitle||(!this.originalModel||!!(this.originalModel.get("Email")&&""!=this.originalModel.get("Email")||e&&""!=e)&&this.originalModel.get("Email")!=e)},AssignNumericValidation:function(e){r.Input.NonNegativeInteger("#"+e.target.id)}});return E});