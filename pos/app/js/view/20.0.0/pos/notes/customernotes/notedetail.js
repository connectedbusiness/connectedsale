/*
owner        : Connected Business
created by   : Alexis A. Banaag Jr.
date created : 7/5/2013
*/
define([
  'jquery',
  'mobile',
  'backbone',
  'underscore',
  'text!template/20.0.0/pos/notes/customernotes/notedetail.tpl.html'
], function($, $$, Backbone, _, NoteDetailTemplate) {
  var NoteDetailView = Backbone.View.extend({
    _noteDetailTemplate: _.template(NoteDetailTemplate),

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html(this._noteDetailTemplate(this.model.toJSON()));
      this.$el.trigger("create");
    }
  });
  return NoteDetailView;
})
