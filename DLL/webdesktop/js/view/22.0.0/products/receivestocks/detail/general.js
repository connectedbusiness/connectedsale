define(["jquery","mobile","underscore","backbone","shared/global","view/19.0.0/products/receivestocks/detail/inventoryitemlist","text!template/19.0.0/products/receivestocks/detail/general.tpl.html","js/libs/moment.min.js"],function(t,e,i,n,a,o,s){var r,l=n.View.extend({_template:i.template(s),initialize:function(){this.render(),this.InitializeTransactionDate()},render:function(){this.$el.html(this._template(this.model.toJSON())),a.FormHasChanges=!1,a.IsSaveChanges=!1,r=this},InitializeInventoryItemList:function(){new o({el:t("#inventoryItems-area"),model:this.model})},InitializeTransactionDate:function(){var t="L",e=moment(this.model.get("TransactionDate")).format(t);this.$("#transactionDate").val(this.JSONtoDate(e)),this.InitializeInventoryItemList()},JSONtoDate:function(t){var e=a.isBrowserMode?"YY-MM-DD":"YYYY-MM-DD",i=moment(t).format(e);return i}});return l});