define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/shared","shared/method","view/spinner","collection/printers","text!template/20.0.0/settings/receipt/print/printsetting.tpl.html","js/libs/ui.checkswitch.min.js"],function(e,t,r,n,i,s,o,d,a,l,c){var p=null,u=n.View.extend({_template:r.template(c),events:{"change #radio-airprint-enabled":"airprintEnabled_changed","tap #test-connect":"buttonConnect_tap","change #radio-receipt-printer":"receiptPrinter_changed","change #printer-address":"selectMenuIP_changed","change #printer-address-url":"txtInputIP_changed"},airprintEnabled_changed:function(e){var t=!0;this.SetSelected(t)},buttonConnect_tap:function(t){t.stopImmediatePropagation();var r=e("#printer-address-url").val(),n=e("#printModel").val();o.IsNullOrWhiteSpace(r)||o.IsNullOrWhiteSpace(n)?navigator.notification.alert("Please input Printer IP Address, choose printer model and tap 'Test Connection'",null,"Printer IP Address Empty","OK"):(this.ShowActivityIndicator(),this.Connect(r,n))},receiptPrinter_changed:function(e){var t=!1;this.SetSelected(t)},selectMenuIP_changed:function(t){t.preventDefault();var r=e("#printer-address").find(":selected").text();e("#printer-address option:first-child").attr("selected",!0),e("#printer-address").selectmenu("refresh"),e("#printer-address-url").val(r),this.GetPrinterModel(r)},txtInputIP_changed:function(t){t.preventDefault();var r=e("#printer-address-url").val();"No printer detected. Please turn on printer."!=e("#printer-status span").text()&&(0===e("#printer-address option[value='"+r+"']").length&&e("#printer-address").append(new Option(r,r)),this.ValidateIPAddressEntered(r)&&this.GetPrinterModel(r))},initialize:function(){o.IsNullOrWhiteSpace(p)||(p=this),this.model=this.options.model,this.InitializePrinterCollection(),o.Printer.InitializePrintPlugin(),this.render(),e("#PrinterIpAddress").blur(),e("#printer-setting-container div.ui-select").attr("style","width:28% !important; position: relative; left: 12px;")},render:function(){e("#back-general").show(),this.$el.html(this._template),this.$el.trigger("create"),this.AssignValues(),this.changeModalSize()},AssignValues:function(){var e=this.model.get("IsAirprint");this.SetSelected(e),""!=i.Printer.PrinterModel&&this.SetDefaultPrinterModel(i.Printer.PrinterModel)},Connect:function(e,t){try{o.Printer.ConnectionTest(e,t),this.HideActivityIndicator()}catch(r){console.log("ERROR "+r)}},FindDeleteAndSave:function(e,t,r){var n,s="";switch(e){case"ip":s="IpAddress",n={IpAddress:r,IsValid:i.Printer.IsValid};var o=t.find(function(e){return e.get(s)});o&&o.destroy();break;case"model":s="PrinterModel",n={PrinterModel:r,IsValid:i.Printer.IsValid};var d=t.find(function(e){return e.get(s)});d&&d.destroy()}t.create(n)},GetPrinterModel:function(t){var r=this;e("#printModel").prop("enabled",!0);e("#printModel");i.isBrowserMode?(this.SetDefaultPrinterModel("Printer model not supported"),e("#printer-status span").text("Printer maybe offline or Printer IP address is not valid")):window.plugins.cbReceiptPrint.GetPrinterModel(t,function(n){console.log("GETPRINTERMODEL[SUCCESS] - "+n),r.SetDefaultPrinterModel(n),e("#printer-address-url").val()===t&&e("#printer-status span").text("Printer IP and Model found.")},function(t){console.log("GETPRINTERMODEL[ERROR] - "+t),r.SetDefaultPrinterModel("Printer model not found"),e("#printer-status span").text(t)})},InitializePrinterCollection:function(){var e=this;this.printerCollection||(this.printerCollection=new l,this.printerCollection.on("reset",this.SetValues,this),this.printerCollection.on("add",this.RetrieveAddValue,this)),this.printerCollection.fetch({success:function(t,r,n){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),console.log(r),e.SetValues(t)},error:function(e,t,r){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Retrieving Printer List")}})},PopulatePrinterIpAddress:function(t){console.log("Global.Printer.IpAddress: "+t),console.log("Global.Printer.PrinterModel: "+i.Printer.PrinterModel),""!=t&&("Printer model not found"!=i.Printer.PrinterModel?e("#printer-status span").text("Printer IP and Model found."):e("#printer-status span").text("Printer maybe offline or Printer IP address is not valid"),e("#printer-address-url").val(t),0===e("#printer-address option[value='"+t+"']").length&&e("#printer-address").append(new Option(t,t))),this.SearchPrinter(!0)},PopulateSelectElement:function(t){t?(e("#test-connect").addClass("ui-disabled"),e("#printModel").addClass("ui-disabled"),e("#printer-address-url").addClass("ui-disabled"),e("#printer-address").selectmenu("disable"),e("#btn-addUrl").addClass("ui-disabled")):(this.PopulatePrinterIpAddress(i.Printer.IpAddress),e("#test-connect").removeClass("ui-disabled"),e("#printer-address-url").removeClass("ui-disabled"),e("#printModel").removeClass("ui-disabled"),e("#printer-address").selectmenu("enable"))},RetrieveAddValue:function(e){e&&("No Printer"!=e.get("IpAddress")&&(i.Printer.IpAddress=e.get("IpAddress")),"Printer model found"!=e.get("PrinterModel")&&(i.Printer.PrinterModel=e.get("PrinterModel")))},ResetLocalStorageCollection:function(e){for(var t=e.length-1;t>=0;t--)e.at(t).destroy()},Save:function(){var t=e("#printer-address-url").val(),r=e("#printModel").val();"Printer model not found"==r&&"No Printer"==t||(this.ResetLocalStorageCollection(this.printerCollection),this.SavePrinterModel(r),this.SaveIpAddress(t)),this.UpdateReceiptPreference()},SaveIpAddress:function(e){this.FindDeleteAndSave("ip",this.printerCollection,e)},SavePrinterModel:function(e){this.FindDeleteAndSave("model",this.printerCollection,e)},SearchPrinter:function(t){switch(t){case!0:i.isBrowserMode?e("#printer-address-url").val("No Printer"):(window.plugins.cbReceiptPrint.SearchPrinterIP(),e("#print-status span").text("Searching for Printers within the network..."));break;default:i.isBrowserMode?e("#printer-address").trigger("change"):(window.plugins.cbReceiptPrint.SearchPrinter(),e("#print-status span").text("Searching for Printers within the network..."))}},SetDefaultPrinterModel:function(t){e("#printModel").val(t),e("#test-connect").removeClass("ui-disabled"),"Printer model not found"!=t&&(i.Printer.PrinterModel=t)},SetPreferences:function(e){this.preferences=e},SetSelected:function(t){this.isAirprint=t,t?(e("#radio-airprint-enabled").attr("checked",!0).checkboxradio("refresh"),e("#radio-receipt-printer").attr("checked",!1).checkboxradio("refresh")):(e("#radio-airprint-enabled").attr("checked",!1).checkboxradio("refresh"),e("#radio-receipt-printer").attr("checked",!0).checkboxradio("refresh")),this.PopulateSelectElement(t)},SetValues:function(e){var t=e.find(function(e){return e.get("PrinterModel")}),r=e.find(function(e){return e.get("IpAddress")});t&&(i.Printer.PrinterModel=t.get("PrinterModel")),r&&(i.Printer.IpAddress=r.get("IpAddress"),console.log("SetValues - "+i.Printer.IpAddress))},UpdatePreference:function(){var e=!0,t={};e=this.isAirprint,t=e?{IsAirprint:e,UseCashDrawer:!1,AutoPrintReceipt:!1}:{IsAirprint:e},this.model.set(t)},UpdateReceiptPreference:function(){if(this.model&&this.preferences&&0!==this.preferences.length){this.UpdatePreference();var e=this,t=this.preferences.at(0);t.set({Preference:this.model}),t.url=i.ServiceUrl+s.POS+d.UPDATEPREFERENCE,t.save(null,{success:function(t,r){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.trigger("SaveCompleted"),e.remove(),e.unbind()},error:function(e,t,r){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Saving Printer Preference")}})}},ValidateIPAddressEntered:function(e){return!o.IsNullOrWhiteSpace(e)},ShowActivityIndicator:function(){var t=document.getElementById("test-connect");_spinner=a,_spinner.opts.left=-8,_spinner.opts.radius=3,_spinner.opts.lines=9,_spinner.opts.length=4,_spinner.opts.width=3,_spinner.opts.color="#000",e("#test-connect").text("Connecting...   "),_spinner.spin(t,"Connecting..."),e("#test-connect").css("text-align","right"),e("#test-connect").addClass("ui-disabled")},changeModalSize:function(){e("#settings-modal-container").addClass("settings-modal-receipt-printer"),e("#settings-modal").css("width","auto")},HideActivityIndicator:function(){_spinner=a,_spinner.stop(),e("#test-connect").removeClass("ui-disabled"),e("#test-connect").text("Test Connection"),e("#test-connect").css("text-align","center")}});return u});