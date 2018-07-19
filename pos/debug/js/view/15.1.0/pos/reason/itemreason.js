/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/method',
  'shared/service',
  'model/reason',
  'view/15.1.0/pos/reason/reasons',
  'text!template/15.1.0/pos/reason/itemreason.tpl.html',
], function($, $$, _, Backbone, Global, Method, Service, ReasonModel, ReasonsView, template) {
  var ItemReasonView = Backbone.View.extend({
    _template: _.template(template),
    events: {
      "tap #item-select-reason-btn": "loadReason_touchstart",
      "tap #item-cancel-reason": "cancel_touchstart",
      "tap #item-save-reason": "save_touchstart",
      // "keyup #item-reason-textarea" : "CheckReasonInput"
      "keypress #item-reason-textarea": "CheckReasonInput"
    },

    initialize: function() {
      $("input").blur();
      if ($("#itemDetailContainer").is(":visible")) $("#itemDetailContainer").hide();
      this.collection.on('selected', this.LoadSelectedReason, this);
      this.type = this.options.type;
      console.log('type-handled : ' + this.type);
      this.render();
    },

    InitializeReasonModel: function() {
      if (this.reasonModel) {
        this.reasonModel.clear({
          silent: true
        });
      } else {
        this.reasonModel = new ReasonModel();
        this.reasonModel.on("sync", this.SuccessComplete, this);
        this.reasonModel.on("error", this.ErrorSaving, this);
        this.reasonModel.url = Global.ServiceUrl + Service.POS + Method.SAVEREASON;
      }
    },

    render: function() {
      this.$el.html(this._template);
      this.CheckCollection();
      this.CheckReasonInput();
      $("#reasonPage-inner").trigger("create");
      $("#main-transaction-blockoverlay").show();
      $("#item-reason-textarea").focus();
    },

    CheckCollection: function() {
      if (this.collection.length === 0) $("#item-select-reason-btn").addClass("ui-disabled");
    },

    CheckReasonInput: function() {
      var reason = $("#item-reason-textarea").val();
      if (reason === "") $("#item-save-reason").addClass("ui-disabled");
      else $("#item-save-reason").removeClass("ui-disabled");
    },

    CheckType: function(type) {
      if (type === "DiscountAll") type = "Discount";
      return type;
    },

    Close: function() {
      $("#main-transaction-blockoverlay").hide();
      this.remove();
      this.unbind();
    },

    Show: function(type, el) {
      this.$el = el;
      this.type = type;
      console.log('type-handled : ' + this.type);
      this.render();
    },

    cancel_touchstart: function(e) {
      e.preventDefault();
      this.Close();
    },

    save_touchstart: function(e) {
      e.preventDefault();
      this.LogReasonWithValidation();
    },

    loadReason_touchstart: function(e) {
      e.preventDefault();
      this.ShowReasonView(this.collection);
      $("#item-reason-textarea").blur();
    },

    LoadSelectedReason: function(model) {
      this.model = model;
      this.render();
      $("#item-save-reason").removeClass("ui-disabled");
      $("#item-reason-textarea").val(model.get("Description"));
      this.reason = model.get("Description");

    },

    SetReasonCode: function(model) {
      var reasonCode = "";
      if (model) reasonCode = model.get("ReasonCode");
      return reasonCode;
    },

    ShowReasonView: function(collection) {
      var reasonsView = new ReasonsView({
        el: $("#reasonPage-inner")
      });
      reasonsView.render(collection);
    },

    RemoveDummyModel: function() {
      var self = this;
      this.collection.each(function(model) {
        if (model.get("ToRemove") === "removeThis") {
          self.collection.remove(model);
        }
      });
    },

    SaveReason: function(reason) {
      this.RemoveDummyModel();
      if (!this.reasonModel) this.InitializeReasonModel();

      console.log(this.type);
      var reasonCode = this.SetReasonCode(this.model);
      //if (!reason && reasonCode && reasonCode != '' && this.model) reason = this.model.get('Description');
      //if (!reason && !reasonCode)
      reason = $("#item-reason-textarea").val();

      this.reasonModel.set({
        WorkstationID: Global.POSWorkstationID,
        Reason: reason,
        ReasonCode: reasonCode,
        TransactionCode: Global.TransactionCode,
        TransactionType: Global.TransactionType,
        Action: this.type
      });
      this.reasonModel.save();
    },

    SuccessComplete: function(model, response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      Global.LoggedReasons.add(model.attributes);
      this.triggerSaveReason(model);
      this.Close();
    },

    ErrorSaving: function(model, error, response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      model.RequestError(error, "Error Saving Reason Code");
    },

    triggerSaveReason: function(model) {
      if (this.collection.length === 0) this.collection.add({
        Action: this.type
      }, {
        silent: true
      });
      else this.collection.at(0).set({
        Action: this.type
      }, {
        silent: true
      });

      this.collection.at(0).saveItemReason();
    },

    AcceptReason: function() {
      this.collection.at(0).acceptReason();
    },

    ValidateReason: function() {
      var reason = $("#item-reason-textarea").val();
      if (reason === "" || !reason) {
        console.log("Please enter a reason to proceed..");
        navigator.notification.alert("Please enter a reason to proceed.", null, "Reason is Required", "OK");
      } else {
        this.SaveReason(reason);
      }
    },

    LogReasonWithValidation: function() {
      var reason = $("#item-reason-textarea").val();
      if (reason === "") {
        console.log("Please enter a reason to proceed..");
        navigator.notification.alert("Please enter a reason to proceed.", null, "Reason is Required", "OK");
        return;
      }

      if (this.type === "Item") this.SaveReason(reason);
      else {
        if (this.collection.length === 0) this.collection.push({
          ToRemove: "removeThis"
        }, {
          silent: true
        }); //dummy input
        this.AcceptReason();
      }
    }

  });
  return ItemReasonView;
})
