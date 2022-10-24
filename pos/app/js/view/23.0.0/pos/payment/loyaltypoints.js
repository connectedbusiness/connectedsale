define([
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/base',
  'model/lookupcriteria',
  'collection/base',
  'text!template/23.0.0/pos/payment/loyaltypoints.tpl.html',
  'js/libs/format.min.js'
], function(Backbone, Global, Service, Method, Shared,
  BaseModel, LookUpCriteriaModel,
  BaseCollection,
  template) {


  var txtAccumulatedPoints = "#txtAccumulatedPoints";
  var txtRedeemedPoints = "#txtRedeemedPoints";
  var txtOutStanding = "#txtOutStanding";
  var txtApplyPoints = "#txtApplyPoints";
  var txtApplyMonetary = "#txtApplyMonetary";
  var txtReservedPoints = "#txtReservedPoints";
  var dialogMessage = ".dialog-message";
  var btnDone = "#cmdDone";
  var LoyaltyPointsView = Backbone.View.extend({

    _template: _.template(template),

    events: {
      "keyup #txtApplyPoints": "Points_Keyup",
      "keyup #txtApplyMonetary": "Points_Keyup",
      "blur #txtApplyPoints ": "ApplyInput_Blur",
      "blur #txtApplyMonetary": "ApplyInput_Blur",
      "focus #txtApplyPoints": "AssignNumericValidation",
      "focus #txtApplyMonetary": "AssignNumericValidation",
      "keypress #txtApplyMonetary": "txtKeypress"
    },

    initialize: function() {

    },

    txtKeypress: function(e) {
      Shared.MaxDecimalPlaceValidation($("#" + e.target.id), e);
    },

    AssignNumericValidation: function(e) {
      var _id = e.target.id;

      if (!Shared.IsNullOrWhiteSpace($("#" + _id).val())) $("#" + _id).val(""); {
        if (_id == "txtApplyPoints") {
          Shared.Input.NonNegativeInteger("#" + _id);
        } else {
          Shared.Input.NonNegative("#" + _id);
        }

      }
    },

    render: function(balance) {
      this.$el.html(this._template);
      this.trigger("create");
      this.balance = balance;
      this.GetCustomerLoyaltyPoints();
      return this;
    },
    SetKioskActualBalance: function(balance) {
      this.kioskActualBalance = balance;
    },
    GetCustomerLoyaltyPoints: function() {
      var self = this;
      this.model = new BaseModel();
      var customerCode;
      if (Shared.IsNullOrWhiteSpace(Global.CurrentCustomer.CustomerCode)) {
        customerCode = Global.CustomerCode;
      } else {
        customerCode = Global.CurrentCustomer.CustomerCode;
      }
      this.model.set({
        StringValue: customerCode
      });
      this.model.url = Global.ServiceUrl + Service.SOP + Method.GETCUSTOMERLOYALTYPOINTS;
      this.model.save(null, {
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.LoadCustomerLoyaltyPoins(response);
        }
      });
    },

    FocusElement: function(elem) {
      var elemInput = document.getElementById(elem);
      elemInput.select();
    },

    LoadCustomerLoyaltyPoins: function(response) {
      this.collection = new BaseCollection();
      this.collection.reset(response.LoyaltyPoints);
      this.advancePreferenceCollection = new BaseCollection();
      this.advancePreferenceCollection.reset(response.LoyaltyPointsAdvancePreference);
      var self = this;
      this.accumulatedPoints = 0;
      this.redeemPoints = 0;
      this.outstandingPoints = 0;
      this.purchaseMultiplier = 0;
      this.redemptionMultiplier = 0;
      this.monetaryPoints = 0;
      this.reservedPoints = 0;

      if (this.collection.length > 0) {
        this.accumulatedPoints = parseFloat(this.collection.at(0).get("AccumulatedPoints"));
        this.redeemPoints = parseFloat(this.collection.at(0).get("RedeemedPoints"));
        //this.outstandingPoints = parseFloat(this.collection.at(0).get("OutstandingPoints")); //CSL-17347 : 11.15.13
        this.outstandingPoints = this.CalculateOutStandingPoints(this.collection.at(0).attributes);
        this.reservedPoints = parseFloat(this.collection.at(0).get("ReservedPoints"));
        if (this.advancePreferenceCollection.length > 0) {
          this.purchaseMultiplier = this.advancePreferenceCollection.at(0).get("Value");
          this.redemptionMultiplier = this.advancePreferenceCollection.at(1).get("Value");
          Shared.Focus(txtApplyMonetary);
        } else {
          this.$(txtApplyMonetary).addClass("ui-readonly");
          this.$(txtApplyPoints).addClass("ui-readonly");
        }
      } else {
        this.$(txtApplyMonetary).addClass("ui-readonly");
        this.$(txtApplyPoints).addClass("ui-readonly");
      }

      this.$(txtReservedPoints).val(Math.round(this.reservedPoints).toLocaleString("en"));
      this.$(txtAccumulatedPoints).val(Math.round(this.accumulatedPoints).toLocaleString("en"));
      this.$(txtRedeemedPoints).val(Math.round(this.redeemPoints).toLocaleString("en"));
      this.$(txtOutStanding).val(Math.round(this.outstandingPoints).toLocaleString("en"));


      if (this.outstandingPoints > 0) {
        this.monetaryPoints = parseFloat(this.balance);
        var _currentBalanceInPoints = 0;
        if (this.balance > 0) {
          _currentBalanceInPoints = this.monetaryPoints / this.redemptionMultiplier
          if (_currentBalanceInPoints > this.outstandingPoints) {
            this.monetaryPoints = Math.round(this.outstandingPoints) * this.redemptionMultiplier;
          }
        }
        this.$(txtApplyMonetary).val(format("#,##0.00", this.monetaryPoints));
        this.$(txtApplyPoints).val(this.outstandingPoints.toLocaleString("en"));
        this.CalculatePoints("monetary", true);
        if (Global.TermDiscount > 0) $(".term-discount").attr('style', 'margin-top:0px;')
      } else {
        this.$(txtApplyPoints).val(this.outstandingPoints.toLocaleString("en"));
        this.$(txtApplyMonetary).val(format("#,##0.00", this.monetaryPoints));

        $(btnDone).hide();
        $(dialogMessage + " > span").text("  Insufficient Points !");
        $(dialogMessage).slideDown('fast');

      }

    },
    Points_Keyup: function(e) {
      if (e.keyCode === 13) {
        this.CalculatePoints(e.target.id);
      }
    },
    ApplyInput_Blur: function(e) {
      this.CalculatePoints(e.target.id);
    },
    ValidateCalculatedPoints: function() {
      if (!Shared.IsNullOrWhiteSpace(this.kioskActualBalance)) {
        if (this.monetaryPoints > this.kioskActualBalance) {
          $(btnDone).hide();
          $(dialogMessage + " > span").text("  Monetary points should not be greater than the remaining balance.");
          $(dialogMessage).slideDown('fast');
          return;
        }
      }
      if (this.applyPoints > this.outstandingPoints) {
        $(btnDone).hide();
        $(dialogMessage + " > span").text("  Insufficient Points !");
        $(dialogMessage).slideDown('fast');
      } else if (this.applyPoints < 0) {
        $(btnDone).hide();
        $(dialogMessage + " > span").text("  Negative Points is not Allowed !");
        $(dialogMessage).slideDown('fast');
      } else {
        $(btnDone).show();
        $(dialogMessage).slideUp('fast');
      }

    },

    CalculatePoints: function(id, isOnLoad) {
      if (Shared.IsNullOrWhiteSpace(isOnLoad)) {
        if (this.$(txtApplyPoints).val() != "") this.applyPoints = parseInt(this.$(txtApplyPoints).val().toLocaleString("en").replace(/,/g, ""));
        if (this.$(txtApplyMonetary).val() != "") this.monetaryPoints = parseFloat(this.$(txtApplyMonetary).val().replace(/,/g, ""));
      }
      if (id == "txtApplyPoints") {
        if (this.$(txtApplyPoints).val() != "") {
          this.monetaryPoints = this.applyPoints * this.redemptionMultiplier;
          this.$(txtApplyMonetary).val(format("#,##0.00", this.monetaryPoints));
          this.ValidateCalculatedPoints();
        } else {
          //this.$(txtApplyPoints).val(parseInt(Math.round(this.applyPoints)).toLocaleString("en")); //CSL-24374
          this.$(txtApplyPoints).val(parseInt(Math.ceil(this.applyPoints)).toLocaleString("en"));
          this.ValidateCalculatedPoints();
        }
      } else {
        if (this.$(txtApplyMonetary).val() != "") {
          if (this.monetaryPoints == 0) {
            this.applyPoints = 0;
          } else {
            this.applyPoints = Math.round(this.monetaryPoints / this.redemptionMultiplier);
          }

          //this.$(txtApplyPoints).val(parseInt(Math.round(this.applyPoints)).toLocaleString("en")); //CSL-24374
          this.$(txtApplyPoints).val(parseInt(Math.ceil(this.applyPoints)).toLocaleString("en"));
          this.ValidateCalculatedPoints();
        } else {
          this.$(txtApplyMonetary).val(format("#,##0.00", this.monetaryPoints)).blur();
          this.ValidateCalculatedPoints();
        }
      }

    },

    CalculateOutStandingPoints: function(loyalty) {
      return loyalty.AccumulatedPoints - loyalty.RedeemedPoints - loyalty.ReservedPoints;
    },

  });

  return LoyaltyPointsView;
});
