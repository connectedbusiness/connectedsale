define(["backbone","shared/global","shared/service","shared/method","shared/shared","model/base","collection/base","text!template/20.1.0/pos/item/upcitem/upcitem.tpl.html"],function(t,e,i,s,n,l,a,o){var c=t.View.extend({_template:_.template(o),BindEvents:function(){var t=this;$(this.classID.CID).on("tap",function(){t.SelectedItem()})},initialize:function(){this.InitializeFreeStock(this.model),this.classID={CID:" #"+this.cid+" ",ModelID:this.cid,OptionVal:!1},this.render()},render:function(){var t=this;return this.model.set({ModelID:t.cid,CurrencySymbol:e.CurrencySymbol}),this.$el.append(this._template(this.model.toJSON())),this},InitializeFreeStock:function(t){var e=t.get("UnitMeasureQty"),i=t.get("FreeStock");i/=e;var s=i.toString().split(".");i=s[1]>0?i.toFixed(2):parseFloat(i),t.set({UnitsInStock:i},{silent:!0})},InitializeChildViews:function(){this.BindEvents()},SelectedItem:function(){this.classID.OptionVal=n.CustomCheckBoxChange(this.classID.CID+" #chkOption",this.classID.OptionVal),this.model.set({IsSelected:this.classID.OptionVal}),this.trigger("UpdateItemState",this.model)}});return c});