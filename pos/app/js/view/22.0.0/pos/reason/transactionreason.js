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
  'view/19.0.0/pos/reason/reasons',
  'text!template/19.0.0/pos/reason/transactionReason.tpl.html'
], function($, $$, _, Backbone, Global, Method, Service, ReasonModel, ReasonsView, template) {
  var _model, type, _reason = "",
    _collectionLength;
  var TransactionReasonView = Backbone.View.extend({
    _template: _.template(template),
    events: {
      "tap #transaction-select-reason-btn": "loadReason_touchstart",
      "tap #transaction-cancel-reason": "cancel_touchstart",
      "tap #transaction-save-reason": "save_touchstart",

      "keyup #transaction-reason-textarea": "CheckReasonInput"
    },

    initialize: function() {
      $("#transaction-reason-textarea").focus();
      $("#itemDetailContainer").hide();
      this.collection.on('selected', this.LoadSelectedReason, this);
      collection = this.collection;
      type = this.options.type;
      console.log('type-handled : ' + type)
      _model = null;
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
      _reason = $("#transaction-reason-textarea").val();
      _reason.trim();
      $("#reasonPage-inner").trigger("create");
      $("#main-transaction-blockoverlay").show();
      $("#transaction-reason-textarea").focus();
    },

    CheckCollection: function() {
      _collectionLength = this.collection.length;
      if (_collectionLength === 0) {
        $("#transaction-select-reason-btn").addClass("ui-disabled");
      }
    },

    CheckReasonInput: function() {
      var _reason = $("#transaction-reason-textarea").val();
      if (_reason === "") {
        $("#transaction-save-reason").addClass("ui-disabled");
      } else {
        $("#transaction-save-reason").removeClass("ui-disabled");
      }
    },

    CheckType: function(type) {
      if (type === "DiscountAll") {
        type = "Discount";
      }
      return type;
    },

    Close: function(isCancel) {
      if (isCancel || type == "VoidTransaction") $("#main-transaction-blockoverlay").hide();
      this.remove();
      this.unbind();
    },

    cancel_touchstart: function(e) {
      e.preventDefault();
      this.Close(true);
    },

    save_touchstart: function(e) {
      e.preventDefault();
      console.log('to save >> type : ' + type);
      this.LogReasonWithValidation();
    },

    loadReason_touchstart: function(e) {
      e.preventDefault();
      this.ShowReasonView(this.collection);
      $("#transaction-reason-textarea").blur();
    },

    LoadSelectedReason: function(model) {
      _model = model;
      this.render();
      $("#transaction-save-reason").removeClass("ui-disabled");
      $("#transaction-reason-textarea").val(model.get("Description"));

      _reason = model.get("Description");
    },

    SetReasonCode: function(model) {
      var reasonCode = "";
      if (model) {
        reasonCode = model.get("ReasonCode");
      }
      return reasonCode;
    },

    ShowReasonView: function(collection) {
      this.reasonsView = new ReasonsView({
        el: $("#reasonPage-inner")
      });
      this.reasonsView.render(collection);
    },

    RemoveDummyModel: function() {
      this.collection.each(function(model) {
        if (model.get("ToRemove") === "removeThis") {
          this.collection.remove(model);
        }
      });
    },

    SaveReason: function() {
      this.RemoveDummyModel();
      if (!this.reasonModel) {
        this.InitializeReasonModel();
      }


      var _type = type;
      var _reasonCode = this.SetReasonCode(_model);
      this.reasonModel.set({
        WorkstationID: Global.POSWorkstationID,
        Reason: _reason,
        ReasonCode: _reasonCode,
        TransactionCode: Global.TransactionCode,
        TransactionType: Global.TransactionType,
        Action: _type
      });

      if (Global.TransactionType == "Sales Refund" && _type == "Return") {
        //Reason Log will be saved if Refund is successful.
        this.reasonModel.set({
          TransactionCode: null
        });
        this.SuccessComplete(this.reasonModel, null);

        var rtnReasons = null;
        Global.LoggedReasons.each(function(model) {
          if (model.get("Action") == _type) rtnReasons = model;
        });
        Global.LoggedReasons.remove(rtnReasons);
        Global.LoggedReasons.add(this.reasonModel.attributes);
        return;
      }

      this.reasonModel.save();
    },

    SuccessComplete: function(model, response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator(); //CSL-5031
      this.triggerSaveReason(model);
      this.Close();
    },

    ErrorSaving: function(model, error, response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator(); //CSL-5031
      model.RequestError(error, "Error Saving Reason Code");
    },

    triggerSaveReason: function(model) {
      if (_collectionLength === 0) {
        this.collection.add({
          Action: type
        }, {
          silent: true
        });
      } else {
        this.collection.at(0).set({
          Action: type
        }, {
          silent: true
        });
      }
      this.collection.at(0).saveTransactionReason();
    },

    AcceptReason: function() {
      this.collection.at(0).acceptReason();
    },

    ValidateReason: function() {
      _reason = $("#transaction-reason-textarea").val();
      if (_reason === "" || !_reason) {
        console.log("Please enter a reason to proceed..");
        navigator.notification.alert("Please enter a reason to proceed.", null, "Reason is Required", "OK");
      } else {
        this.SaveReason();
      }
    },

    LogReasonWithValidation: function() {
      _reason = $("#transaction-reason-textarea").val();
      console.log(_reason + "<<<");
      if (_reason === "" || !_reason) {
        console.log("Please enter a reason to proceed..");
        navigator.notification.alert("Please enter a reason to proceed.", null, "Reason is Required", "OK");
        return null;
      }

      //mode = GetReasonMode();
      if (type === "Item") {
        this.SaveReason();
      } else {
        if (this.collection.length === 0) {
          this.collection.push({
            ToRemove: "removeThis"
          }, {
            silent: true
          }); //dummy input
        }
        this.AcceptReason();
        //this.Close();
      }
    }

  });
  return TransactionReasonView;
})
