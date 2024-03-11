/**
 * Connected Business | 07-09-2012
 * Required: model
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/24.0.0/settings/manager/administrator.tpl.html',
], function($, $$, _, Backbone, template) {
  var ItemView = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',
    events: {
      "click": "Selected"
    },

    render: function() {
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    Selected: function() {        
      var _elementID = this.model.get("EditedRoleCode")
      var _selected = this.GetCheckState();
      this.model.set({
        Selected: !_selected
      })

      this.trigger("Selected", this.model.get("Selected"), this.model.get("RoleCode"));
    },  

    GetCheckState: function(){      
      return this.$el.find(".settings-manager-checkbox").hasClass('icon-ok-sign') ? true : false;
    },  

    



  });
  return ItemView;
});
