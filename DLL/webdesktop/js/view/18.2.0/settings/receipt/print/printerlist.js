define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","view/18.2.0/settings/receipt/print/printerlistvalue","text!template/18.2.0/settings/receipt/print/printerlist.tpl.html","js/libs/iscroll.js"],function(e,t,i,r,n,s,l,o){var c=r.View.extend({_template:i.template(o),initialize:function(){e("#settings-default-printer").remove(),this.render()},render:function(){e("#back-general").show(),this.$el.html(this._template),e("#right-pane-content").before(this._search),this.$el.trigger("create"),this.LoadPrinters(),n.isBrowserMode?s.ApplyListScroll():this.myScroll=new iScroll("scroll-wrapper"),this.SetSelected()},SetSelected:function(t){t&&this.collection.forEach(function(i){i.get("Printer")===t&&(e("<img class='ui-li-icon' style ='height:25px;width:27px;'/>").attr({src:"img/check@2x.png"}).prependTo(e("#"+i.cid)),e("#printer-list").listview("refresh"))})},LoadPrinters:function(){this.collection.forEach(function(e){this.LoadPrinterListValue=new l({model:e}),this.$("#printer-list").append(this.LoadPrinterListValue.render().el),this.$("#printer-list").listview("refresh")})}});return c});