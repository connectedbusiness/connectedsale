define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","view/20.0.0/settings/receipt/typelist/receipttypevalue","text!template/20.0.0/settings/receipt/typelist/receipttypelist.tpl.html","text!template/20.0.0/settings/receipt/typelist/search.tpl.html","js/libs/iscroll.js"],function(e,t,i,r,l,s,c,p,n){var h=r.View.extend({_template:i.template(p),_search:i.template(n),initialize:function(){e("#settings-report-search").remove(),this.render()},render:function(){e("#back-general").show(),this.$el.html(this._template),e("#right-pane-content").before(this._search),this.$el.trigger("create"),this.collection.each(this.LoadReceiptTypeValue,this),l.isBrowserMode?s.ApplyListScroll():this.myScroll=new iScroll("scroll-wrapper"),this.SetSelected()},SetSelected:function(t){this.collection.each(function(i){i.get("ReportCode")===t&&(e("<img class='ui-li-icon' style ='height:25px;width:27px;'/>").attr({src:"img/check@2x.png"}).prependTo(e("#"+i.cid)),e("#receipt-list-preference").listview("refresh"))})},LoadReceiptTypeValue:function(e){this.ReceiptTypeValuePref=new c({model:e}),this.$("#receipt-list-preference").append(this.ReceiptTypeValuePref.render().el),this.$("#receipt-list-preference").listview("refresh")}});return h});