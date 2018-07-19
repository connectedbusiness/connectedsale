/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'view/15.0.0/settings/general/workstation/workstation',
  'text!template/15.0.0/settings/general/workstation/workstations.tpl.html',
  'text!template/15.0.0/settings/general/workstation/search.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Shared, WorkstationPreference, template, searchTemplate) {
  var WorkstationsPreference = Backbone.View.extend({
    _template: _.template(template),
    _search: _.template(searchTemplate),

    initialize: function() {
      $("#settings-workstation-container").remove();
      this.render();
    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);
      $("#right-pane-content").before(this._search);
      this.$el.trigger('create');

      this.collection.each(this.LoadWorkstations, this);

      if (Global.isBrowserMode) Shared.ApplyListScroll();
      else this.myScroll = new iScroll('right-pane-content');

      $('#settings-workstation-input').attr('maxlength', '30'); //INTMOBA-852 - JHENSON
      $('#settings-workstation-input').val(Global.WorkstationValue);
    },

    LoadWorkstations: function(model) {
      this.workstationPreference = new WorkstationPreference({
        model: model
      });
      this.$("#workstationListPreference").append(this.workstationPreference.render().el);
      this.$("#workstationListPreference").listview("refresh");
    }
  });
  return WorkstationsPreference;
});
