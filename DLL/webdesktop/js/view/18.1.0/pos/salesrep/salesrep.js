define(["jquery","mobile","underscore","backbone","shared/global","shared/enum","shared/service","shared/method","shared/shared","collection/salesreps","collection/base","view/18.1.0/pos/salesrep/salesrepdetail","text!template/18.1.0/pos/item/header-info/salesrep/salesreplist.tpl.html","js/libs/iscroll.js"],function(e,t,s,l,i,o,r,n,a,c,h,d,p){return l.View.extend({template:s.template(p),events:{"click #done-salesrep":"close"},close:function(t){t.preventDefault();var l=this.SelectedSalesRepCollection.reduce(function(e,t){return e+parseFloat(t.get("RepSplit"))},0);if(this.salesrepscollection.length>0)if(100==l){var o="",r="",n=this.SelectedSalesRepCollection.pluck("RepSplit");n.length>1?s.each(n,function(e,t){r+=t>=n.length-1?e+"%":e+"%, ",t++}):r=n;var c=this.SelectedSalesRepCollection.pluck("SalesRepGroupName");s.each(c,function(e,t){o+=t>=c.length-1?e:e+", ",t++}),i.SalesRepGroupName=o,i.RepSplit=r,i.CurrentCustomer.CurrentSalesRep=this.SelectedSalesRepCollection.models,i.SalesRepList=this.SelectedSalesRepCollection.models,e("#lbl-salesrepName").html(a.TrimSalesRepName()),e("#splitrateName").html(a.TrimCommissionPercent()),e("#main-transaction-blockoverlay").hide(),this.unbind(),this.remove()}else navigator.notification.alert("Commission Total must be equal to 100%.",null,"Action Not Allowed","OK");else e("#main-transaction-blockoverlay").hide(),this.unbind(),this.remove()},initialize:function(){this.SelectedSalesRepCollection=new h,this.rows=this.options.rows,this.$el.html(this.template),this.LoadSalesRep(),this.salesRepList=this.$el.find("#salesrep-list")},render:function(){return this},LoadSalesRep:function(){this.salesrepscollection=new c,this.salesrepscollection.on("reset",this.RenderSalesRepList,this),this.salesrepscollection.on("error",this.LoadSalesRepError,this),this.salesrepscollection.on("selected",this.SetSelected,this),this.salesrepscollection.on("unselected",this.SetUnSelected,this);var e="?rows="+this.rows;this.salesrepscollection.url=i.ServiceUrl+r.CUSTOMER+n.SALESREPLOOKUP+e,this.salesrepscollection.fetch()},RenderSalesRepList:function(e){this.trigger("hideSpinner"),i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.each(this.RenderSalesRep,this),this.$el.find("ul").listview().listview("refresh"),this.loadScroll()},RenderSalesRep:function(e){var t=new d({model:e});t.on("onEditMode",this.processEditMode,this),this.$el.find("#salesrep-list").append(t.render().el),t.SetSelected(e.cid)},LoadSalesRepError:function(e,t,s){i.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),navigator.notification.alert("Error loading Sales Rep",null,"Error","OK")},loadScroll:function(){this.scrollAttrib={vScrollbar:!1,vScroll:!0,snap:!1,momentum:!0,hScrollbar:!0,onBeforeScrollStart:function(e){for(var t=e.target;1!=t.nodeType;)t=t.parentNode;"INPUT"!=t.tagName&&e.preventDefault()}},i.isBrowserMode?a.UseBrowserScroll("#salesrep-list"):this.myScroll?this.myScroll.refresh():this.myScroll=new iScroll("salesrep-content",this.scrollAttrib)},SetSelected:function(e){this.SelectedSalesRepCollection.add(e)},SetUnSelected:function(e){this.SelectedSalesRepCollection.remove(e)},processEditMode:function(e){this.$el.find("ul").listview().listview("refresh"),this.salesRepList.find("li:not(#"+e+")").find("#changeCommission-input").hide(),this.salesRepList.find("li:not(#"+e+")").find("#commission-display").show()}})});