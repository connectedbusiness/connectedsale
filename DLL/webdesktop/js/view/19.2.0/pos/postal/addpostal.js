define(["backbone","shared/global","shared/service","shared/method","shared/shared","model/base","collection/base","view/spinner","text!template/19.2.0/pos/postal/addpostal.tpl.html"],function(e,t,s,l,o,a,i,n,r){var d="#txtAddPostal-ZipCode",u="#txtAddPostal-City",c="#txtAddPostal-State",C="#txtAddPostal-StateCode",p="#txtAddPostal-County",h="#popup-modalOverlay",f="#custome-add-postal-btn-add",v="#customer-addpostal-btn-cancel",m="#drpcountry",y={Retail:"Retail",WholeSale:"WholeSale"},g=e.View.extend({_template:_.template(r),events:{"tap #customer-addpostal-btn-cancel":"Cancel_Tap","tap #custome-add-postal-btn-add":"Save"},initialize:function(){this.render()},render:function(){return this.$el.html(this._template),this.$el.trigger("create"),this},Show:function(e,s,l,o){this.$el.show(),"Customers"==t.ApplicationType&&(h="#customers-page-blockoverlay"),"Products"==t.ApplicationType&&(h="#products-page-blockoverlay"),$(h).show(),$(d).val(e),$(u).focus(),this.originalCountryCode=s,this.countryCode=s,this.postalCode=e,this.LoadCountry(l,s)},LoadCountry:function(e,t){this.countryCollection=new i,this.countryCollection=e,$(m+' > option[val !=""]').remove(),this.countryCollection.each(function(e){var t=e.get("CountryCode");$(m).append(new Option(t,t))}),this.SetSelectedCountry(t);var s=this;$("#drpcountry").on("change",function(e){e.preventDefault(),s.CountryOnChange(e)})},SetSelectedCountry:function(e){$(m).val(e),$(m+" option:selected").removeAttr("selected"),$(m+" > option[value='"+e+"']").attr("selected","selected"),$(m).trigger("change"),this.countryCode=e,o.IsNullOrWhiteSpace(this.defaultClassTemplateCollection)&&(this.defaultClassTemplateCollection=new i),this.defaultClassTemplateCollection.reset(),this.CheckIfRequireClassTemplate(this.countryCode),this.isLoaded=!0},CountryOnChange:function(e){e.preventDefault(),o.IsNullOrWhiteSpace(this.defaultClassTemplateCollection)&&(this.defaultClassTemplateCollection=new i),this.defaultClassTemplateCollection.reset(),this.countryCode=$(m).val(),this.CheckIfRequireClassTemplate(this.countryCode);var t=this;o.LoadPostalByCode(this.postalCode,function(e){t.DisplayResultOnPostal(e)},function(e){})},DisplayResultOnPostal:function(e){var t=this,s=new i;s.reset(e);var l=s.find(function(e){return t.postalCode==e.get("PostalCode")&&t.countryCode==e.get("CountryCode")});s.length>0&&l&&(navigator.notification.alert("The Postal Code "+this.postalCode+" already exist in "+this.countryCode+" !",null,"Error","OK"),this.SetSelectedCountry(this.originalCountryCode)),console.log("COUNTRY CODE : "+this.countryCode)},Cancel_Tap:function(e){e.preventDefault(),this.trigger("ClearPostal"),this.Hide()},ToggleFields:function(e){e?($(d).addClass("ui-readonly"),$(u).addClass("ui-readonly"),$(p).addClass("ui-readonly"),$(c).addClass("ui-readonly"),$(C).addClass("ui-readonly"),$(f).addClass("ui-disabled"),$(v).addClass("ui-disabled")):($(d).removeClass("ui-readonly"),$(u).removeClass("ui-readonly"),$(p).removeClass("ui-readonly"),$(c).removeClass("ui-readonly"),$(C).removeClass("ui-readonly"),$(f).removeClass("ui-disabled"),$(v).removeClass("ui-disabled"))},ShowSpinner:function(){var e=document.getElementById("addPostal");this.ShowActivityIndicator(e),$("<h5>Saving...</h5>").appendTo($("#spin"))},ShowActivityIndicator:function(e){if(this.ShowModal(!0),"Customer"==!t.ApplicationType){e||(e=document.getElementById("main-transaction-page")),$("<div id='spin'></div>").appendTo(e);var s=document.getElementById("spin");_spinner=n,_spinner.opts.color="#fff",_spinner.opts.lines=13,_spinner.opts.length=7,_spinner.opts.width=4,_spinner.opts.radius=10,_spinner.opts.top="auto",_spinner.opts.left="auto",_spinner.spin(s)}},ShowModal:function(e){e?"Customer"==!t.ApplicationType?$("#main-transaction-blockoverlay").addClass("z3000"):$("#customers-page-blockoverlay").addClass("z3000"):"Customer"==!t.ApplicationType?$("#main-transaction-blockoverlay").removeClass("z3000"):$("#customers-page-blockoverlay").removeClass("z3000")},HideActivityIndicator:function(){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.ShowModal(!1),"Customer"==!t.ApplicationType&&(_spinner=n,_spinner.stop(),$("#spin").remove())},Save:function(e){e.preventDefault();var t=$(d).val(),s=$(u).val(),l=$(c).val(),o=$(p).val(),a=$(C).val();this.ValidateFields(t,s,l,a,o)},ValidateFields:function(e,t,s,l,a){return o.IsNullOrWhiteSpace(e)?void navigator.notification.alert("Please input a valid Zip Code.",null,"Zip Code is Required","OK"):o.IsNullOrWhiteSpace(t)?void navigator.notification.alert("Please input City.",null,"City is Required","OK"):(o.IsNullOrWhiteSpace(s)&&(s="Please enter state"),o.IsNullOrWhiteSpace(l)&&this.ToggleFields(!0),this.ShowSpinner(),$("#custome-add-postal-btn-add").addClass("ui-disabled"),void this.SavePostal(e,t,s,l,a))},SavePostal:function(e,o,i,n,r){this.postalModel=new a;var d=this,u=this.GetDefaulClassTemplate(y.Retail).ClassCode,c=this.GetDefaulClassTemplate(y.Retail).ClassDescription,C=this.GetDefaulClassTemplate(y.WholeSale).ClassCode,p=this.GetDefaulClassTemplate(y.WholeSale).ClassDescription;this.postalModel.set({PostalCode:e,City:o,State:i,StateCode:n,County:r,CountryCode:d.countryCode,DefaultRetailCustomerBillToClassTemplate:u,DefaultRetailCustomerShipToClassTemplate:u,DefaultRetailCustomerBillToClassTemplateDescription:c,DefaultRetailCustomerShipToClassTemplateDescription:c,DefaultWholesaleCustomerBillToClassTemplate:C,DefaultWholesaleCustomerShipToClassTemplate:C,DefaultWholesaleCustomerBillToClassTemplateDescription:p,DefaultWholesaleCustomerShipToClassTemplateDescription:p}),this.postalModel.url=t.ServiceUrl+s.CUSTOMER+l.CREATEPOSTAL,this.postalModel.save(null,{success:function(e,s){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),d.SaveSuccesFull(s)},error:function(e,s,l){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),d.ErrorSavingPostal(),e.RequestError(s,"Error Saving Postal")}})},ErrorSavingPostal:function(){this.ToggleFields(!1),this.HideActivityIndicator(),this.ShowModal(!1),console.log("ErrorSaving Postal!")},SaveSuccesFull:function(e){o.IsNullOrWhiteSpace(e.ErrorMessage)?(this.trigger("AcceptPostal",e),o.ShowNotification("Postal Code successfully saved"),this.ToggleFields(!1),this.HideActivityIndicator(),this.Hide()):navigator.notification.alert(e.ErrorMessage,null,"Error Saving","OK")},Hide:function(){this.$el.hide(),$(h).hide()},CheckIfRequireClassTemplate:function(e){if(o.IsNullOrWhiteSpace(e))return!1;var t=this.countryCollection.find(function(t){return t.get("CountryCode")==e&&(1==t.get("IsWholesaleCustomerBillToClassPostal")||1==t.get("IsRetailCustomerBillToClassPostal"))});console.log("IsPrioritized ="+t),t&&this.FetchDefaultClassTemplate(e)},FetchDefaultClassTemplate:function(e){if(!o.IsNullOrWhiteSpace(e)){var i=this,n=new a;n.url=t.ServiceUrl+s.CUSTOMER+l.CLASSTEMPLATELOOKUP+100+"/false",n.set({StringValue:e}),n.save(null,{success:function(e,s){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),i.defaultClassTemplateCollection.reset(s.ClassTemplates)},error:function(e,s,l){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(s,"Error Fetching Class Template List")}})}},GetDefaulClassTemplate:function(e){var t={ClassCode:"",ClassDescription:""};if(this.defaultClassTemplateCollection.length>0)switch(e){case y.Retail:t.ClassCode=this.defaultClassTemplateCollection.at(1).get("ClassCode"),t.ClassDescription=this.defaultClassTemplateCollection.at(1).get("ClassDescription");break;case y.WholeSale:t.ClassCode=this.defaultClassTemplateCollection.at(0).get("ClassCode"),t.ClassDescription=this.defaultClassTemplateCollection.at(0).get("ClassDescription")}return t}});return g});