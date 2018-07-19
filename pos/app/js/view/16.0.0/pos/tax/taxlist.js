define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/base',
  'collection/base',
  './tax',
  'text!template/16.0.0/pos/tax/taxlist.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Service, Method, Shared, BaseModel, BaseCollection, TaxView, template) {

  return Backbone.View.extend({
    template: _.template(template),

    events: {
      "click #done": "done"
    },

    done: function(e) {
      e.preventDefault();
      /*
       * @TODO: Make sure to call this.close() to prevent memory leaks.
       */
      if (this.taxCode) this.processRecalculate();
      this.close();
    },

    initialize: function() {
      this.$el.html(this.template);
      if (!this.model) this.model = new BaseModel();
      if (!this.collection) this.collection = new BaseCollection();

      this.list = this.$el.find('#taxListContainer');

    },

    render: function() {
      //this.list.listview();
      this.listener();
      this.loadTaxList();
      $('#main-transaction-blockoverlay').show();
      return this;
    },

    listener: function() {
      this.collection.on('reset', this.renderAll, this);
      this.collection.on('selected', this.changeTaxCode, this);
    },

    close: function() {
      console.log('Closing and removing event bindings', this);
      $('#main-transaction-blockoverlay').hide();
      this.unbind();
      this.remove();
    },

    loadTaxList: function() {
      //var taxSchemes = window.localStorage.getItem('taxSchemes');
      var isLocation = Global.Preference.TaxByLocation;

      if (!isLocation){
        this.model.url = Global.ServiceUrl + Service.CUSTOMER + Method.TAXSCHEMELOOKUP + 100 + '/' + Global.Preference.CompanyCountry;
      }
      else{
        this.model.url = Global.ServiceUrl + Service.CUSTOMER + "TaxSchemeLookupByLocation/" + Global.Preference.CompanyCountry + "/" + Global.ShipTo.WarehouseCode;
      }
      this.model.save(null, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!Shared.IsNullOrWhiteSpace(response.ErrorMessage)) {
            navigator.notification.alert('Fetching Tax Response : ' + response.ErrorMessage, null, "Error", "OK");
            return;
          }

          //taxSchemes = JSON.stringify(response.SystemTaxSchemes);
          //window.localStorage.setItem('taxSchemes', taxSchemes);

          //this.collection.reset(JSON.parse(taxSchemes));
          this.collection.reset(response.SystemTaxSchemes);
        }.bind(this),
        error: function(xhr, errorCode, errorMessage) {
          console.log(errorCode, errorMessage);
        }.bind(this)
      });
      
      /*if (!taxSchemes) {
        this.model.url = Global.ServiceUrl + Service.CUSTOMER + Method.TAXSCHEMELOOKUP + 100 + '/' + Global.Preference.CompanyCountry;
        this.model.save(null,{
          success: function(model, response, options) {
            if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
			      if (!Shared.IsNullOrWhiteSpace(response.ErrorMessage)) {
              navigator.notification.alert('Fetching Tax Response : ' + response.ErrorMessage, null, "Error", "OK");
              return;
            }

            taxSchemes = JSON.stringify(response.SystemTaxSchemes);
            //window.localStorage.setItem('taxSchemes', taxSchemes);

            this.collection.reset(JSON.parse(taxSchemes));
          }.bind(this),
          error: function(xhr, errorCode, errorMessage) {
            console.log(errorCode, errorMessage);
          }.bind(this)
        });
      } else {
        this.collection.reset(JSON.parse(taxSchemes), {silent:true});
        this.collection.each(this.renderOne, this);
      }*/
    },

    renderAll: function() {
      this.collection.each(this.renderOne, this);
      this.list.listview().listview('refresh');
      this.LoadScroll();
    },

    renderOne: function(model) {
      var item = new TaxView({
        model: model
      });

      if (item.isSelected) this.list.prepend(item.render().el);
      else this.list.append(item.render().el);
      this.LoadScroll();
    },

    LoadScroll: function() {
      var self = this;

      if (Global.isBrowserMode) Shared.UseBrowserScroll('#tax-inner');
      else {
        if (!this.myScroll) {
          this.myScroll = new iScroll('tax-inner');
        } else {
          this.myScroll.refresh();
        }
      }
    },

    changeTaxCode: function(model) {
      this.taxCode = model.get('TaxCode');
      //if (this.taxCode) this.processRecalculate();
    },

    processRecalculate: function() {
      console.log(this.taxCode);
      window.sessionStorage.setItem('selected_taxcode', this.taxCode);
      this.trigger('changeTaxCode', this.taxCode);
    }
  });
});
