define(["jquery","mobile","underscore","backbone","shared/global","shared/enum","collection/base","view/15.1.0/pos/cart/kititem","text!template/15.1.0/pos/cart/kit.tpl.html"],function(t,e,i,n,s,a,r,l,o){return n.View.extend({template:i.template(o),tagName:"tbody",initialize:function(){this.$el.html(this.template({id:this.options.id})),this.$el.attr("id","kit-"+this.options.id),this.$el.attr("class","cartKitDetails"),this.$el.attr("style","display:none; background: #E1E1E1; box-shadow:0px 8px 7px #CFCFCF inset;"),s.TransactionType==a.TransactionType.SalesRefund&&(this.$el.find("#kit-edit").hide(),this.$el.find("#items").attr("colspan",8),this.$el.find("#summary").attr("colspan",8))},render:function(){var t=this;return setTimeout(function(){t.renderItems()},100),this},renderItems:function(){var t=i.flatten(JSON.parse(window.sessionStorage.getItem("kitItems-"+this.options.lineNum))),e=new r(t);e.each(this.renderItem,this),this.$el.find("#summary").find("div:first-child").html(e.length+" item(s)")},renderItem:function(t,e){t.set("LineNum",e+1);var i=new l({model:t});this.$el.find("#items").append(i.render().el)}})});