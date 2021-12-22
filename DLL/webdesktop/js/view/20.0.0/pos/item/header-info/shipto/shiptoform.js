define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","shared/enum","model/base","model/postal","model/country","model/customerschema","model/lookupcriteria","collection/postal","collection/countries","collection/classtemplates","collection/base","text!template/20.0.0/pos/item/header-info/shipto/shiptoform.tpl.html","view/spinner","view/20.0.0/pos/postal/addpostal"],function(t,e,o,i,s,a,n,l,r,h,c,d,p,C,u,m,T,y,v,S,g){var f,w={NewShipTo:{FormTitle:"New Ship To",AttribName:"Ship To Name"},EditShipTo:{FormTitle:"Edit Ship To",AttribName:"Ship To Name"}},P=function(t){1==t?f.AddNewPostal():f.ClearPostalDetails()},b="",I=!1,E="#shipto-IsDefaultshipto",F=i.View.extend({_template:o.template(v),classCode:"",classTemplate:"",paymentTerm:"",paymentTermCode:"",taxCode:"",postal:"",name:"",address:"",country:"",city:"",state:"",phone:"",email:"",website:"",formType:"",county:"",events:{"keyup #shipto-PostalCode":"buttonLoadOnTap","blur #shipto-PostalCode":"buttonLoadOnBlur","focus #shipto-PostalCode":"buttonLoadOnFocus","tap #shipto-save-btn":"buttonSaveOnTap","tap #shipto-cancel-btn":"buttonCancelOnTap","change #shipto-City":"SetState","change #shipto-country":"CountryChanged","change #cmb-shipto-classtemplate":"ClassTemplateChanged","change #shipto-PaymentTerm":"PaymentTermChanged","focus #shipto-Phone":"AssignNumericValidation","change #shipto-TaxCode":"TaxCodeChanged","tap #shipto-IsDefaultshipto":"IsDefaultShipToChecked"},buttonCancelOnTap:function(t){t.preventDefault(),this.CloseForm()},IsViewOnLoad:function(){return!l.IsNullOrWhiteSpace(this.onLoad)&&(l.IsNullOrWhiteSpace(this.city)||"Please enter city"==this.city||(t('#shipto-City > option[val !=""]').remove(),t("#shipto-City").append(new Option(this.city,this.city)),t("#shipto-City").prop("selectedIndex",0),t("#shipto-City").trigger("change")),l.IsNullOrWhiteSpace(this.state)||"Please enter state code"==this.state||t("#shipto-State").val(this.state),console.log("CITY : "+this.city+" , STATE :"+this.state),this.onLoad=!1,!0)},buttonLoadOnBlur:function(){this.IsViewOnLoad()||this.postal!==t("#shipto-PostalCode").val()&&(this.ResetVariable(),this.postal=t("#shipto-PostalCode").val(),this.LoadPostal(this.postal,this.city))},buttonLoadOnFocus:function(t){this.state="",this.city=""},buttonSaveOnTap:function(t){t.stopPropagation(),this.AllowToChangeShipto()&&(this.ResetVariable(),this.ValidateFields())},ClearFields:function(){t("#shipto-PostalCode").val(""),t("#shipto-name").val(""),t("#shipto-Address").val(""),t("#shipto-State").val(""),t("#shipto-Phone").val(""),t("#shipto-Email").val(""),t("#shipto-Site").val(""),this.ClearCity()},IsDefaultShipToChecked:function(){I=l.CustomCheckBoxChange(E,I)},initialize:function(){this.formType=this.options.FormType,this.render(this.formType),f=this},render:function(e){switch(I=!1,this.InitializeThings(),e){case w.NewShipTo.FormTitle:this.$el.append(this._template({FormTitle:w.NewShipTo.FormTitle,Name:w.NewShipTo.AttribName})),t("#shiptoForm").trigger("create"),t("#shiptoForm").css("top","40%"),this.onLoad=!1;break;case w.EditShipTo.FormTitle:this.$el.append(this._template({FormTitle:w.EditShipTo.FormTitle,Name:w.EditShipTo.AttribName})),t("#shiptoForm").trigger("create"),t("#shiptoForm").css("top","42%"),this.onLoad=!0}s.Preference.AllowChangePaymentTerm||(t("#shipto-PaymentTerm").attr("disabled","true"),t(".shipto-PaymentTerm-container .ui-icon-arrow-d").addClass("ui-disabled")),s.Preference.AllowChangeTaxCode||(t("#shipto-TaxCode").attr("disabled","true"),t(".shipto-TaxCode-container .ui-icon-arrow-d").addClass("ui-disabled")),s.Preference.AllowChangeClassTemplate||(t("#cmb-shipto-classtemplate").attr("disabled","true"),t(".shipto2-ClassTemplate-container .ui-icon-arrow-d").addClass("ui-disabled")),this.EnableSaveButton()},EnableSaveButton:function(e){e?(t("#shipto-save-btn").removeClass("ui-disabled"),t("#shipto-save-btn").removeAttr("disabled","true")):(t("#shipto-save-btn").addClass("ui-disabled"),t("#shipto-save-btn").attr("disabled","true"))},InitializeThings:function(){var t=this,e=function(){t.InitializePostalModel(),t.InitializePostal(),t.InitializeCountryModel(),t.InitializeCountry(),t.ispostalTriggered=!1,t.InitializeCustomerSchemaModel()};if(s.CurrentCustomer.Country)return void e();var o=new h;o.url=s.ServiceUrl+a.CUSTOMER+"loadcustomerbycode/"+s.CurrentCustomer.CustomerCode,o.fetch({success:function(t,o){o.Customers&&o.Customers.length>0&&(s.CurrentCustomer.Country=o.Customers[0].Country),e()},error:function(t,o,i){e()}})},InitializeCountryModel:function(){_rows=1e3,this.countryModel=new d,this.countryModel.url=s.ServiceUrl+a.CUSTOMER+n.COUNTRYCODELOOKUP+_rows},InitializeCountry:function(){this.countryCollection=new m,this.LoadCountries()},CheckProductEdition:function(){s._UserIsCS&&l.ShowHideClassTemplates("shipto-ClassTemplate-container"),this.formType===w.EditShipTo.FormTitle&&l.ShowHideClassTemplates("shipto-ClassTemplate-container")},LoadCountries:function(){var t=this;this.index=0,this.countryModel.set({Criteria:""}),this.countryModel.save(null,{success:function(e,o){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.countryCollection.reset(o.Countries),t.DisplayCountries(),t.EnableSaveButton(!0)},error:function(e,o,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(o,"Error Loading Countries"),t.EnableSaveButton(!0)}})},DisplayCountries:function(){this.defaultCountry="United States of America",0===this.countryCollection.length?(console.log("no countries available."),navigator.notification.alert("No country available.",null,"No Country Found","OK")):(t('#shipto-country > option[val !=""]').remove(),this.LoadRetrievedCountry(),this.formType==w.NewShipTo.FormTitle?(this.SetSelectedCountry(),this.GetCountryByCustomer()?t("#shipto-country").val(this.GetCountryByCustomer()).change():t("#shipto-country").val(this.defaultCountry).change()):this.FetchTaxSchemes())},LoadRetrievedCountry:function(){this.countryCollection.each(this.SetCountryOptions,this)},SetCountryOptions:function(e){var o=e.get("CountryCode");t("#shipto-country").append(new Option(o,o))},GetCountryByCustomer:function(){if(s.CurrentCustomer&&s.CurrentCustomer.Country&&""!=s.CurrentCustomer.Country)return s.CurrentCustomer.Country},SetSelectedCountry:function(){this.countryCollection&&0!=this.countryCollection.length&&(t("#shipto-country option:selected").removeAttr("selected"),t("#shipto-country > option[value='"+this.countrySelected+"']").attr("selected","selected"),t("#shipto-country").trigger("change"),t("#shipto-name").focus())},ClearPostalInfo:function(){t("#shipto-PostalCode").val(""),t("#shipto-State").val(""),this.ClearCity(),this.postal=t("#shipto-PostalCode").val("")},RemoveInvalidPostals:function(t){var e=t.get("CountryCode");console.log("RemoveInvalidPostals: "+this.countrySelected),e===this.countrySelected&&this.newCollection.add(t)},AddNewPostal:function(){var e=t("#shipto-PostalCode").val(),o=t("#addPostalCodeContainer");t(o).html("<div id='addPostalContainer' style='display: none'></div>");var i=t("#addPostalContainer");l.IsNullOrWhiteSpace(this.newPostalView)?this.newPostalView=new g({el:i}):(this.newPostalView.remove(),this.newPostalView=new g({el:i})),this.newPostalView.on("AcceptPostal",this.AcceptPostal,this),this.newPostalView.on("ClearPostal",this.ClearPostalDetails,this),this.newPostalView.Show(e,this.countrySelected,this.countryCollection)},AcceptPostal:function(e){this.countrySelected=e.CountryCode,this.SetSelectedCountry(),t("#shipto-PostalCode").val(e.PostalCode),t("#shipto-State").val(e.StateCode),this.postal=e.PostalCode,this.city=e.City,this.LoadPostal(this.postal,this.city)},ClearPostalDetails:function(){t("#shipto-PostalCode").val(""),this.postal="",this.ClearCity()},DisplayResultOnPostal:function(e,o){this.newCollection=new u,this.postalCollection.each(this.RemoveInvalidPostals,this),this.postalCollection=this.newCollection,0===this.postalCollection.length?navigator.notification.confirm("The Postal Code '"+e+"' does not exist in the Country selected. Do you want to add '"+e+"' ?",P,"Postal Not Found",["Yes","No"]):(t('#shipto-City > option[val !=""]').remove(),this.LoadRetrievedPostal(),""==o?t("#shipto-City").prop("selectedIndex",0):t("#shipto-City option[value='"+o+"']").attr("selected","selected"),t("#shipto-City").trigger("change"))},CountryChanged:function(e){var o=e.target.id,i=t("#"+o).val(),s=t("#shipto-PostalCode").val();this.countrySelected!=i&&s.length>0&&this.ClearPostalInfo(),this.countrySelected=i,this.formType==w.NewShipTo.FormTitle&&this.ChangeClassCode(i),this.PreviousCountrySelected=i},FetchClassCodes:function(t){if(t&&""!=t){var e=this,o=new C;o.url=s.ServiceUrl+a.CUSTOMER+n.CLASSTEMPLATELOOKUP+100+"/true",o.set({StringValue:t}),o.save(null,{success:function(t,o){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.ResetClassTemplates(o.ClassTemplates)},error:function(t,o,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.RequestError(o,"Error Fetching Class Template List"),e.SetDefaultClassCode()}})}},ResetClassTemplates:function(e){this.classTemplateCollection||(this.classTemplateCollection=new T),this.classIndex=0,this.classTemplateCollection.reset(e),0!==this.classTemplateCollection.length&&(t('#cmb-shipto-classtemplate > option[val !=""]').remove(),this.classTemplateCollection.each(this.FillClassTemplateComboBox,this),s.Preference.AllowChangeClassTemplate&&void 0!==s.Preference.AllowChangeClassTemplate&&null!==s.Preference.AllowChangeClassTemplate?t("#cmb-shipto-classtemplate").removeClass("ui-disabled"):t("#cmb-shipto-classtemplate").addClass("ui-disabled"))},FillClassTemplateComboBox:function(e){var o=e.get("ClassDescription"),i=e.get("ClassCode");t("#cmb-shipto-classtemplate").append(new Option(i+" | "+o,i)),i===s.DefaultClassCode&&(t("#cmb-shipto-classtemplate").prop("selectedIndex",this.classIndex),this.selectedClassCode=i,t("#cmb-shipto-classtemplate").trigger("change")),this.classIndex++},ClassTemplateChanged:function(e){var o=e.target.id,i=t("#"+o).val();this.SelectedClassCode!==i&&(this.SelectedClassCode=i,void 0!==this.classTemplateCollection&&0!==this.classTemplateCollection.length&&this.classTemplateCollection.each(this.FindCTemplate,this))},FindCTemplate:function(t,e){if(t.get("ClassCode")===this.SelectedClassCode){this.classCode=t.get("ClassCode"),this.classTemplate=t.get("ClassCode"),this.paymentTerm=t.get("PaymentTermCode"),this.paymentTermCode=t.get("PaymentTermCode"),this.taxCode=t.get("TaxCode"),this.SetSelectedTaxCode();var o=t.get("PaymentTermGroup");this.FetchPaymentTerms(o,"")}},SetDefaultClassCode:function(){t('#cmb-shipto-classtemplate > option[val !=""]').remove(),t("#cmb-shipto-classtemplate").append(new Option(this.classCode,this.classCode)),t("#cmb-shipto-classtemplate").prop("selectedIndex",0),t("#cmb-shipto-classtemplate").trigger("change")},FetchPaymentTerms:function(t,e){if(!this.IsNullOrWhiteSpace(t)){var o=new h;o.on("sync",this.FetchSuccess,this),o.on("error",this.FetchFailed,this),o.url=s.ServiceUrl+a.CUSTOMER+n.PAYMENTTERMLOOKUP+100,o.set({PaymentTermGroup:t,StringValue:e}),o.save()}},FetchSuccess:function(t,e){return s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.IsNullOrWhiteSpace(e.ErrorMessage)?void this.ResetPaymentTerms(e):void navigator.notification.alert(e.ErrorMessage,null,"Error","OK")},FetchFailed:function(t,e,o){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),model.RequestError(t,"Error Fetching Payment Terms ")},ResetPaymentTerms:function(e){this.paymentTermCollection||(this.paymentTermCollection=new y),this.paymentTermCollection.reset(e.SystemPaymentTerms),0!==this.paymentTermCollection.length&&(t('#shipto-PaymentTerm > option[val !=""]').remove(),this.paymentTermCollection.each(this.FillPaymentTermComboBox,this),t("#shipto-PaymentTerm").val(this.paymentTermCode).change())},FillPaymentTermComboBox:function(e){var o=e.get("PaymentTermDescription"),i=e.get("PaymentTermCode");t("#shipto-PaymentTerm").append(new Option(o,i))},PaymentTermChanged:function(e){var o=e.target.id,i=t("#"+o).val();this.paymentTerm=i,this.paymentTermCode=i},IsNullOrWhiteSpace:function(t){return!t||null===t||""===t.trim()},ChangeClassCode:function(t){if(t&&""!=t){tmp=new h;var e=this;tmp.url=s.ServiceUrl+a.CUSTOMER+n.GETCLASSTEMPLATEBYCOUNTRY+t+"/true",tmp.save(null,{success:function(o,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),o.get("ClassCode")&&""!=o.get("ClassCode")&&(s.DefaultClassCode=o.get("ClassCode"),console.log(s.DefaultClassCode),e.formType==w.NewShipTo.FormTitle&&(e.classCode=o.get("ClassCode"),e.classTemplate=o.get("ClassCode"),e.paymentTerm=o.get("PaymentTermCode"),e.paymentTermCode=o.get("PaymentTermCode"),e.taxCode=o.get("TaxCode")),e.FetchClassCodes(t))},error:function(t,e,o){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()}})}},LoadPostal:function(e,o){if(b=s.CustomerPreference.DefaultBusinessType,""==e)this.ClearCity();else{var i=this;l.LoadPostalByCode(e,function(t){i.postalCollection.reset(t),i.DisplayResultOnPostal(e,o)},function(e){i.postalCollection.reset(),i.postalCollection.RequestError(e,"Error Loading Postal Code"),t("#shipto-PostalCode").val("")})}},SetState:function(){var e=t("#shipto-City option:selected").val();if(this.country="",null!=this.state&&void 0!=this.state&&""!=this.state)return t("#shipto-State").val(this.state),this.state="",void(this.city="");if(""!=e){var o=this.postalCollection.find(function(t){return e=t.get("City")});if(null==o)return;l.IsNullOrWhiteSpace(o.get("County"))||(this.county=o.get("County"));var i=o.get("StateCode"),r=o.get("CountryCode"),c=o.get("PostalCode");t("#shipto-State").val(i);var d=new h,p=this;d.url=s.ServiceUrl+a.CUSTOMER+n.GETSHIPTOCLASSTEMPLATE+r+"/"+e+"/"+c+"/"+b,d.save(null,{success:function(e,o){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.get("ClassCode")&&""!=e.get("ClassCode")&&(s.DefaultClassCode=e.get("ClassCode"),console.log(s.DefaultClassCode),p.formType==w.NewShipTo.FormTitle&&(p.classCode=e.get("ClassCode"),p.classTemplate=e.get("ClassCode"),p.paymentTerm=e.get("PaymentTermCode"),p.paymentTermCode=e.get("PaymentTermCode"),p.taxCode=e.get("TaxCode"),t("#cmb-shipto-classtemplate").val(p.classTemplate)),p.FetchClassCodes(r))},error:function(t,e,o){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()}})}else t("#shipto-State").val("")},SetFields:function(e){var o=e.get("City");t("#shipto-City").append(new Option(o,o))},buttonLoadOnTap:function(e){13===e.keyCode&&(this.ResetVariable(),this.postal=t("#shipto-PostalCode").val(),this.LoadPostal(this.postal))},InitializePostalModel:function(){this.postalmodel=new c,this.postalmodel.on("remove",this.remove)},InitializePostal:function(){this.postalCollection=new u},InitializeCustomerSchemaModel:function(){this.shiptoschema=new p,this.shiptoschema.url=s.ServiceUrl+a.CUSTOMER+n.GETNEWSHIPTOSCHEMA,this.LoadCustomerSchema()},LoadCustomerSchema:function(){var t=this;this.shiptoschema.fetch({success:function(e,o){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.SetCustomerSchema(o)}})},LoadRetrievedPostal:function(){this.postalCollection.each(this.SetFields,this)},ClearCity:function(){t('#shipto-City > option[val !=""]').remove(),t("#shipto-City").append(new Option("City...","")),t("#shipto-City").prop("selectedIndex",0),t("#shipto-City").trigger("change")},SetCustomerSchema:function(t){this.classTemplate=t.ClassCode,this.paymentTerm=t.PaymentTermCode,this.taxCode=t.TaxCode,this.classCode=t.ClassCode,this.paymentTermCode=t.PaymentTermCode,this.formType==w.NewShipTo.FormTitle&&(this.GetCountryByCustomer()?this.GetCountryByCustomer()===t.Country&&(this.countrySelected=this.GetCountryByCustomer()):this.countrySelected=t.Country,this.SetSelectedCountry()),this.formType==w.NewShipTo.FormTitle&&this.FetchTaxSchemes()},FetchTaxSchemes:function(){var t=new h;t.on("sync",this.FetchTaxSchemeSuccess,this),t.on("error",this.FetchTaxSchemeFailed,this),t.url=s.ServiceUrl+a.CUSTOMER+n.TAXSCHEMELOOKUP+100+"/"+s.Preference.CompanyCountry,t.set({StringValue:""}),t.save()},FetchTaxSchemeSuccess:function(t,e){return s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.IsNullOrWhiteSpace(e.ErrorMessage)?void this.ResetTaxSchemes(e.SystemTaxSchemes):void navigator.notification.alert("Fetching Tax Response : "+e.ErrorMessage,null,"Error","OK")},FetchTaxSchemeFailed:function(t,e,o){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),navigator.notification.alert(t,"Error Fetching Tax Schemes")},ResetTaxSchemes:function(e){t('#shipto-TaxCode > option[val !=""]').remove(),this.taxSchemeCollection=new y,this.taxSchemeCollection.reset(e),this.taxSchemeCollection.each(this.FillTaxCombobox,this),this.formType==w.EditShipTo.FormTitle?s.EditShipToLoaded||this.trigger("formLoaded",this):this.SetSelectedTaxCode()},FillTaxCombobox:function(e){var o=e.get("TaxDescription"),i=e.get("TaxCode");t("#shipto-TaxCode").append(new Option(o,i))},TaxCodeChanged:function(e){var o=e.target.id,i=t("#"+o).val();this.taxCode=i},SetSelectedTaxCode:function(e){e?t("#shipto-TaxCode").val(e).change():t("#shipto-TaxCode").val(this.taxCode).change()},SetShipToDetails:function(){this.postal=t("#shipto-PostalCode").val(),this.customerName=t("#shipto-name").val(),this.address=t("#shipto-Address").val(),this.city=t("#shipto-City").val(),this.state=t("#shipto-State").val(),this.phone=t("#shipto-Phone").val(),this.email=t("#shipto-Email").val(),this.country=t("#shipto-country").val(),this.website=t("#shipto-Site").val(),this.taxCode=t("#shipto-TaxCode").val(),this.paymentTermCode=t("#shipto-PaymentTerm").val(),this.paymentTerm=this.paymentTermCode,this.isDefaultShipTo=I;var e={ShipToCode:this.shipToCode,ShipToName:this.customerName,CustomerCode:s.CustomerCode,Country:this.country,ClassCode:this.classCode,Address:this.address,City:this.city,County:this.county,State:this.state,PostalCode:this.postal,Telephone:this.phone,WebSite:this.website,PaymentTermCode:this.paymentTermCode,Email:this.email,TaxCode:this.taxCode,IsDefaultShipTo:this.isDefaultShipTo};console.log(JSON.stringify(e)),this.AddShipTo(e)},AddShipTo:function(t){var e=this;switch(this.options.FormType){case w.NewShipTo.FormTitle:var o=s.ServiceUrl+a.CUSTOMER+n.CREATESHIPTO;break;case w.EditShipTo.FormTitle:var o=s.ServiceUrl+a.CUSTOMER+n.UPDATESHIPTO}this.postalmodel.url=o,this.postalmodel.set(t),this.postalmodel.save(null,{success:function(t,o){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.DisplayResult(o)}})},GetCity:function(e){this.ResetVariable(),this.postal=t("#shipto-PostalCode").val();var o=e.get("City");this.LoadPostal(this.postal,o)},EditShipTo:function(e){s.EditShipToLoaded||(s.EditShipToLoaded=!0,this.ClearCity(),null!=s.DefaultClassCode&&void 0!=s.DefaultClassCode&&""!=s.DefaultClassCode||(s.DefaultClassCode=e.get("ClassCode")),this.GetCity(e),l.IsNullOrWhiteSpace(e.get("IsDefaultShipTo"))?(I=!0,this.IsDefaultShipToChecked()):(I=!1,this.IsDefaultShipToChecked()),t("#shipto-name").val(e.get("ShipToName")),t("#shipto-Address").val(e.get("Address")),t("#shipto-Phone").val(e.get("Telephone")),t("#shipto-Email").val(e.get("Email")),t("#shipto-Site").val(e.get("WebSite")),t("#shipto-IsDefaultShipTo").prop("checked",e.get("IsDefaultShipTo")).checkboxradio("refresh"),this.countrySelected=e.get("Country"),console.log("EditShipTo: "+this.countrySelected+"/n "+this.PreviousCountrySelected),this.paymentTermCode=e.get("PaymentTermCode"),this.paymentTerm=this.paymentTermCode,this.taxCode=e.get("TaxCode"),this.shipToCode=e.get("ShipToCode"),this.classCode=e.get("ClassCode"),this.originalPTCode=this.paymentTermCode,this.postalCode=e.get("PostalCode"),this.city=e.get("City"),this.state=e.get("State"),this.county=e.get("County"),this.SetSelectedCountry(),t("#shipto-PostalCode").val(this.postalCode).blur(),this.SetSelectedTaxCode(),this.FetchPaymentTerms(e.get("PaymentTermGroup")),this.FetchClassCodes(e.get("Country")))},DisplayResult:function(t){if(this.HideActivityIndicator(),t){if(t.ErrorMessage)return console.log(t.ErrorMessage),void navigator.notification.alert(t.ErrorMessage,null,"Error","OK");var e=new u;e.add(t),this.options.FormType==w.NewShipTo.FormTitle?this.trigger("createdShipTo",e.at(0)):this.trigger("updatedShipto",e.at(0)),this.CloseForm()}},Show:function(){t("#shiptoForm").show(),this.InitializeModel(),t("#shiptoForm").trigger("create")},CloseForm:function(){l.FocusToItemScan(),this.remove(),this.unbind(),this.ClearFields(),this.HideActivityIndicator(),t("#main-transaction-blockoverlay").hide()},ValidateFields:function(){var e=t("#shipto-PostalCode").val(),o=t("#shipto-name").val(),i=t("#shipto-Email").val(),s=t("#shipto-Site").val(),a="DefaultPOSShopperShipTo"===this.shipToCode||"SHIP-000001"===this.shipToCode;""===o?navigator.notification.alert("Please enter a Ship To Name.",null,"Ship To Name is Required","OK"):""!==e||a?null!=i&&""!=i&&this.ValidateEmailFormat(i)&&!a?navigator.notification.alert("Email format is invalid.",null,"Invalid Email","OK"):l.ValidateUrlFormat(s,!0)&&!a?navigator.notification.alert("Url format is invalid.",null,"Invalid Url","OK"):(this.ShowSpinner(),this.SetShipToDetails()):navigator.notification.alert("Please input a valid Zip Code.",null,"Zip Code is Required","OK")},AllowToChangeShipto:function(){var t;switch(s.TransactionType){case r.TransactionType.SalesPayment:break;case r.TransactionType.SalesRefund:break;case r.TransactionType.Recharge:break;default:return!0}return t="Your action is not allowed for '"+s.TransactionType+"'.",navigator.notification.alert(t,null,"Action Not Allowed","OK"),!1},ResetVariable:function(){this.postal="",this.name="",this.address="",this.country="",this.phone="",this.email="",this.website=""},ShowSpinner:function(){t("#spin").remove(),t("#main-transaction-blockoverlay").show(),target=document.getElementById("main-transaction-page"),this.ShowActivityIndicator(target),t("<h5>Saving...</h5>").appendTo(t("#spin"))},ShowActivityIndicator:function(e){t("<div id='spin'></div>").appendTo(e);var o=document.getElementById("spin");_spinner=S,_spinner.opts.color="#fff",_spinner.opts.lines=13,_spinner.opts.length=7,_spinner.opts.width=4,_spinner.opts.radius=10,_spinner.opts.top="auto",_spinner.opts.left="auto",_spinner.spin(o)},HideActivityIndicator:function(){_spinner=S,_spinner.stop(),t("#spin").remove()},ValidateEmailFormat:function(t){var e=/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;return t.search(e)==-1},AssignNumericValidation:function(t){var e="#"+t.target.id;l.Input.NonNegativeInteger(e)}});return F});