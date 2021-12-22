define(["backbone","shared/global","shared/service","shared/method","shared/shared","model/base","model/reportsetting","model/lookupcriteria","collection/base","collection/reportsettings","view/21.0.0/pos/print/dynamicprint","view/21.0.0/reports/print/printdialog","text!template/21.0.0/reports/print/preview.tpl.html","text!template/21.0.0/reports/print/printarea.tpl.html"],function(e,t,i,r,n,o,s,a,l,p,c,h,d,u){var g="#printDialog-div",w="#printDialog",P="#printerSetup-div",v="#reports-spinner",m="#spinnerLabel",S=".no-record-found",R="#previewControls",C="#btn-print",f="#customizePrintContainer",I=null,O=null,N={SalesOrder:"Sales Order",Quote:"Quote",Sale:"Invoice",Return:"Credit Memo"},A=e.View.extend({_template:_.template(d),_printAreaTemplate:_.template(u),initialize:function(){this.render()},events:{"tap #btn-printDialog":"ShowPrintDialog","tap #btn-print":"ShowPrintSetup","tap #btn-printPreview":"TogglePrintPreview"},render:function(){return this.isLoaded=!1,this.$el.html(this._template),I=this,this},InitializeChildViews:function(){t.isBrowserMode&&$(C).hide()},InitializePrintDialog:function(){$(w).html("<div id='printDialog-div' style='display: none;'></div>"),n.IsNullOrWhiteSpace(this.printdialogView)?this.printdialogView=new h({el:$(g)}):(this.printdialogView.remove(),this.printdialogView=new h({el:$(g)})),console.log("ShowPrintDialog"),this.printdialogView.on("Apply",this.ApplyCriteria,this),this.printdialogView.on("ChangePreview",this.PrindailogOnChangePreview,this),this.printdialogView.InitializeChildViews(this.genReportDatasource,this.reportCode)},PrindailogOnChangePreview:function(){console.log("ChangePreview"),this.printdialogView.unbind(),this.printdialogView=null},ApplyCriteria:function(e,t){var i="",r=!1,o=this;this.hasPOSWorkStationID=!1,this.isPreview=!1,this.parameterCollection=new l,this.parameterCollection.reset(),t.each(function(e){switch(e.get("ColumnName").toString().toUpperCase()){case"INVOICECODE":case"TRANSACTIONCODE ":case"SALESORDERCODE":i=e.get("CriteriaValue"),o.parameterCollection.add(e);break;case"POSWORKSTATIONID":o.hasPOSWorkStationID=!0,o.parameterCollection.add(e);break;case"WORKSTATIONID":case"@WORKSTATIONID":r=!0,o.parameterCollection.add(e);break;default:o.parameterCollection.add(e)}});var s=function(t){var n="";t.each(function(t){var i=t.get("SubCategory"),r=t.get("ReportCode");switch(i){case N.SalesOrder:r==e&&(n=N.SalesOrder);break;case N.Quote:r==e&&(n=N.Quote);break;case N.Sale:r==e&&(n=N.Sale);break;case N.Return:r==e&&(n=N.Return)}}),console.log("TRANSACTION TYPE : "+n),o.GenerateReport(e,i,r,!0,n)};n.Reporting.GetReportSubCategory(s,e)},ShowPrintDialog:function(e){e.preventDefault(),1==this.isLoaded&&(this.InitializePrintDialog(),this.printdialogView.Show())},ShowPrintSetup:function(e){e.preventDefault(),1==this.isLoaded&&0==t.Preference.IsAirprint&&(this.IsNullOrWhiteSpace(this.noPreview)||0==this.noPreview)&&$(P).show()},InitializeReportSettingModel:function(){this.model?(this.model.unbind(),this.model=new a):this.model=new a},ChangeReportPreview:function(e,t){var i=new o;i.set(e);var r=i.get("ReportCode");this.genReportDatasource=i.get("DatasourceName"),this.reportCode=r,this.reportName=i.get("ReportName"),n.IsNullOrWhiteSpace(this.printdialogView)||this.printdialogView.trigger("ChangePreview"),n.IsNullOrWhiteSpace(t)||(this.isPreview=t),this.GenerateReport(r)},GenerateReport:function(e,s,a,l,p){$(S).hide(),this.isLoaded=!1,this.noPreview=!1;var c,h=t.Preference,d=t.ServiceUrl+"ReportService.svc",u=e,g=new Date,w=g.getMonth()+1+g.getDate()+g.getFullYear()+g.getHours()+g.getMinutes()+g.getSeconds();n.IsNullOrWhiteSpace(s)&&(s=e+w),this.InitializeReportSettingModel(),c=t.isBrowserMode?t.ServiceUrl+i.POS+r.SAVEREPORT:t.ServiceUrl+i.POS+r.EXPORTREPORT,this.reportFileName=s.toString().toUpperCase();var P=this,v=this.CreateReportSettingParameters(u);this.transactionCode=s;var m=new o,R=function(e){if(n.IsNullOrWhiteSpace(a)&&P.AllowAutoAssignWorkstationID(p)&&n.Reporting.AssignWorkstationID(v,e),n.IsNullOrWhiteSpace(P.HasPOSWorkStationID(v))&&!n.IsNullOrWhiteSpace(a)&&P.AllowAutoAssignWorkstationID(p)&&n.Reporting.AssignPOSWorkstationID(v,e),!n.IsNullOrWhiteSpace(p)){var i=_.find(e.models,function(e){return"Type"===e.get("ColumnName")});i&&P.AssignTransactionType(p,v)}m.set({ServiceUri:d,ServiceContentUri:c,ReportName:u,UserName:t.Username,Password:t.Password,Parameters:v,IsEmail:!1,IsAirPrint:h.IsAirprint,RecipientEmailAddress:t.PrintOptions.EmailAddress,IsReportPreview:P.isPreview,IsGeneratedByReportingModule:!0}),P.ProcessGenerateReport(m,n.IsNullOrWhiteSpace(l))};n.Reporting.GetReportCriterias(R,this.genReportDatasource,u)},HasPOSWorkStationID:function(e){if(e.length>0)for(var t=0;t<e.length;t++)if("[POSWorkstationID]"==e.models[t].attributes.Name)return!0;return!1},AllowAutoAssignWorkstationID:function(e){var t=!1;switch(e){case N.SalesOrder:case N.Quote:case N.Sale:case N.Return:t=!0}return t},AssignTransactionType:function(e,t){var i=this.parameterCollection.find(function(e){return"Type"==e.get("ColumnName")});return n.IsNullOrWhiteSpace(i)&&t.add([{Name:"[Type]",Value:e}]),t},ReportPreviewError:function(){this.RemoveSpinner(),console.log("error")},RemoveSpinner:function(){$(v).hide()},PromtWarningMessage:function(e,t){if(n.IsNullOrWhiteSpace(e.WarningMessage))this.RemoveSpinner(),this.ReportSettingSaveSuccess(e);else{O=new o,O=t;var i="You are about to load "+this.reportName+" report with more than a thousand records. For better performance, we recommend applying proper data filter. Do you want to continue?";navigator.notification.confirm(i,b,"Print Preview",["Yes","No"])}},CancelApplyCriteria:function(){this.RemoveSpinner(),this.ClosePrintDialogView()},ClosePrintDialogView:function(){n.IsNullOrWhiteSpace(this.printdialogView)||(this.printdialogView.Close(),this.isLoaded=!0)},ProcessGenerateReport:function(e,i){console.log("Processing Generate Report"),$(v).show(),i?$(m).text("Loading..."):$(m).text("Loading this may take a while..."),this.ClosePrintDialogView();var r=this;this.skipValidateReport=i,this.reportModel=new o,this.reportModel=e,this.model.set({ServiceUri:e.get("ServiceUri"),ServiceContentUri:e.get("ServiceContentUri"),ReportName:e.get("ReportName"),UserName:t.Username,Password:t.Password,Parameters:e.get("Parameters"),IsEmail:!1,IsAirPrint:e.get("IsAirPrint"),RecipientEmailAddress:t.PrintOptions.EmailAddress,IsReportPreview:r.isPreview,IsGeneratedByReportingModule:!0,ReportFileName:r.reportFileName,IsSkipValidateReport:r.skipValidateReport}),this.model.url=e.get("ServiceContentUri"),this.model.on("error",this.ProccessGenerateReportOnError,this),this.model.on("sync",this.ProccessGenerateReportOnSuccess,this),this.model.save(null,{timeout:0})},ProccessGenerateReportOnSuccess:function(e,i,r){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.skipValidateReport?(this.ReportSettingSaveSuccess(i),this.RemoveSpinner()):this.PromtWarningMessage(i,this.reportModel)},ProccessGenerateReportOnError:function(e,i,r){var n="";switch(i.statusText){case"timeout":n="Request timed Out. Check internet settings and try again.";break;case"abort":n="Unable to process request. Please check your internet settings.";break;default:n="Unable to generate report. For better performance, we recommend applying proper data filter or try again using Connected Business."}t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.ReportPreviewError(),this.NoRecordFound(),this.ShowPreviewMessage(),$(C).hide(),this.ClosePrintDialogView(),navigator.notification.alert(n,null,"Unable to Generate report.","OK"),this.ClosePrintDialogView()},ReportSettingSaveSuccess:function(e){return t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.PrintOptions.CustomizePrint?this.isReceiptPrinter=!1:this.isReceiptPrinter=!0,n.IsNullOrWhiteSpace(e.ErrorMessage)?void this.PreviewReport_(e,this.transactionCode,"",this.isReceiptPrinter,!1):(navigator.notification.alert(e.ErrorMessage,null,"Unable to Generate Report","OK"),t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.ReportPreviewError(),this.NoRecordFound(),this.ShowPreviewMessage(),void $(C).hide())},CreateReportSettingParameters:function(e){var t=new p;return n.IsNullOrWhiteSpace(this.parameterCollection)||(t=this.ApplyReportParameters(t)),t},ApplyReportParameters:function(e){var t=e;return this.parameterCollection.length>0&&this.parameterCollection.each(function(e){t.add([{Name:"["+e.get("ColumnName")+"]",Value:e.get("CriteriaValue"),DataType:e.get("Type")}])}),this.parameterCollection.reset(),t},InitializePrintPreview:function(e,t){this.printView?($(R).show(),this.$("#print-area").show()):this.printView=new c({el:$("#previewContainer"),model:e,reportType:t}),$(f).html(""),$(f).append(this._printAreaTemplate())},PreviewReport_:function(e,i,r,o,s){this.$("#print-preview-container > tbody").html(""),t.Printer.isPrintedinPrinter=!1,this.DeletePreviousReport(),this.prevPages=e.Pages,t.prevPages=e.Pages,pages=e.Pages,t.prevTransactionCode=i,this.prevTransactionCode=i,t.ApplicationType="Reports",this.InitializePrintPreview(i,r),1==t.Preference.IsAirprint?this.printView.IsReceiptPrinter=!1:this.printView.IsReceiptPrinter=!0,this.printView.IsWorkStation=s||!1,0!=t.Preference.IsAirprint||this.IsNullOrWhiteSpace(t.IsGenerateReport)||t.isBrowserMode||n.Printer.ReleasePrinterObjects(),this.printView.Show(e,i,r),t.isBrowserMode&&($("#print-area").html("<iframe id='printFrame' src='"+t.ServiceUrl+"/Reports/ReportViewer.aspx?transactionCode="+i+"'></iframe>"),$("#printFrame").show(),$("#print-preview-container").hide()),t.IsGenerateReport=!0,t.HasPrevReport=!0,this.isLoaded=!0,this.NoPreviewAvailable(e.Pages)},NoPreviewAvailable:function(e){0==e?(this.ShowPreviewMessage("Preview Not Available"),this.noPreview=!0,t.isBrowserMode?$("#printFrame").hide():$(C).hide()):t.isBrowserMode||$(C).show()},IsNullOrWhiteSpace:function(e){return!e||(""===e||null===e||void 0===e)},DeletePreviousReport:function(){this.IsNullOrWhiteSpace(t.HasPrevReport)||this.IsNullOrWhiteSpace(this.prevTransactionCode)||1==t.HasPrevReport&&(n.Printer.DeleteReport(this.prevPages,this.prevTransactionCode),0!=t.Preference.IsAirprint||this.IsNullOrWhiteSpace(t.IsGenerateReport)||t.isBrowserMode||n.Printer.ReleasePrinterObjects())},ShowPreviewMessage:function(e){$(S+"> span").removeClass("icon-ban-circle"),$(S+"> span").removeClass("icon-bar-chart"),this.IsNullOrWhiteSpace(e)?(e="No Record Found",$(S+" > p").text(e),$(S+"> span").addClass("icon-ban-circle")):($(S+" > p").text(e),$(S+"> span").addClass("icon-bar-chart")),$(S).show()},NoRecordFound:function(){this.$("#print-area").hide(),$(R).hide()},TogglePrintPreview:function(e){var t=$("#btn-printPreview > span"),i=t.hasClass("icon-fullscreen");e.preventDefault(),this.trigger("togglePreview",i)},RefreshScroll:function(){this.printView.RefreshMyScroll()}}),b=function(e){1===e?I.ProcessGenerateReport(O,!0):I.CancelApplyCriteria()};return A});