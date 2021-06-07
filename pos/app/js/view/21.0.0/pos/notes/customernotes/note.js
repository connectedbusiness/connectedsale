/*
Owner        : Connected Business
created by   : Alexis A. Banaag Jr.
date created : 7/5/2013
*/
define([
  'jquery',
  'mobile',
  'backbone',
  'underscore',
  'text!template/21.0.0/pos/notes/customernotes/note.tpl.html'
], function($, $$, Backbone, _, NoteTemplate) {
  var NoteView = Backbone.View.extend({
    _noteTemplate: _.template(NoteTemplate),

    tagName: 'li',

    events: {
      "tap > div": "Selected",
      "swiperight": "showDeleteButton_swipe",
      "swipeleft": "showDeleteButton_swipe",
      "tap #delete-note": "ProcessDelete",
    },

    showDeleteButton_swipe: function(e) {
      e.stopPropagation();
      $(".deletebtn-overlay").hide();
      this.$(".deletebtn-overlay").show().fadeIn("slow");
    },

    render: function(model) {
      this.model = model;
      this.$el.html(this._noteTemplate(model.toJSON()));
      return this;
    },

    Selected: function(e) {
      e.stopPropagation();
      this.model.trigger("viewDetail", this.model);
    },

    ProcessDelete: function(e) {
      e.stopPropagation();
      this.model.trigger("removeNote", this.model);
    },
  });
  return NoteView;
})
