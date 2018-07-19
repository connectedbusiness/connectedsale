/*
 author: Alexis A. Banaag Jr.
 date  : 6/27/2013
 title : Order Notes View Controller
*/
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'shared/enum',
  'text!template/15.0.1/pos/notes/notescontrol.tpl.html',
  'text!template/15.0.1/pos/notes/salesordernotes.tpl.html',
  'text!template/15.0.1/pos/notes/lineitemnotes.tpl.html',
  'text!template/15.0.1/pos/notes/customernotes/customernotes.tpl.html'
], function($, $$, _, Backbone,
  Global, Shared, Enum,
  MainControlTemplate, OrderNotesTemplate, LineItemNoteTemplate, CustomerNoteTemplate) {

  var NotesControlView = Backbone.View.extend({
    _mainControlTemplate: _.template(MainControlTemplate),
    _orderNotesTemplate: _.template(OrderNotesTemplate),
    _lineItemNoteTemplate: _.template(LineItemNoteTemplate),
    _customerNoteTemplate: _.template(CustomerNoteTemplate),

    events: {
      "tap #done-ordernotes": "closeOrderNotes_tap",
      "tap #save-ordernotes": "saveOrderNotes_tap",
      "tap #cancel-ordernotes": "clearOrderNotes_tap"
    },

    clearOrderNotes_tap: function(e) {
      e.preventDefault();
      $("#ordernotes-textarea").val("");
    },

    closeOrderNotes_tap: function(e) {
      e.preventDefault();
      this.CloseOrderNotes();
    },

    saveOrderNotes_tap: function(e) {
      e.preventDefault();
      var toBeSaved = "";
      var noteText = $("#ordernotes-textarea").val();
      var noteTitle = $("#ordernotes-input").val();


      switch (this.type) {
        case Global.NoteType.Customer:
          if (!Shared.IsNullOrWhiteSpace(noteTitle) && !Shared.IsNullOrWhiteSpace(noteText)) {
            toBeSaved = {
              NoteText: noteText,
              Title: noteTitle,
              ContactCode: this.model.get("DefaultContact") || this.model.get("ContactCode"),
              EntityCode: this.model.get("CustomerCode") || this.model.get("EntityCode"),
              NoteCode: this.model.get("NoteCode") || ""
            };
          } else {
            navigator.notification.alert("Please fill up all required fields in order to complete the note.", null, "Missing Fields", "OK");
            return;
          }
          break;
        case Global.NoteType.LineItem:
          if (!Shared.IsNullOrWhiteSpace(noteText)) {
            toBeSaved = noteText;
          } else {
            navigator.notification.alert("Please fill up all required fields in order to complete the note.", null, "Missing Fields", "OK");
            return;
          }
          break;
        default:
          toBeSaved = noteText;
          break;
      }

      this.ProcessSavingOfOrderNotes(this.type, toBeSaved);
    },

    initialize: function() {
      this.type = this.options.type;
      this.note = this.options.note;
      this.maintenance = this.options.maintenanceType;
      this.render();
      this.ToggleButtons();
      this.ToggleOverlay();
    },

    render: function() {
      this.ProcessRenderNoteType(this.type, this.maintenance);
    },

    /*
			method  : CloseOrderNotes
			purpose : Remove and unbind NoteControlView
			*/
    CloseOrderNotes: function() {
      this.remove();
      this.unbind();
      //$("#main-transaction-blockoverlay").removeClass("z2990");
      this.ToggleOverlay(true);
    },

    ProcessRenderNoteType: function(type, maintenance) {
      var toBeDisplayed = "To be generated";
      var maintenanceType = "";

      switch (maintenance) {
        case Global.MaintenanceType.CREATE:
          maintenanceType = "Add";
          break;
        case Global.MaintenanceType.UPDATE:
          maintenanceType = "Edit";
          break;
      }

      if (this.model) {
        switch (type) {
          case Global.NoteType.Customer:
            toBeDisplayed = this.customerName = this.model.get("CustomerName");
            break;
          case Global.NoteType.LineItem:
            toBeDisplayed = this.itemName = this.model.get("ItemName");
            break;
          case Global.NoteType.OrderNotes:
            if (this.model.get("SalesOrderCode")) {
              toBeDisplayed = this.model.get("SalesOrderCode");
            }
            break;
        }
      }

      this.RenderNoteType(type, toBeDisplayed, maintenanceType);
    },

    /*
			method  : ProcessSavingOfOrderNotes
			purpose : retrieve user input data
			*/
    ProcessSavingOfOrderNotes: function(type, data) {
      switch (type) {
        case Global.NoteType.Customer:
          this.trigger("customerNotesSaved", data, this.maintenance, this.model, this);
          break;
        default:
          this.trigger("orderNotesSaved", data, type, this.model, this);
          break;
      }

    },

    /*
			method  : RenderNoteType
			purpose : Render specific Note Type (customer, lineItem or order notes)
			*/
    RenderNoteType: function(type, data, maintenanceType) {
      this.$el.html(this._mainControlTemplate({
        FormHeader: maintenanceType
      }));


      switch (type) {
        case Global.NoteType.Customer:
          this.$("#ordernotes-inner").html(this._customerNoteTemplate({
            CustomerName: data,
            Title: this.model.get("Title"),
            NoteText: this.model.get("NoteText"),
            FormHeader: maintenanceType,
            TransactionType: Global.TransactionType
          }));
          break;
        case Global.NoteType.LineItem:
          this.$("#ordernotes-inner").html(this._lineItemNoteTemplate({
            ItemName: data,
            Note: this.model.get("ItemDescription"),
            FormHeader: maintenanceType,
            TransactionType: Global.TransactionType
          }));
          break;
        case Global.NoteType.OrderNotes:
          if (this.model) {
            if (this.note.PublicNotes != "") {
              var note = this.note.PublicNotes;
            } else {
              var note = this.model.get("PublicNotes")
            }
          } else {
            if (this.note.PublicNotes != "") {
              var note = this.note.PublicNotes;
            } else {
              var note = "";
            }
          }
          this.$("#ordernotes-inner").html(this._orderNotesTemplate({
            InvoiceCode: data,
            Note: note,
            FormHeader: maintenanceType,
            TransactionType: Global.TransactionType
          }));
          break;
      }

      this.$el.trigger("create");

      this.$("#ordernotes-input").attr("maxLength", "100");
    },
    /*
			method  : ShowHideBlockOverlay
			purpose : Show or Hide Block Overlay
			note    : main function is found in shared for easy access
			*/
    ShowHideBlockOverlay: function(isShow) {
      Shared.ShowHideBlockOverlay(isShow);
    },

    ToggleButtons: function() {
      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesPayment:
          $("#ordernotes-textarea").attr('readonly', 'readonly');
          $("#save-ordernotes").addClass("ui-disabled");
          $("#cancel-ordernotes").addClass("ui-disabled");
          break;
      }

    },

    ToggleOverlay: function(isHide) {
      var divLayers = {
        OrderNotes: "#ordernotes",
        ItemDetail: "#itemDetail",
        NoteList: "#noteList",
        MainOverlay: "#main-transaction-blockoverlay"
      };

      switch (this.type) {
        case Global.NoteType.Customer:
          if ($(divLayers.NoteList).is(":visible")) {
            if (isHide) {
              $(divLayers.OrderNotes).removeClass('z3000');
              $(divLayers.MainOverlay).removeClass('z2990');
            } else {
              $(divLayers.OrderNotes).addClass('z3000');
              $(divLayers.MainOverlay).addClass('z2990');
              $(divLayers.MainOverlay).show();
            }
          } else {
            if (isHide) $(divLayers.MainOverlay).hide();
          }
          break;
        case Global.NoteType.LineItem:
          if ($(divLayers.ItemDetail).is(":visible")) {
            if (isHide) {
              $(divLayers.OrderNotes).removeClass('z3000');
              $(divLayers.MainOverlay).removeClass('z2990');
            } else {
              $(divLayers.OrderNotes).addClass('z3000');
              $(divLayers.MainOverlay).addClass('z2990');
              $(divLayers.MainOverlay).show();
            }
          } else {
            if (isHide) $(divLayers.MainOverlay).hide();
          }
          break;
        case Global.NoteType.OrderNotes:
          if (isHide) $(divLayers.MainOverlay).hide();
          else $(divLayers.MainOverlay).show();
          break;
      }
    },
  });

  return NotesControlView;
});
