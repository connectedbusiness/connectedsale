define(["jquery","mobile","underscore","backbone","model/url","view/login/urlitem","text!template/login/url.tpl.html"],function(e,t,i,n,l,r,o){var s=n.View.extend({_template:i.template(o),initialize:function(){this.$el.html(this._template),this.render()},render:function(){this.collection.each(this.RenderItem,this),setTimeout(function(){e("#urlList").listview().listview("refresh")}),2500},RenderItem:function(t){var i=new r({model:t});e("#urlList").prepend(i.render().el),i.bindEvents()}});return s});