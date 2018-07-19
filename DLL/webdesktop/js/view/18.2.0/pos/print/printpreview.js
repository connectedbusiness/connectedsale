define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","collection/printers","model/reportsetting","text!template/18.2.0/pos/print/printpreview.tpl.html","js/libs/iscroll.js"],function(e,t,r,n,o,s,a,l,d){var p=n.View.extend({_template:r.template(d),events:{"tap #print-btn":"buttonPrint_tap","change #printer-address":"selectMenuIP_changed","change #printer-address-url":"txtInputIP_changed"},buttonPrint_tap:function(t){t.preventDefault(),o.isBrowserMode?o.Printer.SelectedPrinter=e("#printer-address").find(":selected").text():this.GetValues(),e("#main-transaction-blockoverlay").trigger("click"),this.trigger("print")},selectMenuIP_changed:function(t){t.preventDefault(),e("#print-btn").removeClass("ui-disabled");var r=e("#printer-address").find(":selected").text();o.isBrowserMode?(e("#printer-address option[value='"+r+"']").attr("selected",!0),e("#printer-address").selectmenu("refresh")):(e("#printer-address option:first-child").attr("selected",!0),e("#printer-address").selectmenu("refresh"),e("#printer-address-url").val(r),this.GetPrinterModel(r))},txtInputIP_changed:function(t){t.stopImmediatePropagation();var r=e("#printer-address-url").val();"No printer detected. Please turn on printer."!=e("#printer-status span").text()&&(0===e("#printer-address option[value='"+r+"']").length&&e("#printer-address").append(new Option(r,r)),this.ValidateIPAddressEntered(r)&&this.GetPrinterModel(r))},render:function(){this.$el.html(this._template),this.$el.trigger("create"),this.OverrideCSS(),o.isBrowserMode?(e("#printer-address-url").remove(),e("#printModel").remove(),e(".ui-select").hasClass("ui-select")&&(e("#printer-address option:first-child").remove(),e(".ui-select").attr("style","width: 310px !important")),e("#print-btn").attr("style","margin-left: 0px !important; width: 275px; text-align: center;"),e("#print-btn").addClass("ui-disabled")):(this.PopulatePrinterIpAddress(o.Printer.IpAddress),this.PopulatePrinterModel(o.Printer.PrinterModel))},GetValues:function(){this.printerIP=e("#printer-address-url").val(),this.printerModel=e("#printModel").val()},GetPrinterModel:function(t){var r=this;e("#printModel").prop("enabled",!0);e("#printModel");o.isBrowserMode?this.SetDefaultPrinterModel("Printer model not supported"):window.plugins.cbReceiptPrint.GetPrinterModel(t,function(t){console.log(t),r.SetDefaultPrinterModel(t),e("#printer-status span").text("Printer IP and Model found.")},function(e){console.log(e),r.SetDefaultPrinterModel("Printer model not supported")})},InitializePrinterCollection:function(){this.printerCollection||(this.printerCollection=new a,this.printerCollection.on("add",this.SetValues,this)),this.printerCollection.fetch(),e("#main-transaction-blockoverlay").show()},MonitorFindingDefaultPrinter:function(){var t=document.jzebra,r=this;if(null!=t)if(t.isDoneFinding()){console.log("isDoneFindingDP TRUE"),window.clearInterval(this.findingDPinterval);var n=t.getPrinters().split(","),o=t.getPrinter(),s=document.getElementById("printer-address");if(n.length>0&&""!=n[0]){e("#printer-address option[value='No Printer']").remove();for(i in n){var a=document.createElement("option");a.id=n[i],a.text=n[i],a.value=n[i],s.appendChild(a),s.options[i].innerHTML.indexOf(o)!=-1&&a.setAttribute("selected","selected")}e("#printer-address").selectmenu("refresh")}""!=s.value&&"No Printer"!=s.value&&e("#print-btn").removeClass("ui-disabled")}else console.log("isDoneFindingDP FALSE"),window.clearInterval(this.findingDPinterval),this.findingDPinterval=window.setInterval(function(){r.MonitorFindingDefaultPrinter()},250);else navigator.notification.alert("Applet is not loaded properly.",null,"Printing Failed")},InitializeApplet:function(){var t='<applet name="jzebra" code="jzebra.PrintApplet.class" archive="js/libs/jzebra.jar" width="0px" height="0px" style="position: absolute;"></applet>';e("#jzebraApplet-container").html(t),console.log("Applet Loaded");var r=this;setTimeout(function(){r.PopulateAvailablePrinters()},1e3)},MonitorFindingPrinters:function(){var e=document.jzebra,t=this;null!=e?e.isDoneFinding()?(console.log("isDoneFindingPrinters TRUE"),window.clearInterval(this.findingInterval),e.findPrinter(),this.MonitorFindingDefaultPrinter()):(console.log("isDoneFindingPrinters FALSE"),window.clearInterval(this.findingInterval),this.findingInterval=window.setInterval(function(){t.MonitorFindingPrinters()},250)):navigator.notification.alert("Applet is not loaded properly.",null,"Printing Failed")},OverrideCSS:function(){e("#main-transaction-blockoverlay").show(),e("#print-details div.ui-select").attr("style","width:40% !important; position: relative; left: 10px;"),e("#print-btn").attr("style","width: 12% !important; padding: 7px 42px !important; margin-left: 10px !important;"),this.$("input").attr("style","width:50% !important;")},PopulateAvailablePrinters:function(){var e=document.jzebra;null!=e?(e.findPrinter("\\{dummy printer name for listing\\}"),this.MonitorFindingPrinters()):navigator.notification.alert("Applet is not loaded properly.",null,"Printing Failed")},PopulatePrinterIpAddress:function(t){""!=t&&(e("#print-status span").text("Printer IP and Model found."),e("#printer-address-url").val(t),0===e("#printer-address option[value='"+t+"']").length&&e("#printer-address").append(new Option(t,t))),this.SearchPrinter(!0)},PopulatePrinterModel:function(e){console.log("Loaded - "+e),""!=e?this.SetDefaultPrinterModel(o.Printer.PrinterModel):this.SetDefaultPrinterModel("No Printer Model specified")},SearchPrinter:function(t){switch(o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t){case!0:o.isBrowserMode?e("#printer-address-url").val("No Printer"):(window.plugins.cbReceiptPrint.SearchPrinterIP(),e("#print-status span").text("Searching for Printers within the network..."));break;default:o.isBrowserMode?e("#printer-address").trigger("change"):(window.plugins.cbReceiptPrint.SearchPrinter(),e("#print-status span").text("Searching for Printers within the network..."))}},SetDefaultPrinterModel:function(t){e("#printModel").val(t)},SetValues:function(e){e.get("PrinterModel")&&(o.Printer.PrinterModel=e.get("PrinterModel")),e.get("IpAddress")&&(o.Printer.IpAddress=e.get("IpAddress"))},ValidateIPAddressEntered:function(e){return""!=e},Show:function(){this.render();var t=function(r){e("#main-transaction-blockoverlay").off("click",t),e("#printPreviewContainer").off("click",t),e("#printSetupContainer-Wrapper").html("")};e("#main-transaction-blockoverlay").on("click",t),e("#printPreviewContainer").on("click",t)},Hide:function(){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),o.isBrowserMode||s.Printer.ReleasePrinterObjects(),this.$("#printPreview").remove(),e("#main-transaction-blockoverlay").hide(),o.PrintOptions.Reprint=!1},isWorkstation:function(){return"Workstation"===this.receipt.get("SourceTransactionType")},ReSearchPrinter:function(){this.Show(),this.SearchPrinter(!0)}});return p});