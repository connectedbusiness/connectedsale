/**
 * CUSTOMER - MAINTENANCE
 * @author PREBRON | 05-07-2013
 * Required: el, collection
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'shared/service',
  'shared/method',
  'model/base',
  'model/lookupcriteria',
  'collection/base',
  'view/21.0.0/products/controls/generic-list',
  'view/21.0.0/customers/customers/customer-detail',
  'text!template/21.0.0/customers/customers/customer-form.tpl.html',
  'text!template/21.0.0/customers/controls/generic-layout.tpl.html',
], function($, $$, _, Backbone, Global, Shared, Service, Method,
  BaseModel, LookUpCriteriaModel,
  BaseCollection,
  GenericListView, CustomersDetailView,
  CustomersFormTemplate, GenericLayOutTemplate) {

  var ClassID = {
    SearchInput: "#txt-search",
    CustomerForm: "#customers-form"
  }

  var CurrentTab = "General";

  var CustomersMainView = Backbone.View.extend({

    _customersFormTemplate: _.template(CustomersFormTemplate),
    _genericLayoutTemplate: _.template(GenericLayOutTemplate),

    initialize: function() {
      currentInstance = this;
      this.UnloadConfirmationMessage = null;
      this.IsNew = false;
    },

    render: function() {
      this.$el.html(this._customersFormTemplate);
      this.$(ClassID.CustomerForm).html(this._genericLayoutTemplate);
      return this;
    },

    Show: function() {
      CurrentTab = "General";
      this.LoadItems();
      this.render();
    },

    HasChanges: function() {
      if (this.IsNew) {
        this.UnloadConfirmationMessage = "Do you want to cancel this new record?";
        return true;
      }
    },

    InitializeChildViews: function() {},

    InitializeCustomerModel: function() {
      this.customerModel = new LookUpCriteriaModel();
      this.customerModel.on('sync', this.CustomerLookUpLoadSuccess, this);
      this.customerModel.on('error', this.CustomerLookUpLoadError, this);
    },

    CustomerLookUpLoadSuccess: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (!this.customerCollection) this.customerCollection = new BaseCollection();
      this.customerCollection.reset(response.Customers);
      this.DisplayItemList();
    },

    CustomerLookUpLoadError: function(model, error, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      console.log(model);
    },

    LoadItems: function(criteria) {
      switch (CurrentTab) {
        case "General":
          this.LoadCustomers(criteria);
          break;
        case "Contact":
          this.LoadCustomerContacts(criteria);
          break;
        case "Note":
          this.LoadCustomerNotes(this.customerDetailView.CustomerCode, criteria);
          break;
      }
    },

    LoadCustomers: function(criteria) {
      this.SetCurrentTab();
      console.log("Load customers");
      if (criteria === "" || criteria === undefined) criteria = null;
      this.InitializeCustomerModel();

      this.customerModel.set({
        StringValue: criteria,
      })

      this.customerModel.url = Global.ServiceUrl + Service.CUSTOMER + Method.CUSTOMERLOOKUP + "100";
      this.customerModel.save();
    },

    DisplayItemList: function() {
      if (!this.currentCollection) this.currentCollection = new BaseCollection();
      this.currentCollection = this.GetCurrentCollection();
      if (!this.genericListView) this.InitializeGenericListView();
      else {
        this.GenericListViewSettings();
        this.genericListView.RefreshList(this.currentCollection);
      }
      //else this.genericListView.RefreshList(this.customerCollection);
      this.SelectedItem();
    },

    GenericListViewSettings: function() {
      var _placeHolder = null,
        _displayField = null;
      switch (CurrentTab) {
        case "Contact":
          _placeHolder = "Search Contacts";
          _displayField = "ContactFullName";
          break;
        case "General":
          _placeHolder = "Search Customers";
          _displayField = "CustomerName";
          break;
        case "Note":
          _placeHolder = "Search Notes";
          _displayField = "Title"
          break;
        // case "Report":
        //   _placeHolder = "Search Customers";
        //   _displayField = "CustomerName";
        //   break;
        default:
          console.log('no GenericListViewSettings set.');
      }
      this.genericListView.SetPlaceHolder(_placeHolder);
      this.genericListView.SetDisplayField(_displayField);
    },

    // sets the current tab.
    SetCurrentTab: function() {
      if (this.customerDetailView) CurrentTab = this.customerDetailView.CurrentTab
    },

    // returns the customerDetailView's current Collection.
    GetCurrentCollection: function() {
      if (!this.customerDetailView) return this.customerCollection;
      this.SetCurrentTab();

      switch (CurrentTab) {
        case "Contact":
          return this.contactCollection;
          break;
        // case "Report":
        case "General":
          return this.customerCollection;
          break;
        case "Note":
          return this.noteCollection;
          break;
        default:
          console.log('no collection got.');
      }
    },

    // returns the customerDetailView's current model.
    GetCurrentModel: function() {
      switch (CurrentTab) {
        case "General":
          return this.customerDetailView.customerModel;
          break;
        case "Contact":
          return this.customerDetailView.contactModel;
          break;
        case "Note":
          return this.customerDetailView.noteModel;
          break;
        default:
          console.log('no model got.');
      }
    },

    // returns the customerDetailView's current model code.
    GetCurrentCode: function() {
      switch (CurrentTab) {
        case "General":
          return this.customerDetailView.CustomerCode;
          break;
        case "Contact":
          return this.customerDetailView.ContactCode;
          break;
        case "Note":
          return this.customerDetailView.NoteCode;
          break;
        default:
          console.log('no code got.');
      }
    },

    // returns the coverted TabName.
    GetTabName: function() {
      var tabName = "";
      switch (CurrentTab) {
        case "General":
          tabName = "Customer";
          break;
        case "Contact":
          tabName = "Contact";
          break;
        case "Note":
          tabName = "Note";
          break;
        default:
          console.log('No tabName got.');
      }
      return tabName;
    },

    SearchItem: function() {
      if (this.genericListView) this.LoadItems(this.genericListView.GetItemToSearch());
    },

    SelectedItem: function(model) {
      if (this.IsNew) return;
      Global.ListJustTapped = true;
      if (this.genericListView) {
        if (!this.customerDetailView) this.InitializeCustomerDetailsView();

        if (this.genericListView.GetSelectedModel() || this.genericListView.GetFirstModel()) {
          this.customerDetailView.model = new BaseModel();
          var tmpModel = this.genericListView.GetSelectedModel() || this.genericListView.GetFirstModel();
          this.customerDetailView.model = tmpModel;
        } else {
          //if (this.customerCollection) if (this.customerCollection.models.length > 0) this.customerDetailView.model = this.customerCollection.at(0);
          if (this.CurrentCollection) {
            //if(this.customerCollection.models.length > 0) this.customerDetailView.model = this.customerCollection.at(0);
            if (this.CurrentCollection.models.length > 0) this.customerDetailView.model = this.CurrentCollection.at(0);
            else this.customerDetailView.model = null;
          } else this.customerDetailView.model = null;
        }

        if (Global.justRefreshCollection) {
          var _model = this.GetCurrentModel();
          //this.customerDetailView.model = this.customerDetailView.customerModel
          this.customerDetailView.model = _model;

          this.SetSelectedAttribute();
          Global.justRefreshCollection = false;
        } else {
          if (Global.fromContactsToGeneralTab) {
            /*(this.customerDetailView.ContactEntityCode || this.customerDetailView.CustomerCode),*/
            this.genericListView.SelectByAttribute("CustomerCode", (this.customerDetailView.CustomerCode || this.customerDetailView.ContactEntityCode), false, true);
            if (this.genericListView.GetSelectedModel()) this.customerDetailView.model = this.genericListView.GetSelectedModel();
            else this.customerDetailView.model = this.customerDetailView.customerModel;
            Global.fromContactsToGeneralTab = false;
          }
        }

        this.customerDetailView.toBeSearched = this.genericListView.GetItemToSearch();
        this.customerDetailView.IsNew = false;
        this.customerDetailView.Show(model);
      }
    },

    SetSelectedAttribute: function(view) {
      switch (CurrentTab) {
        case "General":
          this.genericListView.SelectByAttribute("CustomerCode", this.customerDetailView.CustomerCode);
          break;
        case "Contact":
          this.genericListView.SelectByAttribute("ContactCode", this.customerDetailView.ContactCode);
          break;
        case "Note":
          this.genericListView.SelectByAttribute("NoteCode", this.customerDetailView.NoteCode);
          break;
        default:
          console.log('no collection got.');
      }
    },

    InitializeGenericListView: function() {
      this.genericListView = new GenericListView({
        el: "#left-panel",
        collection: this.customerCollection,
      });
      this.genericListView.on("search", this.SearchItem, this);
      this.genericListView.on("selected", this.SelectedItem, this);
      this.genericListView.on("add", this.AddMode, this);
      //this.genericListView.on("loaded", this.ListLoaded, this);
      this.genericListView.collection = this.customerCollection;
      this.genericListView.SetPlaceHolder("Search Customers");
      this.genericListView.SetDisplayField("CustomerName");
      this.genericListView.Show();
    },

    InitializeCustomerDetailsView: function() {
      this.customerDetailView = new CustomersDetailView({
        el: "#right-panel"
      });
      this.customerDetailView.on('loadCustomers', this.ReloadCustomers, this);
      this.customerDetailView.on('schemaFetched', this.SchemaFetched, this);
      this.customerDetailView.on('newCustomerSaved', this.NewCustomerSaved, this);
      this.customerDetailView.on('deleted', this.DeleteSuccess, this);
      this.customerDetailView.on('cannotDelete', this.DeleteFailed, this);
      this.customerDetailView.on("updated", this.UpdateSuccess, this);
      this.customerDetailView.on("cancel", this.CancelNew, this);
      /** contacts Handler **/
      this.customerDetailView.on("loadCustomerContacts", this.LoadContacts, this);
      this.customerDetailView.on('newContactSaved', this.NewContactSaved, this);

      this.customerDetailView.on("loadCustomerNotes", this.LoadNotes, this);
      this.customerDetailView.on('newNoteSaved', this.NewNoteSaved, this);

      this.customerDetailView.on('failed', this.LoadPreviousModel, this);

      // this.customerDetailView.on("loadCustomerReport", this.LoadReport, this);

    },

    /** CUSTOMERS TRIGGERS AND EVENTS **/

    LoadPreviousModel: function(model) {
      Global.justRefreshCollection = false;
      this.IsNew = false;
      this.customerDetailView.IsNew = false;
      Shared.Customers.Overlay.Hide();
    },

    ReloadCustomers: function() {
      //if(this.customerDetailView) CurrentTab = this.customerDetailView.CurrentTab
      this.SetCurrentTab();
      this.trigger('tabChanged', 'Customers');
      this.DisplayItemList();
    },

    SchemaFetched: function(view) {
      if (this.customerDetailView) {
        var mdl = new BaseModel();
        switch (CurrentTab) {
          case "General":
            mdl.set(view.customerschema.attributes);
            break;
          case "Contact":
            mdl.set(view.contactschema.attributes);
            break;
          default:
            console.log('no schema fetched at ' + CurrentTab + '.');
        }
        this.customerDetailView.IsNew = true;
        this.customerDetailView.model = mdl;
        this.customerDetailView.Show(mdl);
        Shared.Customers.Overlay.Hide();
      }
    },

    NewCustomerSaved: function(view) {
      var custCode = this.customerDetailView.CustomerCode;
      Shared.Customers.ShowNotification("Customer '" + custCode + "' was successfully saved!");
      Global.justRefreshCollection = true;
      this.IsNew = false;
      this.customerDetailView.IsNew = false;
      if (this.genericListView) this.LoadItems();
      Shared.Customers.Overlay.Hide();
    },

    DeleteSuccess: function(view) {
      //'Unable to delete because the record already have transactions.','Invalid Action');
      var _codeDeleted = this.GetCurrentCode();
      var _tabName = this.GetTabName();
      Shared.Customers.ShowNotification(_tabName + " '" + _codeDeleted + "' was successfully deleted!");
      this.IsNew = false;
      this.customerDetailView.IsNew = false;
      if (this.genericListView) this.LoadItems("");
      Shared.Customers.Overlay.Hide();
    },

    DeleteFailed: function(view) {
      var msg = this.customerDetailView.errorDeleteMsg;
      Shared.Customers.Overlay.Hide();
      Shared.Customers.ShowNotification(msg, true);
    },

    UpdateSuccess: function(view) {
      var _tabName = this.GetTabName();
      var _currentCode = this.GetCurrentCode();
      if (this.customerDetailView.model.get("ErrorMessage") !== null) Shared.Customers.ShowNotification(this.customerDetailView.model.get("ErrorMessage"), true);
      else {
        Global.justRefreshCollection = true;
        Shared.Customers.ShowNotification("Changes on " + _tabName + " '" + _currentCode + "' was successfully saved!");
        if (this.genericListView) this.LoadItems("");
      }
      Shared.Customers.Overlay.Hide();
    },

    //method called by Customers.js (Parent View)
    ProceedToGeneralView: function() {
      Global.fromContactsToGeneralTab = true;
      this.customerDetailView.CurrentTab = "General";
      CurrentTab = "General";
      this.IsNew = false;
      this.customerDetailView.IsNew = false;
      this.ReloadCustomers();
    },

    CancelNew: function() {
      this.ConfirmCancelChanges("DoCancelNew");
      //this.SearchItem();
    },

    DoCancelNew: function() {
      this.IsNew = false;
      this.customerDetailView.IsNew = false;
      this.SelectedItem();
    },

    AddMode: function() {
      if (Global.Preference.AllowAddCustomer || CurrentTab === 'Contact') {
        if (this.customerDetailView) {
          this.customerDetailView.AddMode();
          this.IsNew = true;
        }
      } else {
        navigator.notification.alert("Adding new customer is not allowed.", null, "Action Not Allowed", "OK");
        return;
      }

    },

    /** CONTACTS TRIGGERS AND EVENTS**/
    LoadContacts: function(customerCode) {
      this.SetCurrentTab();
      var _custName = this.customerDetailView.CustomerName;
      this.trigger('tabChanged', 'Contacts of <a id="customer-name-a">' + Shared.Escapedhtml(_custName) + '</a>');
      this.LoadCustomerContacts(customerCode);
    },

    NewContactSaved: function(view) {
      var contactCode = this.customerDetailView.ContactCode;
      Shared.Customers.ShowNotification("Contact '" + contactCode + "' was successfully saved!");
      Global.justRefreshCollection = true;
      this.IsNew = false;
      this.customerDetailView.IsNew = false;
      if (this.genericListView) this.LoadItems();
      Shared.Customers.Overlay.Hide();
    },

    LoadCustomerContacts: function(customerCode) {
      if (customerCode === "" || customerCode === undefined) customerCode = null;

      var contactModel = new LookUpCriteriaModel();
      contactModel.on('sync', this.ContactLookUpLoadSuccess, this);
      contactModel.on('error', this.ContactLookUpLoadError, this);

      var _entityCode = this.customerDetailView.CustomerCode;

      contactModel.set({
        StringValue: customerCode,
        EntityCode: _entityCode,
        Type: 'CustomerContact'
      });

      contactModel.url = Global.ServiceUrl + Service.CUSTOMER + Method.CONTACTSLOOKUP + "100";
      contactModel.save();
    },

    ContactLookUpLoadSuccess: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (!this.contactCollection) this.contactCollection = new BaseCollection();
      this.contactCollection.reset(response.CRMContacts);
      this.DisplayItemList();
    },

    ContactLookUpLoadError: function(model, xhr, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      model.RequestError(error, "Error Loading Contacts", "An error was encountered when trying to load contacts.");
    },

    /** NOTES TRIGGERS AND EVENTS **/
    LoadNotes: function(customerCode) {
      this.SetCurrentTab();
      var custName = this.customerDetailView.CustomerName;
      this.trigger('tabChanged', 'Notes of <a id="customer-name-a">' + Shared.Escapedhtml(custName) + '</a>');
      this.LoadCustomerNotes(customerCode);
    },

    LoadCustomerNotes: function(customerCode, criteria) {
      if (customerCode == "" || customerCode == undefined) customerCode = null;

      var noteModel = new LookUpCriteriaModel();
      noteModel.on('sync', this.NoteLookupLoadSuccess, this);
      noteModel.on('error', this.NoteLookupLoadError, this);

      var entityCode = this.customerDetailView.CustomerCode;

      noteModel.set({
        CustomerCode: customerCode,
        CriteriaString: criteria
      });

      noteModel.url = Global.ServiceUrl + Service.CUSTOMER + Method.LOADCUSTOMERNOTELOOKUP;
      noteModel.save();
    },

    NoteLookupLoadSuccess: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (!this.noteCollection) this.noteCollection = new BaseCollection();
      this.noteCollection.reset(response.OrderNotes);
      this.DisplayItemList();
    },

    NoteLookupLoadError: function(model, xhr, options) {

    },

    NewNoteSaved: function(view) {
      var noteCode = this.customerDetailView.NoteCode;
      Shared.Customers.ShowNotification("Note '" + noteCode + "' was successfully saved!");
      Global.justRefreshCollection = true;
      this.IsNew = false;
      this.customerDetailView.IsNew = false;
      if (this.genericListView) this.LoadItems();
      Shared.Customers.Overlay.Hide();
    },

    // LoadReport: function(customerCode) {
    //   this.SetCurrentTab();
    //   var custName = this.customerDetailView.CustomerName;
    //   this.trigger('tabChanged', '<a id="customer-name-a">' + Shared.Escapedhtml(custName) + '</a> Report settings');
    //   this.DisplayItemList();
    // },

    ConfirmCancelChanges: function(onYes, onNo) {
      this.DoOnCancel = onNo;
      this.DoOnConfirm = onYes;
      if (this.HasChanges()) {
        navigator.notification.confirm(this.UnloadConfirmationMessage, cancelChanges, "Confirmation", ['Yes', 'No']);
      } else {
        this.ConfirmExecute();
      }
    },

    ConfirmExecute: function() {
      if (!this.DoOnConfirm) return;
      this[this.DoOnConfirm]();
    },

    CancelExecute: function() {
      if (!this.DoOnCancel) return;
      this[this.DoOnCancel]();
    }

  });

  var currentInstance;
  var cancelChanges = function(button) {
    if (button == 1) {
      currentInstance.ConfirmExecute();
    } else {
      currentInstance.CancelExecute();
    }
  }

  return CustomersMainView;
});
