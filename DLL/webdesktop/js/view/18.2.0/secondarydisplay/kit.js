define(["jquery","mobile","underscore","backbone","shared/global","shared/enum","collection/base","view/18.2.0/secondarydisplay/kitItem","text!template/18.2.0/secondarydisplay/kit.tpl.html"],function(t,e,i,n,s,l,a,r,d){return n.View.extend({template:i.template(d),tagName:"tbody",initialize:function(){this.$el.html(this.template({id:this.options.id})),this.$el.attr("id","kit-"+this.options.id),this.$el.attr("class","cartKitDetails"),this.$el.attr("style","box-shadow:0px 8px 7px #CFCFCF inset;"),s.TransactionType==l.TransactionType.SalesRefund&&(this.$el.find("#kit-edit").hide(),this.$el.find("#items").attr("colspan",8),this.$el.find("#summary").attr("colspan",8))},renderItems:function(){var t=this.collection.length;this.collection.each(this.renderItem,this),this.$el.find("#summary").find("div:first-child").html(t+" item(s)")},renderItem:function(t,e){t.set("LineNum",e+1);var i=new r({model:t});this.$el.find("#items").append(i.render().el)},render:function(){return setTimeout(function(){this.renderItems()}.bind(this),100),this}})});