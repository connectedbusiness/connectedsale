define(["jquery","mobile","underscore","backbone","shared/global","shared/method","shared/service","shared/shared","collection/base","collection/workstations","collection/localpreferences","collection/invoices","collection/payments","collection/reportsettings","model/lookupcriteria","model/workstation","model/print","model/base","model/reportsetting","view/21.0.0/pos/pos","view/21.0.0/settings/general/general","view/21.0.0/settings/category/categories","view/21.0.0/settings/receipt/receipt","view/21.0.0/settings/reason/reason","view/21.0.0/settings/discount/discount","view/21.0.0/settings/signature/signature","view/21.0.0/settings/manager/managerpage","view/21.0.0/settings/misc/misc","view/21.0.0/settings/payment/payment","view/21.0.0/settings/user/user","view/21.0.0/settings/dejavoo/dejavoo","view/21.0.0/pos/drawerbalance/closingamount","view/21.0.0/pos/print/printpreview","view/21.0.0/pos/print/dynamicprint","view/21.0.0/pos/print/printer","text!template/21.0.0/settings/settings.tpl.html","view/spinner"],function(e,t,i,s,n,a,r,o,c,l,g,h,d,p,u,S,w,v,m,C,k,V,y,f,P,b,T,D,I,R,A,M,_,B,z,O,U){var W=null,L=s.View.extend({_template:i.template(O),_page:"pos",events:{"tap #general-settings":"InitializeGeneralSettings","tap #category-settings":"InitializeCategorySettings","tap #creditcard-settings":"InitializeCreditCardSettings","tap #discount-settings":"InitializeDiscountSettings","tap #dejavoo-settings":"InitializeDejavooSettings","tap #receipt-settings":"InitializeReceiptSettings","tap #override-settings":"InitializeOverrideSettings","tap #reason-settings":"InitializeReasonSettings","tap #signature-settings":"InitializeSignatureSettings","tap #misc-settings":"InitializeMiscSettings","tap #user-settings":"InitializeUserSettings","tap #back-main":"BackToMain","tap #back-general":"BackToGeneral","tap #add-workstation-btn":"AddWorkstationTapped","tap #add-user-btn":"AddUserTapped","keyup #settings-default-customer":"keyupCustomer","keyup #settings-workstation-input":"keyupWorkstation","keyup #settings-default-location":"keyupLocation","keyup #search-user":"keyupUser","keyup #search-report":"keyupReport","tap .clearTextBtn":"ClearText","blur #settings-workstation-input":"HideClearBtn","keypress #settings-workstation-input":"WorkStation_OnKeypress"},InitializeChildViews:function(){console.log("SettingsViewVersion: 13.2.1"),this.InitializeFirstPage(),this.InitializeLocalPreference(),this.$("#settings-page").trigger("create"),navigator.notification.overrideAlert(!0)},render:function(){return this._BackToMain=!1,n.BackToMain=!1,this.$el.html(this._template),this},keyupWorkstation:function(e){this.ShowClearBtn(e),13===e.keyCode&&this.InitializeWorkstationCheck()},keyupCustomer:function(e){this.ShowClearBtn(e),13===e.keyCode&&this.InitializeCustomerSearch()},keyupLocation:function(e){13===e.keyCode&&this.InitializeLocationSearch()},keyupUser:function(e){this.ShowClearBtn(e),13===e.keyCode&&this.InitializeUserSearch()},keyupReport:function(e){this.DisplayClearBtn(e),13===e.keyCode&&this.InitializeReportSearch()},InitializeFirstPage:function(){this.ToggleSettingsDisplay("General"),this.generalSettingsView?this.generalSettingsView.render():(this.generalSettingsView=new k({el:e("#settings-main-content")}),this.generalSettingsView.on("SaveCompleted",this.SaveCompleted,this),this.generalSettingsView.on("forceUserToSetPrinter",this.ForceUserToSetPrinter,this),this.generalSettingsView.on("showClosingAmount",this.ShowClosingAmount,this),this.generalSettingsView.render()),!n._UserIsAdmin&&n._HasAdmins&&(e("#left-pane-content").find("li").addClass("ui-disabled"),e("#left-pane-content").find("li#general-settings").removeClass("ui-disabled"))},InitializeWorkstationCheck:function(){var t=e("#settings-workstation-input").val();this.generalSettingsView.trigger("SearchWorkstation",t,this),e("#settings-workstation-input").blur()},InitializeCustomerSearch:function(){var t=e("#settings-default-customer").val();this.generalSettingsView.trigger("CustomerLookup",t,this),e("#settings-default-customer").val("").blur()},InitializeLocationSearch:function(){var t=e("#settings-default-location").val();this.generalSettingsView.trigger("LocationLookup",t,this),e("#settings-default-location").val("").blur()},InitializeUserSearch:function(){var t=e("#search-user").val();this.userSettingsView.trigger("searchUser",t,this),e("#search-user").val("").blur()},InitializeReportSearch:function(){console.log("InitializeReportSearch");var t=e("#search-report").val();this.receiptSettingsView.trigger("ReportLookup",t,this),e("#search-report").val("").blur()},DisplayClearBtn:function(t){t.stopPropagation();var i=t.target.id,s=e("#"+i).val(),n=s.length,a=e("#"+i).position(),r=e("#"+i).width();n<=0?this.HideClearBtn():(null===a&&""===a||e("#"+i+"ClearBtn").css({top:a.top+7,left:r-2}),e("#"+i+"ClearBtn").show())},ShowClearBtn:function(t){t.stopPropagation();var i=t.target.id,s=e("#"+i).val(),n=s.length,a=e("#"+i).position();e("#"+i).width();if(n<=0)this.HideClearBtn();else{var r="646px";"settings-workstation-input"==t.target.id?r="512px":"settings-default-customer"==t.target.id?r="550px":"search-user"==t.target.id&&(r="805px"),_style={top:a.top+8,left:r},null===a&&""===a||e("#"+i+"ClearBtn").css(_style),e("#"+i+"ClearBtn").show()}},HideClearBtn:function(){e(".clearTextBtn").fadeOut()},ClearText:function(t){var i=t.target.id,s=i.substring(0,i.indexOf("ClearBtn"));e("#"+s).val(""),e(".clearTextBtn").hide()},InitializeGeneralSettings:function(){this.SelectedPage="General",this.Save()},InitializeCategorySettings:function(){this.SelectedPage="Category",this.Save()},InitializeCreditCardSettings:function(){this.SelectedPage="Credit Card",this.Save()},InitializeDiscountSettings:function(){this.SelectedPage="Discount",this.Save()},InitializeReceiptSettings:function(){this.SelectedPage="Receipt",this.Save()},InitializeUserSettings:function(){this.SelectedPage="User",this.Save()},InitializeOverrideSettings:function(){this.SelectedPage="Manager Override",this.Save()},InitializeReasonSettings:function(){this.SelectedPage="Reason",this.Save()},InitializeSignatureSettings:function(){this.SelectedPage="Signature",this.Save()},InitializeMiscSettings:function(){this.SelectedPage="Miscellaneous",this.Save()},InitializeDejavooSettings:function(){this.SelectedPage="Dejavoo",this.Save()},ToggleSettingsDisplay:function(t){switch(this.PreviousPage=t,e("#settings-title").text(t),e("#settings-left-pane ul li").removeClass("selected-category"),e("#right-pane-content").empty(),e("#right-pane-content").html(""),t){case"General":this.ChangeDisplayTab("#general-settings"),this.SelectedSettingPage("General");break;case"Category":this.ChangeDisplayTab("#category-settings");break;case"Reason":this.ChangeDisplayTab("#reason-settings"),e("#settings-title").text(t+" Code");break;case"Receipt":this.ChangeDisplayTab("#receipt-settings");break;case"Discount":this.ChangeDisplayTab("#discount-settings");break;case"Signature":this.ChangeDisplayTab("#signature-settings");break;case"Manager Override":this.ChangeDisplayTab("#override-settings");break;case"Miscellaneous":break;case"User":this.ChangeDisplayTab("#user-settings");break;case"Dejavoo":this.ChangeDisplayTab("#dejavoo-settings")}this.DisableButton()},BackToMain:function(e){e.preventDefault(),n.BackToMain=!0,this._BackToMain=!0,this.Save()},BackToGeneral:function(e){switch(e.preventDefault(),o.FixRightPanelPadding(),n.BackToGeneralTriggered=!0,this.PreviousPage){case"General":this.generalSettingsView.ReinitializeGeneralDisplay();break;case"Manager Override":this.InitializeOverrideSettings();break;case"Receipt":this.InitializeReceiptSettings();break;case"User":this.InitializeUserSettings()}},removeAndHide:function(){e("#settings-customer-search").remove(),e("#settings-workstation-container").remove(),e("#settings-location-search").remove(),e("#settings-user-container").remove(),e("#settings-user-container").remove(),e("#settings-report-search").remove(),e("#settings-salesexempttaxcode-search").remove(),e("#back-general").hide()},DisableButton:function(){e("#left-pane-content ul>li").removeClass("setting-category-disable"),e("#left-pane-content ul>li").each(function(t,i){e(i).hasClass("selected-category")})},DisposeViews:function(){this.undelegateEvents()},SelectedSettingPage:function(t){switch(e("#general-settings").removeClass("active"),e("#category-settings").removeClass("active"),e("#creditcard-settings").removeClass("active"),e("#discount-settings").removeClass("active"),e("#override-settings").removeClass("active"),e("#reason-settings").removeClass("active"),e("#receipt-settings").removeClass("active"),e("#signature-settings").removeClass("active"),e("#user-settings").removeClass("active"),e("#dejavoo-settings").removeClass("active"),t){case"General":e("#general-settings").addClass("active");break;case"Category":e("#category-settings").addClass("active");break;case"Credit Card":e("#creditcard-settings").addClass("active");break;case"Discount":e("#discount-settings").addClass("active");break;case"Manager Override":e("#override-settings").addClass("active");break;case"Reason":e("#reason-settings").addClass("active");break;case"Manager Override":e("#override-settings").addClass("active");break;case"Reason":e("#reason-settings").addClass("active");break;case"Dejavoo":e("#dejavoo-settings").addClass("active");break;case"Receipt":e("#receipt-settings").addClass("active");break;case"Signature":e("#signature-settings").addClass("active");break;case"User":e("#user-settings").addClass("active")}n._UserIsCS||(e("#creditcard-settings").css("display","none"),e("#user-settings").css("display","none"))},GetPreviousPage:function(){this.generalSettingsView.isValid?"dashboard"===n.PreviousPage?(this._page="dashboard",n.PreviousPage=""):"Kiosk"===n.ApplicationType?this._page="kiosk":"Settings"===n.ApplicationType?this._page="dashboard":"Secondary"===n.ApplicationType?this._page="secondary":"Products"===n.ApplicationType?this._page="products":"Customers"===n.ApplicationType?this._page="customers":"Reports"===n.ApplicationType?this._page="reports":"POS"===n.ApplicationType&&(this._page="pos"):this._page="settings"},Save:function(e){if(e||this.AllowToSwitchPreference())switch(this.PreviousPage){case"General":this.generalSettingsView&&(this.generalSettingsView.isValid=!0,this.generalSettingsView.Save(),this.GetPreviousPage());break;case"Category":this.categorySettingsView&&this.categorySettingsView.Save();break;case"Credit Card":this.paymentGatewaySettingsView&&this.paymentGatewaySettingsView.Save();break;case"Discount":this.discountSettingsView&&this.discountSettingsView.Save();break;case"Manager Override":this.managerSettingsView&&this.managerSettingsView.Save();break;case"Reason":this.reasonSettingsView&&this.reasonSettingsView.Save();break;case"Dejavoo":this.dejavooSettingsView&&this.dejavooSettingsView.Save();break;case"Receipt":this.receiptSettingsView&&(this._BackToMain&&(this.receiptSettingsView.backToMain=this._BackToMain),this.receiptSettingsView.AllowSilentSave=!1,this.receiptSettingsView.Save());break;case"Signature":this.signatureSettingsView&&this.signatureSettingsView.Save();break;case"Miscellaneous":this.miscSettingsView&&this.miscSettingsView.Save();break;case"User":this.userSettingsView&&this.userSettingsView.Save()}},SaveCompleted:function(){if(this._BackToMain=n.BackToMain,n.isBrowserMode&&o.FixRightPanelPadding(),this._BackToMain)return void("pos"===this._page?(window.location.hash=this._page,this.DisposeViews()):(this.GetPreviousPage(),window.location.hash=this._page));switch(this.SelectedSettingPage(this.SelectedPage),this.SelectedPage){case"General":this.ToggleSettingsDisplay("General"),this.generalSettingsView?this.generalSettingsView.render():(this.generalSettingsView=new k({el:e("#settings-main-content")}),this.generalSettingsView.on("SaveCompleted",this.SaveCompleted,this),this.generalSettingsView.on("showClosingAmount",this.ShowClosingAmount,this),this.generalSettingsView.render());break;case"Category":this.generalSettingsView.isValid&&(this.ToggleSettingsDisplay("Category"),this.categorySettingsView?this.categorySettingsView.render():(this.categorySettingsView=new V({el:e("#settings-main-content")}),this.categorySettingsView.on("SaveCompleted",this.SaveCompleted,this)));break;case"Credit Card":this.generalSettingsView.isValid&&(this.ToggleSettingsDisplay("Credit Card"),this.paymentGatewaySettingsView?this.paymentGatewaySettingsView.render():(this.paymentGatewaySettingsView=new I({el:e("#settings-main-content")}),this.paymentGatewaySettingsView.on("SaveCompleted",this.SaveCompleted,this),this.paymentGatewaySettingsView.on("deviceChanged",this.DeviceChanged,this)));break;case"Discount":this.generalSettingsView.isValid&&(this.ToggleSettingsDisplay("Discount"),this.discountSettingsView?this.discountSettingsView.render():(this.discountSettingsView=new P({el:e("#settings-main-content")}),this.discountSettingsView.on("SaveCompleted",this.SaveCompleted,this)));break;case"Manager Override":this.generalSettingsView.isValid&&(this.ToggleSettingsDisplay("Manager Override"),this.managerSettingsView?this.managerSettingsView.render():(this.managerSettingsView=new T({el:e("#settings-main-content")}),this.managerSettingsView.on("SaveCompleted",this.SaveCompleted,this)));break;case"Reason":this.generalSettingsView.isValid&&(this.ToggleSettingsDisplay("Reason"),this.reasonSettingsView?this.reasonSettingsView.render():(this.reasonSettingsView=new f({el:e("#settings-main-content")}),this.reasonSettingsView.on("SaveCompleted",this.SaveCompleted,this)));break;case"Dejavoo":this.generalSettingsView.isValid&&(this.ToggleSettingsDisplay("Dejavoo"),this.dejavooSettingsView?this.dejavooSettingsView.render():(this.dejavooSettingsView=new A({el:e("#settings-main-content")}),this.dejavooSettingsView.on("SaveCompleted",this.SaveCompleted,this)));break;case"Receipt":this.generalSettingsView.isValid&&(this.ToggleSettingsDisplay("Receipt"),this.receiptSettingsView?this.receiptSettingsView.render():(this.receiptSettingsView=new y({el:e("#settings-main-content")}),this.receiptSettingsView.on("SaveCompleted",this.SaveCompleted,this)));break;case"Signature":this.generalSettingsView.isValid&&(this.ToggleSettingsDisplay("Signature"),this.signatureSettingsView?this.signatureSettingsView.render():(this.signatureSettingsView=new b({el:e("#settings-main-content")}),this.signatureSettingsView.on("SaveCompleted",this.SaveCompleted,this)));break;case"Miscellaneous":this.generalSettingsView.isValid&&(this.ToggleSettingsDisplay("Miscellaneous"),this.miscSettingsView?this.miscSettingsView.render():(this.miscSettingsView=new D({el:e("#settings-main-content")}),this.miscSettingsView.on("SaveCompleted",this.SaveCompleted,this)));break;case"User":this.generalSettingsView.isValid&&(this.ToggleSettingsDisplay("User"),this.userSettingsView?this.userSettingsView.render():(this.userSettingsView=new R({el:e("#settings-main-content")}),this.userSettingsView.on("SaveCompleted",this.SaveCompleted,this)))}},Show:function(){this.$el.append(this._template),e("#customerForm").trigger("create"),e("#main-transaction-blockoverlay").hide()},InitializeLocalPreference:function(){this.localpreference=new g,this.localpreference.fetch({error:function(e,t,i){e.RequestError(t,"Error Retrieving Local Preference")}})},AddWorkstationTapped:function(t){t.preventDefault(),this.workstationCollection||this.FetchAvailableWorkstation();var i=e("#settings-workstation-input").val();this.ValidateID(i)&&(this.generalSettingsView.trigger("iSaveWorkStationID",i,this),e("#settings-workstation-input").blur())},WorkStation_OnKeypress:function(e){var t=new RegExp("[a-zA-Z0-9]+$"),i=String.fromCharCode(e.charCode?e.charCode:e.which),s=e.charchode||e.which||e.keyCode,n=8==s||46==s&&"."!=i||37==s&&"%"!=i||39==s&&"'"!=i||32==s;t.test(i)||n||e.preventDefault()},AddUserTapped:function(e){e.preventDefault(),this.CheckAvailableLicenseCount()},CheckAvailableLicenseCount:function(){var e=this;return void e.ProdceedToAddUserAction()},ProdceedToAddUserAction:function(){this.$("#back-general").show(),this.userSettingsView.trigger("addNewUserView",this)},FetchAvailableWorkstation:function(){this.workstationCollection=new l;var e=this,t="",i=new u,s=100;i.set({StringValue:t}),i.url=n.ServiceUrl+r.POS+a.PREFERENCELOOKUP+s,i.save(null,{success:function(t,i){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.FillWorkStationCollection(i.Preferences)}})},FillWorkStationCollection:function(e){this.workstationCollection.reset(e)},ValidateID:function(e){var t=e.trim();if(""===t)return!1;this.workstationCollection||this.FetchAvailableWorkstation();for(var i=0;i<this.workstationCollection.length;i++)if(t===this.workstationCollection.at(i).get("WorkstationID"))return this.NotifyMsg("Duplicate"),!1;return!0},NotifyMsg:function(e,t){var i,s;switch(e){case"Empty":i="Cannot add an empty Worksation ID.",s="Workstation ID is Required";break;case"Duplicate":i="Workstation ID already exists!",s="Error Saving";break;default:i=e,s=t}navigator.notification.alert(i,null,s,"OK")},ShowClosingAmount:function(t){var i=!1;this.closingAmountView?this.closingAmountView.Show(i):(this.closingAmountView=new M({el:e("#closingAmountContainer"),AllowCancel:i}),this.closingAmountView.on("SaveAmount",this.CloseWorkstation,this)),e("#settings-blockoverlay").show()},CloseWorkstation:function(e){var t=this,i=n.POSWorkstationID,s=n.Status;s.CloseAmount=e,""!==i&&null!==i||(console.log("Workstation ID is required to close workstation."),navigator.notification.alert("Workstation ID is required to close workstation.",null,"Workstation ID is Required","OK"));var o=new S(s);o.url=n.ServiceUrl+r.POS+a.CLOSEWORKSTATION+n.POSWorkstationID,o.save(null,{success:function(e,i){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.CloseWorkstationCompleted(e,i),console.log("CloseWorkstation")},error:function(e,t,i){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Closing Workstation")}})},CloseWorkstationCompleted:function(e,t){if(null!=t){n.AdministratorRole;this.PrintWorkstationReport(e,!1)}},ProcessLogout:function(){this.LockTransactionScreen(!0,"Logging Out...");var e=new v,t=this;e.url=n.ServiceUrl+r.POS+a.SIGNOUT,e.save(null,{success:function(){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.LockTransactionScreen(!1,"",!1);var e=window.location.href.split("#")[0];e+="#login",window.location.href=e},error:function(e,i){t.LockTransactionScreen(!1,"",!1),n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(i,"Error Logging out")}})},PrintWorkstationReport:function(e,t){isClosedWorkstation=!0,this.reportType="LastZtape",this.openDate="",this.closeDate="";var i=new Date,s=i.getMonth()+1+i.getDate()+i.getFullYear()+i.getHours()+i.getMinutes()+i.getSeconds();return void this.GenerateReport(this.reportType,"z-tape-"+n.Preference.WorkstationID+"-"+s);var i,s},ProcessPrintPreview:function(e,t,i){this.receiptPrint||(this.receiptPrint=new z({el:this.$el}),this.receiptPrint.on("SignOut",this.ProcessLogout,this)),this.receiptPrint.ProcessPrinting(e,t,i),this.LockTransactionScreen(!1,"",!0)},InitializeReportSettingsModel:function(){return this.printreportSettingModel||(this.printreportSettingModel=new m,this.printreportSettingModel.on("sync",this.PrintReportComplete,this),this.printreportSettingModel.on("error",this.PrintReportFailed,this)),this.printreportSettingModel},PrintReportComplete:function(e,t,i){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),n.Preference.IsAirprint?this.PrintDynamicReceipt(t,this._transactionCode,this._reportCode):this.PrintDynamicReceipt(t,this._transactionCode,this._reportCode,!0,this._isWorkstation)},GenerateReport:function(e,t){this.LockTransactionScreen(!0,"Loading...");var i=n.Preference,s=n.ServiceUrl+"ReportService.svc",c=n.ServiceUrl+r.POS+a.EXPORTREPORT,l=i.ZTapeReportCode,g=!1,h=!0,d="Sale",p="",u=this,S=n.Preference.AutoPrintReceipt&&n.PrintOptions.SilentPrint||n.PrintOptions.SilentPrint;S||n.isBrowserMode&&(c=n.ServiceUrl+r.POS+a.SAVEREPORT);var w=this.CreateReportSettingParameters(t,p,e,g,h,d),v=this.InitializeReportSettingsModel(),m=function(e){o.Reporting.AssignWorkstationID(w,e),v.set({ServiceUri:s,ServiceContentUri:c,ReportName:l,UserName:n.Username,Password:n.Password,Parameters:w,IsEmail:n.PrintOptions.EmailReceipt,IsAirPrint:i.IsAirprint,RecipientEmailAddress:n.PrintOptions.EmailAddress,IsBrowserMode:n.isBrowserMode,ReportFileName:t}),u.reportCodeModel=t,u._transactionCode=t,u._isWorkstation=g||h,u._reportCode=l,v.url=c,v.save({timeout:18e4})};o.Reporting.GetReportCriterias(m,"",l)},CreateReportSettingParameters:function(e,t,i,s,n,a){var r=new p,o="",c="",l="";return s===!0||n===!0?n===!0&&(c=this.openDate,l=this.closeDate):o=this.receiptCodes,r.add([{Name:"TransactionType",Value:a},{Name:"CreditCardReportCode",Value:""},{Name:"IsSinglePageTransactionReceipt",Value:!0},{Name:"DocumentCode",Value:t},{Name:"TransactionCode",Value:e},{Name:"IsXTapeReport",Value:s},{Name:"IsZTapeReport",Value:n},{Name:"ReceiptCodes",Value:o}]),r=this.CreateZtapeParameters(i,r,c,l)},CreateZtapeParameters:function(e,t,i,s){var n=t,a=i,r=s;switch(e){case"SpecificZtape":n.add([{Name:"OpenDateStart",Value:a}]);break;case"DateZtape":n.add([{Name:"OpenDateStart",Value:a},{Name:"OpenDateEnd",Value:r}])}return n},PrintDynamicReceipt:function(t,i,s,n,a){e("#printPreviewContainer").html("<div></div>"),this.dynamicPrintView=new B({el:e("#printPreviewContainer div"),model:i,reportType:s}),this.dynamicPrintView.IsReceiptPrinter=n||!1,this.dynamicPrintView.IsWorkStation=a||!1,isClosedWorkstation&&this.dynamicPrintView.on("formclosed",this.ProcessLogout,this),this.dynamicPrintView.on("AutoSignOut",this.ProcessLogout,this),this.LockTransactionScreen(!1,"",!0),this.dynamicPrintView.Show(t)},LockTransactionScreen:function(t,i,s){switch(t){case!0:e("#settings-blockoverlay").show(),target=document.getElementById("settings-page"),this.ShowActivityIndicator(target),e("<h5>"+i+"</h5>").appendTo(e("#spin"));break;default:s||e("#settings-blockoverlay").hide(),this.HideActivityIndicator()}},AllowToSwitchPreference:function(){switch(W=this,this.PreviousPage){case"User":if(!this.userSettingsView.HasChanges)return!0;var e=null;return this.userSettingsView.EditMode?e="Do you want to cancel changes you made?":this.userSettingsView.AddMode&&(e="Do you want to cancel this new user record?"),navigator.notification.confirm(e,W.CancelUserChanges,"Confirmation","Yes,No"),!1}return!0},CancelUserChanges:function(e){1==e?(W.userSettingsView.AddMode=!1,W.userSettingsView.EditMode=!1,W.userSettingsView.HasChanges=!1,W.Save(!0)):W.SelectedPage="User"},ShowActivityIndicator:function(t){e("<div id='spin'></div>").appendTo(t);var i=document.getElementById("spin");_spinner=U,_spinner.opts.color="#fff",_spinner.opts.lines=13,_spinner.opts.length=7,_spinner.opts.width=4,_spinner.opts.radius=10,_spinner.opts.top="auto",_spinner.opts.left="auto",_spinner.spin(i)},HideActivityIndicator:function(){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),_spinner=U,_spinner.stop(),e("#spin").remove()},RemoveScreenOverLay:function(){e("#settings-blockoverlay").hide()},ForceUserToSetPrinter:function(){this.ToggleSettingsDisplay("Receipt"),this.receiptSettingsView?this.receiptSettingsView.render():(this.receiptSettingsView=new y({el:e("#right-pane-content")}),this.receiptSettingsView.on("SaveCompleted",this.SaveCompleted,this))},ChangeDisplayTab:function(t){e(".setting-item-list .settings-item-tab-active").addClass("settings-item-tab"),e(".setting-item-list .settings-item-tab").removeClass("settings-item-tab-active"),e(t).addClass("settings-item-tab-active"),e(t).removeClass("settings-item-tab")}});return L});