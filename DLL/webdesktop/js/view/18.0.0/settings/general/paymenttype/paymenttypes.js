define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","view/16.0.0/settings/general/paymenttype/paymenttype","text!template/16.0.0/settings/general/paymenttype/paymenttypes.tpl.html","text!template/16.0.0/settings/general/paymenttype/search.tpl.html","js/libs/iscroll.js"],function(e,t,i,n,s,r,l,a,p){var c=n.View.extend({_template:i.template(a),_search:i.template(p),initialize:function(){e("#settings-paymenttype-search").remove(),this.render()},render:function(){e("#back-general").show(),this.$el.html(this._template),this.$el.trigger("create"),this.collection&&this.collection.each(this.LoadPaymentType,this),s.isBrowserMode?r.ApplyListScroll():this.myScroll=new iScroll("scroll-wrapper")},LoadPaymentType:function(e){var t=new l({model:e});this.$("#paymenttypesListPreference").append(t.render().el),this.$("#paymenttypesListPreference").listview("refresh")},SetSelected:function(t){this.collection.each(function(i){i.get("PaymentTypeCode")===t&&(e("<img class='ui-li-icon' style ='height:25px;width:27px;top:7px;'/>").attr({src:"img/check@2x.png"}).prependTo(e("#"+i.cid)),e("#paymenttypesListPreference").listview("refresh"))})}});return c});