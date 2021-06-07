define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/enum',
  'shared/service',
  'shared/method',
  'shared/shared',
  'collection/salesreps',
  'collection/base',
  'view/20.1.0/pos/salesrep/salesrepdetail',
  'text!template/20.1.0/pos/item/header-info/salesrep/salesreplist.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Enum, Service, Method, Shared, SalesRepCollection, BaseCollection, SalesRepDetailView, SalesRepListTemplate) {
  return Backbone.View.extend({
    template: _.template(SalesRepListTemplate),
    events: {
      "click #done-salesrep": "close",
    },
    close: function(e) {
      e.preventDefault();

      var TotalCommission = this.SelectedSalesRepCollection.reduce(function(memo, num) {
        return memo + parseFloat(num.get("RepSplit")); 
      }, 0);
      
      if (this.salesrepscollection.length > 0)
      {
        if (TotalCommission == 100) {
          var SalesRepName = "";
          var RepSplit = "";
          var SalesRepCode = "";

          var CommissionPercentResult = this.SelectedSalesRepCollection.pluck("RepSplit");
          if (CommissionPercentResult.length > 1) {
            _.each(CommissionPercentResult, function (salerep, i) { 
              if (i >= CommissionPercentResult.length - 1) 
              { RepSplit += salerep + "%" } else 
              { RepSplit += (salerep + "%" + ", ") }
              i++;
            })}
          else {
            RepSplit = CommissionPercentResult;
          }

          var SalesRepResult = this.SelectedSalesRepCollection.pluck("SalesRepGroupName");
          _.each(SalesRepResult, function (salerep, i) { 
            if (i >= SalesRepResult.length - 1) 
            { SalesRepName += salerep } else 
            { SalesRepName += (salerep + ", ") }
            i++;
          });
        
          Global.SalesRepGroupName = SalesRepName;
          Global.RepSplit = RepSplit;
          Global.CurrentCustomer.CurrentSalesRep = this.SelectedSalesRepCollection.models;
          Global.SalesRepList = this.SelectedSalesRepCollection.models;

          $("#lbl-salesrepName").html(Shared.TrimSalesRepName());
          $("#splitrateName").html(Shared.TrimCommissionPercent());
          $('#main-transaction-blockoverlay').hide();

          this.unbind();
          this.remove();
        }
        else {
          if (TotalCommission > 0) {
            navigator.notification.alert("Commission Total must be equal to 100%.", null, "Action Not Allowed", "OK");
          } else {
            $('#main-transaction-blockoverlay').hide();
            this.unbind();
            this.remove();
          }
        } 
      } else {
        $('#main-transaction-blockoverlay').hide();
        this.unbind();
        this.remove();
      }
    },
    
    initialize: function() {
      this.SelectedSalesRepCollection = new BaseCollection();
      this.rows = this.options.rows;
      this.$el.html(this.template);
      this.LoadSalesRep();
      this.salesRepList = this.$el.find("#salesrep-list");
    },
    
    render: function() {
      return this;
    },
    
    LoadSalesRep: function() {
      this.salesrepscollection = new SalesRepCollection();
      this.salesrepscollection.on("reset", this.RenderSalesRepList, this);
      this.salesrepscollection.on("error", this.LoadSalesRepError, this);
      this.salesrepscollection.on('selected', this.SetSelected, this);
      this.salesrepscollection.on('unselected', this.SetUnSelected, this);
      var criteria = "?rows=" + this.rows;
        
      this.salesrepscollection.url = Global.ServiceUrl + Service.CUSTOMER + Method.SALESREPLOOKUP + criteria;
      this.salesrepscollection.fetch();
    },
    
    RenderSalesRepList: function (collection) {
      this.trigger("hideSpinner");
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      collection.each(this.RenderSalesRep, this);
      this.$el.find('ul').listview().listview('refresh');
      this.loadScroll();
    },
    
    RenderSalesRep: function (model) {
      var salesrepdetailview = new SalesRepDetailView({
        model: model
      });
      
      salesrepdetailview.on("onEditMode", this.processEditMode, this);
      this.$el.find("#salesrep-list").append(salesrepdetailview.render().el);
      salesrepdetailview.SetSelected(model.cid);
    },
    
    LoadSalesRepError: function (collection, error, response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      navigator.notification.alert("Error loading Sales Rep", null, "Error", "OK");
    },
    
    loadScroll: function() {
      this.scrollAttrib = {
        vScrollbar: false,
        vScroll: true,
        snap: false,
        momentum: true,
        hScrollbar: true,
        onBeforeScrollStart: function(e) {
          var target = e.target;
          while (target.nodeType != 1) target = target.parentNode;

          if (target.tagName != 'INPUT') e.preventDefault();
        }
      };
      
      if (Global.isBrowserMode) Shared.UseBrowserScroll('#salesrep-list');
      else {
        if (!this.myScroll) this.myScroll = new iScroll('salesrep-content', this.scrollAttrib);
        else this.myScroll.refresh();
      }
    },
    
    SetSelected: function(model) {
      this.SelectedSalesRepCollection.add(model);
    },
    
    SetUnSelected: function(model) {
      this.SelectedSalesRepCollection.remove(model);
    },
    
    processEditMode: function (id) {
      this.$el.find('ul').listview().listview('refresh');
      this.salesRepList.find("li:not(#"+id+")").find("#changeCommission-input").hide();
      this.salesRepList.find("li:not(#"+id+")").find("#commission-display").show();
    },
    
  });
});