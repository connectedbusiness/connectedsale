define(["jquery","mobile","underscore","backbone","text!template/20.1.0/pos/item/search/freestock.tpl.html"],function(e,t,i,o,r){var n=o.View.extend({_template:i.template(r),initialize:function(){this.render()},render:function(){this.model.get("IsActive")&&(e("#list-detail-content").append(this._template(this.model.toJSON())),e("#list-detail-content").listview("refresh"),e("#detail-bottom-wrapper").css("overflow","hidden"),e("#detail-bottom-wrapper").css("height","353px"),e("#detail-bottom-wrapper").css("position","relative"))}});return n});