/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'view/21.0.0/settings/general/workstation/workstations',
  'view/21.0.0/settings/general/customer/customers',
  'view/21.0.0/settings/general/location/locations',
  'view/21.0.0/settings/general/posshippingmethod/posshippingmethods',
  'view/21.0.0/settings/general/pos/pos',
  'view/21.0.0/settings/general/gateway/gateways',
  'view/21.0.0/settings/general/paymenttype/paymenttypes',
  'view/21.0.0/settings/general/website/websitelist',
  'view/21.0.0/settings/general/imagesize/imagesize',
  'view/21.0.0/settings/general/email/email',
  'view/21.0.0/settings/manager/administrators',
  'view/21.0.0/settings/manager/userroles',
  'view/21.0.0/settings/receipt/typelist/receipttypelist',
  'view/21.0.0/settings/receipt/print/printsetting',
  'view/21.0.0/settings/receipt/print/printerlist',
  'view/21.0.0/settings/user/usermaintenance/maintainuser',
  'view/21.0.0/settings/user/usermaintenance/adduser',
  'view/21.0.0/settings/dejavoo/protocol/protocol',
  'text!template/21.0.0/settings/modal/modal.tpl.html'
], function($, $$, _, Backbone, Global, WorkstationsPreference, CustomerPreference, LocationsPreference,POSShippingMethodPreference, POSPreference, GatewayPreference, PaymentTypePreference, WebsitePreference,
  ImageSizePreference, EmailPreference, AdministratorsView, UserRoleView, ReceiptListView, PrintSettingsView, PrinterListView ,UserMaintenanceView, UserAddView, ProtocolView, template) {
  var SettingsModal = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap #back-general": "btnback_click"
    },

    initialize: function(collection, type) {
      this.render();
    },

    render: function() {
      $("#settings-blockoverlay").show();
      this.$el.html(this._template());
      this.initializeModalContent();
      return this;
    },

    initializeModalContent: function(){
      switch(this.options.preferencetype){
        case "Workstation":
          this.InitializeWorkstationDisplay(this.collection);
          break;
        case "Location":
          this.InitializeLocationDisplay(this.collection);
          break;
         case "ShippingMethod":
          this.InitializeShippingMethodDisplay(this.collection);
          break;
        case "Customer":
          this.InitializeCustomerDisplay(this.collection);
          break;
        case "POS":
          this.InitializePOSDisplay(this.model);
          break;
        case "Gateway":
          this.InitializeGatewayDisplay(this.collection);
          break;
        case "PaymentType":
          this.InitializePaymentTypeDisplay(this.collection);
          break;
        case "Website":
          this.InitializeWebsiteDisplay(this.collection);
          break;
        case "ImageSize":
          this.InitializeImageSizeTypeDisplay(this.model);
          break;
        case "Email":
          this.InitializeEmailDisplay(this.model);
          break;
        case "Admin":
          this.InitializeAdministratorList(this.collection);
          break;
        case "UserRole":
          this.InitializeUserroleList(this.collection);
          break;
        case "Receipt":
          this.InitializeReceiptList(this.collection);
          break;
        case "UserMaintenance":
          this.InitializeUserMaintenanceList(this.model);
          break;
        case "UserAdd":
          this.InitializeUserAddView(this.model);
          break;
        case "Printer":
          this.InitializePrinterSettings(this.model);
          break;
        case "DejavooConnectionProtocol":
          this.InitializeDejavooConnectionProtocol(this.model);
          break;
        case "DefaultPrinter":
          this.InitializePrinterList(this.collection);
          break;
    }
  },

    btnback_click: function(e){
      e.preventDefault();
      this.close();
    },

    InitializeLocationDisplay: function(collection) {
      _selectedLocation = this.options.selectedLocation;
      this.locationPreference = new LocationsPreference({
        el: $("#settings-modal-content"),
        collection: collection,
      });
      if (!_selectedLocation) _selectedLocation = null;
      this.locationPreference.SetSelected(_selectedLocation);
      document.getElementById('settings-modal-title').innerHTML = "Location";
    },

      InitializeShippingMethodDisplay: function(collection) {
      _selectedShippingMethod = this.options.selectedShippingMethod;
      this.shippingMethodPreference = new POSShippingMethodPreference({
        el: $("#settings-modal-content"),
        collection: collection,
      });
      if (!_selectedShippingMethod) _selectedShippingMethod = null;
      this.shippingMethodPreference.SetSelected(_selectedShippingMethod);
      document.getElementById('settings-modal-title').innerHTML = "Shipping Method";
    },


    InitializeWorkstationDisplay: function(collection) {
      collection.sort();
      _selectedWorkstation = this.options.selectedWorkstation;
      this.workstationsPreference = new WorkstationsPreference({
        el: $("#settings-modal-content"),
        collection: collection,
      });
       if (!_selectedWorkstation) _selectedWorkstation = null;
      this.workstationsPreference.SetSelected(_selectedWorkstation);
      document.getElementById('settings-modal-title').innerHTML = "Workstation";
    },

    InitializeCustomerDisplay: function(collection) {
      _selectedCustomer = this.options.selectedCustomer;
      this.customerPreference = new CustomerPreference({
        el: $("#settings-modal-content"),
        collection: collection,
      });
       if (!_selectedCustomer) _selectedCustomer = null;
      this.customerPreference.SetSelected(_selectedCustomer);
      document.getElementById('settings-modal-title').innerHTML = "Customer";
    },

    InitializePOSDisplay: function(model) {
      Global.Preference.DefaultPOSTransaction = model.get("DefaultPOSTransaction");
      this.posPreference = new POSPreference({
        el: $("#settings-modal-content"),
        model: model,
      });
      this.posPreference.general = this.options.general;
      document.getElementById('settings-modal-title').innerHTML = "Transaction";
    },

    InitializeGatewayDisplay: function(collection) {
      _selectedGateway = this.options.selectedGateway;
      this.gatewayPreference = new GatewayPreference({
        el: $("#settings-modal-content"),
        collection: collection,
      });
      if (!_selectedGateway) _selectedGateway = null;
      this.gatewayPreference.SetSelected(_selectedGateway);
      document.getElementById('settings-modal-title').innerHTML = "Merchant";
    },

    InitializePaymentTypeDisplay: function(collection) {
      _selectedPaymentType = this.options.selectedPaymentType;
      this.paymentTypePreference = new PaymentTypePreference({
        el: $("#settings-modal-content"),
        collection: collection,
      });
      if (!_selectedPaymentType) _selectedPaymentType = null;
      this.paymentTypePreference.SetSelected(_selectedPaymentType);
      document.getElementById('settings-modal-title').innerHTML = "Payment Type";
    },

    InitializeWebsiteDisplay: function(collection) {
      _selectedWebsite = this.options.selectedWebsite;
      this.websitePreference = new WebsitePreference({
        el: $("#settings-modal-content"),
        collection: collection,
      });
      if (!_selectedWebsite) _selectedWebsite = null;
      this.websitePreference.SetSelected(_selectedWebsite);
      document.getElementById('settings-modal-title').innerHTML = "Website";
    },

    InitializeImageSizeTypeDisplay: function(model) {
      this.imageSizePreference = new ImageSizePreference({
        el: $("#settings-modal-content"),
        model: model
      });
      this.imageSizePreference.general = this.options.general;
      document.getElementById('settings-modal-title').innerHTML = "Image Size";
    },

    InitializeEmailDisplay: function(model) {
      this.emailPreference = new EmailPreference({
        el: $("#settings-modal-content"),
        model: model
      });
      document.getElementById('settings-modal-title').innerHTML = "Pickup Order Template";
    },

    InitializeAdministratorList: function(collection){
      if (!this.administratorsView) {
        this.administratorsView = new AdministratorsView();
      }
      this.administratorsView.$el = this.$("#settings-modal-content");
      this.administratorsView.SetSelectedAdministratorUserRoles(this.collection);
      this.administratorsView.SetPreferences(this.options.preferences);
      this.administratorsView.Show();
      document.getElementById('settings-modal-title').innerHTML = "Administrators";
    },

    InitializeUserroleList: function(){
      if (!this.userRoleView) {
        this.userRoleView = new UserRoleView({
          preferenceCollection: this.options.preferenceCollection,
          userRoleCollection: this.options.userRoleCollection
        });
      }
      this.userRoleView.$el = this.$("#settings-modal-content");
      this.userRoleView.SetPreferences(this.options.preferences);
      this.userRoleView.SetType(this.options.userroletype);
      this.userRoleView.Show();
      document.getElementById('settings-modal-title').innerHTML = this.options.userroletype;
    },

    InitializeReceiptList: function(collection){
      this.receiptListView = new ReceiptListView({
        el: $("#settings-modal-content"),
        collection: collection
      });
      this.receiptListView.SetSelected(this.options.selectedReport);
      document.getElementById('settings-modal-title').innerHTML = collection.at(0).attributes.SubCategory;
    },

    InitializeUserMaintenanceList: function(model){
       if (!this.maintainUserView) {
        this.maintainUserView = new UserMaintenanceView({
           el: $("#settings-modal-content"),
           model: model
        });
        this.maintainUserView.HasChanges = false;
        this.maintainUserView.Show();
        document.getElementById('settings-modal-title').innerHTML = "Maintain User Account";
      }
    },

    InitializeUserAddView: function(model){
      if (!this.addUserView) {
       this.addUserView = new UserAddView({
          el: $("#settings-modal-content"),
          model: model
        });
        // this.addUserView.on('NewUserAdded', this.ResetDisplay, this);
      } else {
        this.addUserView.render();
      }
        document.getElementById('settings-modal-title').innerHTML = "Add User Account";
      },

    InitializePrinterSettings: function(model){
       this.printSettings = new PrintSettingsView({
        el: $("#settings-modal-content"),
        model: model
      });
      document.getElementById('settings-modal-title').innerHTML = "Printer Settings";
      },

    InitializeDejavooConnectionProtocol: function(model) {
      Global.Preference.DejavooConnectionProtocol = model.get("DejavooConnectionProtocol");
      this.protocolView = new ProtocolView({
        el: $("#settings-modal-content"),
        model: model,
      });
      this.protocolView.dejavoo = this.options.dejavoo;
      document.getElementById('settings-modal-title').innerHTML = "Dejavoo Connection Protocol";
    },

    InitializePrinterList: function(collection){
      this.printerListView = new PrinterListView({
        el: $("#settings-modal-content"),
        collection: collection
      });
      this.printerListView.SetSelected(this.options.defaultPrinter);
    },

    close: function(){
      $('#settings-blockoverlay').hide();
      this.$el.find("#settings-modal").remove();
      this.trigger('ModalClose', this);

      this.undelegateEvents();
      this.unbind();
    }

  });
  return SettingsModal;
});
