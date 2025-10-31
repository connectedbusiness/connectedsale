/**
 * CUSTOMERS PAGE
 * @author PREBROn | 05-07-2013
 * Required: el, collection
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'view/25.1.0/customers/customers/customer-form',
  'view/25.1.0/customers/typepopup/typepopup',
  'text!template/25.1.0/customers/customers.tpl.html',
  'text!template/25.1.0/customers/customers-header.tpl.html'
], function($, $$, _, Backbone,
  CustomersFormView, TypePopUpView,
  CustomersTemplate, HeaderTemplate) {

  var Forms = {
    Customers: "Customers",
  }

  var ClassID = {
    Body: ".customers-page .body",
    Header: ".customers-page .header"
  }

  var currentInstance;
  var queuedForm;

  var doChangeForm = function(button) {
    if (button === 1) {
      if (!queuedForm) {
        window.location.hash = 'dashboard';
        return;
      }
      currentInstance.LoadForm(queuedForm);
    }
  };

  var CustomersView = Backbone.View.extend({

    _customers: _.template(CustomersTemplate),
    _header: _.template(HeaderTemplate),

    events: {
      "tap .customers-page .header .menu .customers": "Customers_tapped",
      "tap .customers-page .header #back": "Back_tapped",
      "tap #title a": "CustomerName_tapped"
    },

    Back_tapped: function(e) {
      e.preventDefault();
      this.ChangeFormWithValidation();
    },
    Customers_tapped: function(e) {
      e.preventDefault();
      this.ChangeFormWithValidation(Forms.Customers);
    },
    CustomerName_tapped: function(e) {
      e.preventDefault();
      this.BackToGeneralView();
    },

    initialize: function() {
      currentInstance = this;
      navigator.__proto__.escapedhtml = function(string) {
        var entityMap = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': '&quot;',
          "'": '&#39;',
          "/": '&#x2F;'
        };
        return String(string).replace(/[&<>"'\/]/g, function(s) {
          return entityMap[s];
        });
      };
    },

    InitializeChildViews: function() {
      this.CurrentForm = Forms.Customers;
      this.$(ClassID.Header).html(this._header());
      this.LoadForm(Forms.Customers);
      navigator.notification.overrideAlert(true); //Notification
    },

    LoadForm: function(_formName) {
      this.SetHeaderTitle(_formName);
      this.CurrentForm = _formName;
      this.InitializeCustomersView();
      this.customersFormView.Show();
      this.customersFormView.InitializeChildViews();
    },

    ChangeFormWithValidation: function(_formName) {
      queuedForm = _formName;
      if (this.CurrentForm == _formName) return;
      if (this.CurrentForm == Forms.Customers) this.CheckFormMode(this.customersFormView);
    },

    CheckFormMode: function(view) {
      if (!view) {
        doChangeForm(1);
        return;
      }
      if (!view.HasChanges) {
        doChangeForm(1);
        return;
      }
      if (!view.HasChanges()) {
        doChangeForm(1);
        return;
      }
      if (view.UnloadConfirmationMessage) {
        navigator.notification.confirm(view.UnloadConfirmationMessage, doChangeForm, "Confirmation", ['Yes', 'No']);
      } else {
        navigator.notification.confirm("Do you want to cancel changes?", doChangeForm, "Confirmation", ['Yes', 'No']);
      };
    },

    SetHeaderTitle: function(val) {
      $(".header-content #title").html(val);
    },

    BackToGeneralView: function() {
      console.log('BackToGeneralView');
      if (this.customersFormView.IsNew) {
        navigator.notification.confirm("Do you want to cancel changes?", this.ProceedToGeneralView, "Confirmation", ['Yes', 'No']);
      } else {
        this.customersFormView.ProceedToGeneralView();
      }
    },

    ProceedToGeneralView: function(button) {
      if (button === 1) {
        currentInstance.customersFormView.ProceedToGeneralView();
      }
    },

    InitializeCustomersView: function() {
      if (!this.customersFormView) {
        this.customersFormView = new CustomersFormView({
          el: $(ClassID.Body)
        });
        this.customersFormView.on('tabChanged', this.SetHeaderTitle, this);
      }
    },

    render: function() {
      this.$el.html(this._customers);
      return this;
    }

  });
  return CustomersView;
});
