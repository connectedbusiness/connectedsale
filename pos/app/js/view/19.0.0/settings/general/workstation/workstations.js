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
  'view/19.0.0/settings/general/workstation/workstation',
  'text!template/19.0.0/settings/general/workstation/workstations.tpl.html',
  'text!template/19.0.0/settings/general/workstation/search.tpl.html',
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
      $("#settings-modal-content").before(this._search);
      this.$el.trigger('create');

      this.collection.each(this.LoadWorkstations, this);

      if (Global.isBrowserMode) Shared.ApplyListScroll();
      else this.myScroll = new iScroll('scroll-wrapper');

      $('#settings-workstation-input').attr('maxlength', '30'); //INTMOBA-852 - JHENSON
      $('#settings-workstation-input').val(Global.WorkstationValue);
    },

    LoadWorkstations: function(model) {
      this.workstationPreference = new WorkstationPreference({
        model: model
      });
      this.$("#workstationListPreference").append(this.workstationPreference.render().el);
      this.$("#workstationListPreference").listview("refresh");
    },

    SetSelected: function(workstationID){
      this.collection.each(function(workstation){        
        if (workstation.get("WorkstationID") === workstationID){
           $("<img class='ui-li-icon' style ='height:25px;width:27px;'/>").attr({
            src: "img/check@2x.png"
          }).prependTo($('#' + workstation.cid));
          $("#workstationListPreference").listview("refresh");
        }
      });
    }

  });
  return WorkstationsPreference;
});
