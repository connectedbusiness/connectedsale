define(["jquery","mobile","underscore","backbone","shared/shared","shared/global","view/19.2.0/settings/general/customer/customer","text!template/19.2.0/settings/general/customer/customerpage.tpl.html","text!template/19.2.0/settings/general/customer/search.tpl.html","js/libs/iscroll.js"],function(e,t,r,s,i,c,o,l,n){var a=s.View.extend({_template:r.template(l),_search:r.template(n),initialize:function(){e("#settings-customer-search").remove(),this.render()},render:function(){e("#back-general").show(),this.$el.html(this._template),e("#settings-modal-content").before(this._search),this.$el.trigger("create"),this.collection.each(this.LoadCustomer,this),c.isBrowserMode?i.ApplyListScroll():this.myScroll=new iScroll("scroll-wrapper")},LoadCustomer:function(e){var t=e.get("CustomerName");e.set({FormattedCustomerName:i.Escapedhtml(t)}),this.customerPreference=new o({model:e}),this.$("#customerListPreference").append(this.customerPreference.render().el),this.$("#customerListPreference").listview("refresh")},SetSelected:function(t){this.collection.each(function(r){r.get("CustomerCode")===t&&(e("<img class='ui-li-icon' style ='height:25px;width:27px;'/>").attr({src:"img/check@2x.png"}).prependTo(e("#"+r.cid)),e("#customerListPreference").listview("refresh"))})}});return a});