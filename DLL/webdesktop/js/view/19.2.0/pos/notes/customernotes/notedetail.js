define(["jquery","mobile","backbone","underscore","text!template/19.2.0/pos/notes/customernotes/notedetail.tpl.html"],function(e,t,i,n,l){var o=i.View.extend({_noteDetailTemplate:n.template(l),initialize:function(){this.render()},render:function(){this.$el.html(this._noteDetailTemplate(this.model.toJSON())),this.$el.trigger("create")}});return o});