define(["jquery","mobile","underscore","backbone","text!template/18.2.0/pos/itemdetail/freestock.tpl.html"],function(e,t,i,a,n){var r=a.View.extend({_template:i.template(n),tagName:"ul",className:"freestock-container",attributes:{"data-role":"listview","data-inset":"true"},render:function(e){var t=this;return t.$el.html(""),e.each(function(e){if(e.get("IsActive")){var i=e.get("UnitMeasureQty"),a=e.get("FreeStock");a/=i;var n=a.toString().split(".");a=n[1]>0?a.toFixed(2):parseFloat(a),e.set({FreeStock:a}),t.$el.append(t._template(e.toJSON()))}}),this},UnbindView:function(){this.unbind()}});return r});