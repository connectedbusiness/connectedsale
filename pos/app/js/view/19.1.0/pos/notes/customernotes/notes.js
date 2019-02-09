/*
Owner        : Connected Business
created by   : Alexis A. Banaag Jr.
Date Created : 7/5/2013
*/
define([
  'jquery',
  'mobile',
  'backbone',
  'underscore',
  'shared/global',
  'shared/shared',
  'view/19.1.0/pos/notes/customernotes/note',
  'text!template/19.1.0/pos/notes/customernotes/notes.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, Backbone, _, Global, Shared, NoteView, NotesListTemplate) {

  var NotesListView = Backbone.View.extend({

    _notesListTemplate: _.template(NotesListTemplate),

    initialize: function() {
      this.CheckBindings();
      this.collection.on('reset', this.LoadNotes, this);
      this.render();
    },

    render: function() {
      this.$el.html(this._notesListTemplate);
      $("#noteList-content").trigger("create");
    },

    CheckBindings: function() {
      if (this.collection._callBacks != null || this.collection._callBacks != undefined) this.collection.unbind();
    },

    DisplayNoRecord: function() {
      Shared.Products.DisplayNoRecordFound("#noteList-content", null, "");
    },

    LoadNotes: function() {
      if (this.collection.length > 0) {
        this.collection.each(this.RenderNote, this);
        $("#customerNoteListContainer").listview("refresh");
        this.LoadScroll();
      } else {
        this.$("#noteList-content").html("");
        this.DisplayNoRecord();
      }

    },

    LoadScroll: function() {
      if (Global.isBrowserMode) {
        Shared.UseBrowserScroll('#noteList-content');
      } else {
        if (this.myScroll) this.myScroll.refresh()
        else this.myScroll = new iScroll('noteList-content', {
          hScroll: false
        });
      }

    },

    RenderNote: function(note) {
      var noteView = new NoteView();
      $("#customerNoteListContainer").prepend(noteView.render(note).el);
    }
  });
  return NotesListView;
})
