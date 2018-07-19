/**
 * Connected Business | 07-15-2013
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'model/base',
  'collection/base',
  'view/18.2.0/settings/payment/confirmpassword',
  'text!template/18.2.0/settings/payment/payment.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method, BaseModel, BaseCollection, ConfirmPasswordView, template) {
  var PaymentGatewaySettingsView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "focus #merchantpassword": "merchantPassword_Focus",
      "change #merchantlogin": "merchantLogin_Change",
      "change #carddevicetype": "selectDeviceType_change"
    },

    isPreferenceSaved: false,
    isPaymentGatewaySaved: false,

    merchantLogin_Change: function(e) {
      e.preventDefault();
      this.HasChanges = true;
    },

    merchantPassword_Focus: function(e) {
      e.preventDefault();
      this.ShowConfirmPassword();
    },

    selectDeviceType_change: function(e) {
      e.preventDefault();

      var deviceType = this.$("#carddevicetype option:selected").val();
      this.preferenceCollection.at(0).set({
        CardDeviceType: deviceType
      });
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      this.FetchCreditCard();
    },

    ChangePassword: function(password) {
      this.newMerchantPassword = password;
      this.HasChanges = true;
      this.Save();
    },

    ConfirmPasswordViewClosed: function() {
      $("#settings-blockoverlay").hide();
    },

    FetchCreditCard: function() {
      var self = this;
      this.InitializeCreditCard();

      this.paymentGatewayModel.set({
        AssemblyName: "Interprise.Presentation.Customer.PaymentGateway.ITGPIv2",
        Gateway: "Interprise.Presentation.Customer.PaymentGateway.ITGPIv2.InterpriseGatewayControl",
        MerchantLogin: "",
        IsEncrypted: true,
        AllowSale: true,
        IsVault: true,
        PasswordPlaceholder: ""
      });

      this.paymentGatewayModel.url = Global.ServiceUrl + Service.POS + Method.GETCREDITCARDGATEWAY;
      this.paymentGatewayModel.save(null, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.InitializeDisplay();
        },
        error: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving Payment Gateway Settings");
        }
      });
    },

    FetchPreference: function() {
      var self = this;
      this.InitializePreference();

      this.preferenceCollection.url = Global.ServiceUrl + Service.POS + Method.GETPREFERENCEBYWORKSTATION + Global.POSWorkstationID;
      this.preferenceCollection.fetch({
        success: function(collection, response) {
          self.ResetPreferenceCollection(response.Preference);
        },

        error: function(collection, xhr, options) {

        }
      });
    },

    HasDeviceChanges: function() {
      return (this.preferenceCollection.at(0).get("CardDeviceType") != this.preferenceCollection.at(0).previous("CardDeviceType"));
    },

    HasPassword: function() {
      return this.paymentGatewayModel != null && this.paymentGatewayModel.get("MerchantPassword") != null && this.paymentGatewayModel.get("MerchantPassword") != "";
    },

    InitializeDisplay: function() {
      if (this.HasPassword()) {
        this.paymentGatewayModel.set({
          PasswordPlaceholder: "***********"
        });
      }

      this.$el.html(this._template(this.paymentGatewayModel.toJSON()));
      this.$("#settings-creditcard").trigger("create");
      //this.LoadCardDeviceType();
      this.HasChanges = false;
    },

    InitializeCreditCard: function() {
      if (!this.paymentGatewayModel) {
        this.paymentGatewayModel = new BaseModel();
      }
    },

    InitializePreference: function() {
      if (!this.preferenceCollection) {
        this.preferenceCollection = new BaseCollection();
      }
    },

    LoadCardDeviceType: function() {
      var cardType = this.preferenceCollection.at(0).get("CardDeviceType");

      this.$("#carddevicetype-container").show();
      this.$("#carddevicetype-container > div.ui-select").attr("style", "width:35%;");

      this.$("#carddevicetype option[value='" + cardType + "']").attr("selected", true);
      this.$("#carddevicetype").selectmenu("refresh", true);
    },

    ResetPreferenceCollection: function(preferences) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.preferenceCollection.reset(preferences);
      this.FetchCreditCard();
    },

    Save: function() {
      if (!this.paymentGatewayModel) {
        return;
      } else {
        if (this.HasChanges == false) {
          this.SaveCompleted();
          //this.UpdatePreference();
          return;
        }
        var _self = this;
        var merchantLogin = this.$("#merchantlogin").val();
        var password = "";
        var passwordChanged = false;

        if (this.newMerchantPassword != null) {
          password = this.newMerchantPassword;
          passwordChanged = true;
        }

        this.paymentGatewayModel.set({
          MerchantLogin: merchantLogin,
          ChangePassword: passwordChanged,
          NewMerchantPassword: password,
          IsEncrypted: true,
          AllowSale: true,
          IsVault: true
        });

        this.paymentGatewayModel.url = Global.ServiceUrl + Service.POS + "updatecreditcardgateway/";
        this.paymentGatewayModel.save(null, {
          success: function(model, response) {
            _self.SaveCompleted()
            _self.isPaymentGatewaySaved = true;
            //_self.UpdatePreference();
            this.HasChanges = false;
          },
          error: function(model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            model.RequestError(error, "Error Updating Payment Gateway Settings");
            this.HasChanges = false;
          }
        });
      }
    },

    SaveCompleted: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();

      this.isPreferenceSaved = false;
      this.isPaymentGatewaySaved = false;
      this.trigger("SaveCompleted", this);
    },

    ShowConfirmPassword: function() {
      $("#settings-blockoverlay").show();
      if (!confirmPasswordView) {
        var confirmPasswordView = new ConfirmPasswordView({
          el: $('#confirmPasswordContainer')
        })
        confirmPasswordView.on("passwordChanged", this.ChangePassword, this);
        confirmPasswordView.on("closed", this.ConfirmPasswordViewClosed, this);
      }
      confirmPasswordView.Show(this.HasPassword());
    },

    UpdatePreference: function() {
      if (this.HasDeviceChanges()) {
        return;
      } else {

        var self = this;
        var preferenceModel = new BaseModel();
        preferenceModel.set({
          Preference: this.preferenceCollection.at(0)
        });

        preferenceModel.url = Global.ServiceUrl + Service.POS + Method.UPDATEPREFERENCE;
        preferenceModel.save(null, {
          success: function(model, response) {
            self.SaveCompleted();
          },
          error: function(model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            model.RequestError(error, "Error Saving Workstation Preference");
          }
        });
      }
    },

  });
  return PaymentGatewaySettingsView;
});
