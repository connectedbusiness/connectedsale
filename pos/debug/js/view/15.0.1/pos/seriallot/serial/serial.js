/**
 * @author alexis.banaag
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/enum',
  'shared/shared',
  'text!template/15.0.1/pos/seriallot/serial/serial.tpl.html'
], function(
  $, $$, _, Backbone, Global, Enum, Shared,
  template) {
  var SerialItemView = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',

    events: {
      "tap #delete-serialLot": "ProcessDelete",
      "change #include-serialLot": "ProcessIncludeSerialLot",
      "tap": "showEmailInput_tap",
    },

    bindEvents: function() {
      var self = this;
      this.element = $("#" + this.cid + " #input-serialEmail");
      this.element.on("focusout", function(e) {
        self.hideEmailInput_tap(e)
      });
      this.element.on("change", function(e) {
        self.changeEmailInput_tap(e)
      });
    },

    changeEmailInput_tap: function(e) {
      e.preventDefault();
      var email = this.element.val().trim();
      if (!Shared.IsNullOrWhiteSpace(email)) {
        if (!Shared.ValidateEmailFormat(email)) {
          this.SetEmail(email);
          this.element.hide();
          if (e.type == "change") this.element.off("focusout");
        } else navigator.notification.alert("The email you entered is not valid. Try again.", null, "Action not Allowed", "OK");
      } else {
        //$("#"+this.cid+" #span-serialEmail").show();
        //$("#"+this.cid+" #span-serialEmail").text("Enter Email address here...");
        this.SetEmail("Enter Email address here...");
        this.element.hide();
        if (e.type == "change") this.element.off("focusout");
      }

    },

    hideEmailInput_tap: function(e) {
      e.preventDefault();
      $("#" + this.cid + " #span-serialEmail").show();
      this.element.hide();
      if (e.type == "focusout") this.element.off("change");
    },

    showEmailInput_tap: function(e) {
      e.preventDefault();
      if (e.target.id != "include-serialLot") {
        if (Global.TransactionType === Enum.TransactionType.Recharge || Global.TransactionType === Enum.TransactionType.SalesRefund) return;
        $("#" + this.cid + " #span-serialEmail").hide();
        if (this.model.get("ItemType") == Enum.ItemType.GiftCard || this.model.get("ItemType") == Enum.ItemType.GiftCertificate) {
          this.bindEvents();

          this.element.show();
          this.element.focus();
        } else return;
      } else this.ProcessIncludeSerialLot(e);

    },

    initialize: function() {
      this.model.on('remove', this.RemoveSerialLot, this);
    },

    render: function() {
      var isGC = false;
      this.isChecked;
      if (Global.TransactionType != Enum.TransactionType.SalesRefund && (this.model.get("ItemType") != Enum.ItemType.GiftCard && this.model.get("ItemType") != Enum.ItemType.GiftCertificate)) {
        this.isChecked = this.model.get("IsIncluded");
        isGC = false;
      } else {
        if (Shared.IsNullOrWhiteSpace(this.model.get("IsIncluded"))) this.isChecked = this.model.get("IsReturned");
        else this.isChecked = this.model.get("IsIncluded");

        if (Global.TransactionType != Enum.TransactionType.SalesRefund) isGC = true;
        else isGC = false;
      }

      this.$el.prepend(this._template(this.model.toJSON()));
      this.$el.attr("id", this.cid);
      //this.$('input[type=checkbox]').attr("checked",this.isChecked);


      if (!isGC) {
        this.$("#span-serialEmail").hide();
      }

      if (Global.TransactionType === Enum.TransactionType.SalesRefund) this.DisableReturnedSerial();
      if (!this.AllowedToRemoveSerial()) this.$('#deletebtn-overlay').remove();
      return this;
    },

    AllowedToRemoveSerial: function(data) {
      if (Global.TransactionType != Enum.TransactionType.Recharge && Global.TransactionType != Enum.TransactionType.SalesRefund && !this.model.get("IsSerialGenerated")) return true;
      return false;
    },

    BindEmailRecipient: function() {
      $("#" + this.cid + " #span-serialEmail").text(this.model.get("SerialRecipient"));
    },

    Bind: function() {
      if (this.isChecked === true) this.isChecked = false;
      else this.isChecked = true;

      Shared.CustomCheckBoxChange("#" + this.cid + " #include-serialLot", this.isChecked);
      $("li").off("change");
    },

    DisableReturnedSerial: function() {
      if (this.model.get("IsReturned") || this.model.get("IsActivated") || this.model.get("IsRecharged")) this.$el.addClass("ui-disabled");
    },

    ProcessDelete: function(e) {
      e.stopPropagation();
      if (Global.TransactionType != Enum.TransactionType.SalesRefund) {
        if (!this.model.get("IsSerialGenerated")) this.model.removeItem();
      }
    },

    ProcessIncludeSerialLot: function(e) {
      e.stopPropagation();
      var target = e.target.id;
      var isChecked = false;

      if ($("#" + this.cid + " #" + target).hasClass("icon-check-empty")) {
        isChecked = Shared.CustomCheckBoxChange("#" + this.cid + " #" + target, false);
      } else isChecked = Shared.CustomCheckBoxChange("#" + this.cid + " #" + target, true);

      if (isChecked) this.model.set({
        IsIncluded: true
      })
      else this.model.set({
        IsIncluded: false
      });
      if (e.type == "change") $("li").off("tap");
    },

    RemoveSerialLot: function() {
      this.remove();
      $("#serialListNumber").listview("refresh");
    },

    SetEmail: function(email) {
      this.model.set({
        OriginalSerialRecipient: ((this.model.get("SerialRecipient")) ? this.model.get("SerialRecipient") : "")
      });

      if (email != "Enter Email address here...") { //Don't store this value
        this.model.set({
          SerialRecipient: email,
          IsEmailModified: true
        });
      } else {
        this.model.set({
          SerialRecipient: ""
        });
      }

      $("#" + this.cid + " #span-serialEmail").show();
      $("#" + this.cid + " #span-serialEmail").text(email);
    }
  });
  return SerialItemView;
});
