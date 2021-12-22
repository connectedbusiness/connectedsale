define(["jquery","mobile","underscore","backbone","bigdecimal","shared/enum","shared/global","shared/shared","text!template/20.1.0/secondarydisplay/cartitem.tpl.html","js/libs/format.min.js"],function(t,e,n,a,i,l,s,o,r){var d=a.View.extend({_template:n.template(r),tagName:"tbody",initialize:function(){this.model.bind("change",this.UpdateCart,this)},render:function(){return this.ManageBinding(),this.$el.html(this._template(this.model.toJSON())),this.$el.attr("id",this.cid),this.model.get("ItemType")!=l.ItemType.Kit?this.$el.find("#display-itemName").attr("style","width:100%; display: table-cell;"):this.$el.find("#display-kit").show().attr("style","display: table-cell; width: 20%; vertical-align: middle;"),this},AddCommas:function(t){t+="",x=t.split("."),x1=x[0],x2=x.length>1?"."+x[1]:"";for(var e=/(\d+)(\d{3})/;e.test(1);)x1=x1.replace(e,"$1,$2");return x1+x2},ManageBinding:function(){var t,e=!1,n=12,a=this.model.get("Outstanding"),i=1;switch(s.TransactionType){case l.TransactionType.SalesRefund:t=this.model.get("Good");break;default:t=this.model.get("QuantityOrdered"),a=0}var r=this.model.get("ItemName"),d="<br />",u="<br />";r=o.Escapedhtml(r);var h=this.model.get("CouponCode"),m=this.model.get("CouponDiscountRate");this.IsNullOrWhiteSpace(m)||(i=m.length),null==h||""===h.trim()?(d="",u="",m=""):(m&&("Percent"===this.model.get("CouponDiscountType")?m+=" %":m="("+m.toFixed(2)+")"),r.length>n&&(h=""+h),n=14);var c=!1,g=!1,p=format("#,##0.00",this.model.get("ExtPriceRate"));this.model.get("IsIncludedInCoupon")===!1&&s.CouponIncludeAll===!1&&(h=null,m=null,u="",e=!1),this.IsNullOrWhiteSpace(h)||(e=!0,g=!0);var f=s.WorkStationPreference.get("AllowTaxOnLineItems");1==f&&(e=!0),1==e&&(_cartAlign="top");var b=this.model.get("SalesTaxAmountRate"),x=format("#,##0.00",this.RoundNumber(b,2)),v="Sales Tax";this.IsNullOrWhiteSpace(x)||0==parseFloat(x)?(x="",v=""):c=!0;var y="none",C="none";1==g&&(C=""),1==c&&1==f?y="":1==g&&(u=""),this.model.set({FormattedItemName:r,Outstanding:a,QuantityDisplay:t,DisplayExtPriceRate:p,FormattedCouponCode:h,FormattedCouponDiscountAmount:m,ItemNameLineBreak:d,CouponDiscountLineBreak:u,TaxLabel:v,TaxAmount:x,ShowTax:y,ShowCoupon:C},{silent:!0})},RoundNumber:function(t,e){if(!t)return t;var n=format("0.0000",t),a=new i.BigDecimal(n);return parseFloat(1*a.setScale(e,i.MathContext.ROUND_HALF_UP))},IsNullOrWhiteSpace:function(t){return!t||(""===t||null===t||void 0===t)},FormatName:function(t){var e=t.replace(/\s+/g," ").trim(),n=e.indexOf(" "),a=e.split(" "),i=12,l=24,s=[],o="<br />";if(e.length>i&&(n>i||n===-1))s[0]=e.substr(0,i-1),s[1]=t.substr(i-1,e.length);else{var r=0,d=a;s[0]="";for(var u=0;u<d.length;u++)if(r<l){if(a[u].length>i){s[0]=s[0]+d[u].substr(0,i)+o;var h=d[u].substr(i,d[u].length);d[u+1]=h+d[u+1]}else s[0]=s[0]+d[u]+" ";r=s[0].length;var m=u}m===a.length?s[0]=s[0]:m<a.length?s[0]=s[0].substr(0,l-3)+"...":s[0]=s[0].substr(0,l-3)+"..."}var c="";return c=s[0],void 0!==s[1]&&(console.log("in"),s[1].length>i-3?c=c+o+s[1].substr(0,i-3)+"...":c+=s[1]),console.log(c),c},UpdateCart:function(){this.render()}});return d});