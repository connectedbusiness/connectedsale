define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/base","text!template/21.0.0/customers/customers/detail/report.tpl.html","js/libs/iscroll.js"],function(e,t,r,o,i,n,a,s,c,d){var u=o.View.extend({_reportTemplate:r.template(d),CustomerCode:"",events:{"tap #sale-autoprint, #order-autoprint, #quote-autoprint, #return-autoprint, #credit-card-autoprint":"checkbox_tap","change #sale-report-code, #order-report-code, #quote-report-code, #return-report-code, #credit-card-report-code":"reportCode_changed"},IsNew:!1,initialize:function(){this.$el.show()},render:function(){return this.onLoad=!0,this.$el.html(this._reportTemplate()),this},Show:function(){this.InitializeReportSetting(),this.render(),this.RefreshiScroll()},EnableRow:function(e,t){e.removeClass("disabled"),t||e.addClass("disabled"),e.find(".printer select").prop("disabled",!t),e.find(".copies input").prop("disabled",!t),e.find(".autoprint input").prop("disabled",!t)},RenderReportData:function(t){var o=this;t?r.each(t,function(t){var r;switch(t.TransactionType){case"InvoiceReportCode":r=e("#sale-row");break;case"OrderReportCode":r=e("#order-row");break;case"QuoteReportCode":r=e("#quote-row");break;case"ReturnReportCode":r=e("#return-row");break;case"CreditCardReportCode":r=e("#credit-card-row")}r&&(r.find(".report-code select").val(t.ReportCode),t.ReportCode?(r.find(".printer select").val(t.Printer),r.find(".copies input").val(t.Copies),r.find(".autoprint input").prop("checked",t.IsAutoPrint),s.CustomCheckBoxChange("#"+r.find(".autoprint .custom-check").prop("id"),!t.IsAutoPrint),o.EnableRow(r,!0)):o.EnableRow(r,!1))}):e(".table-customer-report tbody tr").each(function(t,r){o.EnableRow(e(r),!1)}).toArray()},InitializeReportSetting:function(){this.InitializeAvailablePrinters(),this.InitializeReceiptSelections(),this.InitializeData()},InitializeData:function(){var e=this,t=new c;t.url=i.ServiceUrl+n.POS+a.LOADCUSTOMERPOSREPORT+"?workstationID="+i.Preference.WorkstationID+"&customerCode="+this.CustomerCode,t.fetch({success:function(t,r,o){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.customerPOSReports=r.CustomerPOSReports,e.RenderReportData(e.customerPOSReports)},error:function(e,t,r){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(error,"Error Loading Customer Report Settings","An error was encountered when trying to load.")}})},InitializeAvailablePrinters:function(){printerTool.getPrinters().then(function(t){t=t||{},t.unshift(""),t.forEach(function(t){e(".table-customer-report .printer select").append(e("<option>",{selected:!1,value:t,text:t}))})})},InitializeReceiptSelections:function(){var t=new c;t.url=i.ServiceUrl+n.POS+a.REPORTCODELOOKUP+"CustomerReport/100";var r=this,o=function(t,r,o){r.append(e("<option>",{value:"",text:""})),t.filter(o).forEach(function(t){r.append(e("<option>",{selected:!1,value:t.ReportCode,text:t.ReportName}))})};t.save(null,{success:function(t,n){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator();var a=n.ReportViews||[];o(a,e("#sale-report-code"),function(e){return"invoice"==e.SubCategory.toLowerCase()}),o(a,e("#order-report-code"),function(e){return"sales order"==e.SubCategory.toLowerCase()}),o(a,e("#quote-report-code"),function(e){return"quote"==e.SubCategory.toLowerCase()}),o(a,e("#return-report-code"),function(e){return"refund"==e.SubCategory.toLowerCase()||"credit memo"==e.SubCategory.toLowerCase()}),o(a,e("#credit-card-report-code"),function(e){return"credit card"==e.SubCategory.toLowerCase()}),r.RenderReportData(r.customerPOSReports)},error:function(e,t,r){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Retrieving Report Codes")}})},InitializeModelsAndCollections:function(){},RefreshiScroll:function(){},ValidData:function(){return this.GetUpdatedModelAttributes(),!0},GetUpdatedModelAttributes:function(){var t=e(".table-customer-report tbody tr").map(function(t,r){var o=e(r),i=parseInt(o.find(".copies input").val());return{ReportCode:o.find(".report-code select").val(),TransactionType:o.attr("data-row-transaction"),Printer:o.find(".printer select").val(),Copies:isNaN(i)?0:i,IsAutoPrint:o.find(".autoprint input").is(":checked")}}).toArray();return this.model.set({CustomerPOSReports:t,WorkstationID:i.Preference.WorkstationID,CustomerCode:this.CustomerCode}),this.model.attributes},checkbox_tap:function(t){var r=e(t.srcElement).closest("tr").find(".report-code select").val();if(r){var o=e(t.srcElement).find("input")[0];o.checked=s.CustomCheckBoxChange("#"+t.srcElement.id,o.checked)}},reportCode_changed:function(t){var r=e(t.srcElement).val();this.EnableRow(e(t.srcElement).closest("tr"),""!=r)}});return u});