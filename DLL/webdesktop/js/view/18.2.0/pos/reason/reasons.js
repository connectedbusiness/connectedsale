define(["jquery","mobile","underscore","backbone","view/18.2.0/pos/reason/reason","text!template/18.2.0/pos/reason/reasons.tpl.html"],function(e,n,t,a,i,r){var s=a.View.extend({_template:t.template(r),initialize:function(){},render:function(n){this.$el.html(this._template),e("#save-reason").addClass("ui-disabled"),this.$el.trigger("create"),n.each(this.LoadReasonView,this),this.myScroll=new iScroll("reasonList")},LoadReasonView:function(n){var t=new i({model:n});e("#reason-container").append(t.render().el),e("#reason-container").listview("refresh")}});return s});