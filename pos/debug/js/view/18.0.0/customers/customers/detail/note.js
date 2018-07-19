/*
owner        : Connected Business
created by   : Alexis A. Banaag Jr.
date created : 7/8/2013
*/

define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/shared',
  'text!template/16.0.0/customers/customers/detail/note.tpl.html'
], function($, $$, _, Backbone, Shared, NoteTemplate) {
  var NoteView = Backbone.View.extend({
    _noteTemplate: _.template(NoteTemplate),

    initialize: function() {
      this.$el.show();
    },

    render: function() {
      if (this.IsNoRecord && !this.IsNew) {
        this.$el.html("");
        this.DisplayNoRecordFound();
        $("#customers-details").removeClass("addmode");
        $("#paddingRight").addClass("ui-disabled");
      } else this.$el.html(this._noteTemplate);
      return this;
    },

    AddMode: function() {
      this.IsNew = true;
      Shared.Customers.Overlay.Hide();
      this.render();
      this.BindData(this.IsNew);
      $("#newcustomer-title").text("New Note");
    },

    BindData: function(addMode) {
      switch (addMode) {
        case true:
          $("#note-title").text("New Note");
          $("#note-code i").text("[To be generated]");
          break;
        default:
          if (this.model != null || this.model != undefined) {

            $("#note-title").html(this.model.get("FormattedName"));
            $("#note-code i").html(this.model.get("NoteCode"));
            $("#data-title-name").val(this.model.get("Title"));
            $("#data-noteText-name").val(this.model.get("NoteText"));
          }
          break;
      }

    },

    DisplayNoRecordFound: function() {
      Shared.Products.DisplayNoRecordFound("#detail-body", ".list-wrapper", this.toBeSearched);
    },

    FormatNoteTitle: function() {
      if (this.model) {
        if (this.model.get("Title").length > 40) {
          var _formattedTitle = this.model.get("Title").substr(0, 41) + "...";
        } else var _formattedTitle = this.model.get("Title");

        this.model.set({
          FormattedName: Shared.Escapedhtml(_formattedTitle)
        });
      }
    },

    GetUpdatedModelAttributes: function() {
      var noteText = $("#data-noteText-name").val();
      var noteTitle = $("#data-title-name").val();
      var noteCode = "";

      if (this.model != null || this.model != undefined) {

        if (!this.IsNew) noteCode = this.model.get("NoteCode");

        this.model.set({
          NoteText: noteText,
          Title: noteTitle,
          NoteCode: noteCode
        });
        return this.model.attributes;
      } else {
        var noteAttrib = {
          NoteText: noteText,
          Title: noteTitle,
          EntityCode: this.entityCode,
          ContactCode: this.contactCode,
          NoteCode: ""
        };


        return noteAttrib;
      }
    },

    Show: function() {
      this.FormatNoteTitle();
      this.render();
      this.BindData();
    },

    ValidData: function() {
      var noteText = $("#data-noteText-name").val();
      var noteTitle = $("#data-title-name").val();
      var msg = "";

      if (noteTitle != "") return true;
      else msg = "Please fill up all fields in order to complete note";


      Shared.Customers.ShowNotification(msg, true);
      return false;
    }
  });
  return NoteView;
});
