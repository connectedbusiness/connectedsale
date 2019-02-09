define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/enum',
  'shared/shared',
  'text!template/19.1.0/pos/item/header-info/salesrep/salesrepdetail.tpl.html'
], function($, $$, _, Backbone, Global, Enum, Shared, Template) {
  return Backbone.View.extend({
    template: _.template(Template),
    tagName: 'li',
    events: {
      "tap span.salesrep-checkoption": "OptionChange",
      "click .salesrep-commission": "ToggleEvents",
      "change #changeCommission-input": "ChangeCommissionInput",
    },
    
    initialize: function() {
      this.model.on("check", this.SetSelected, this);
      this.isSameSalesRepCodeWithCustomer();
      this.model.set('cid', this.model.cid);
      
      this.$el.html(this.template(this.model.attributes));
      this.$el.attr('data-icon', false);
      this.$el.attr("id", this.model.cid);
      
      Shared.Input.Integer(this.$el.find("#changeCommission-input"));
      
      this.commissionInput = this.$el.find("#changeCommission-input");
      this.CommissionDisplay = this.$el.find("#commission-display");
    },
    
    render: function() {
     return this; 
    },
    
    isSameSalesRepCodeWithCustomer: function () {
      if (Global.CurrentCustomer.CurrentSalesRep == null) {
        var CurrentSalesRep = '';
        
         if (Global.SalesRepList != null && !Shared.IsNullOrWhiteSpace(Global.SalesRepList)) {
           var IsSameSalesRep = _.find(Global.SalesRepList, function (salesrep) {
             return salesrep.SalesRepGroupCode == this.model.get("SalesRepGroupCode");
           }.bind(this));
		  
		  if (IsSameSalesRep != null) {
			this.model.set('RepSplit', IsSameSalesRep.RepSplit);
			return true;
		  }
		  else {
			this.model.set('RepSplit', 0); 
		  }
		}
        else {
          if (Global.IsOverrideSalesRep) {
            CurrentSalesRep = Global.SalesRepGroupCode;
          }
          else {
            CurrentSalesRep = Global.CurrentCustomer.SalesRepCode == null ? Global.CurrentCustomer.SalesRepGroupCode : Global.CurrentCustomer.SalesRepCode;
          }
          if(CurrentSalesRep == this.model.get("SalesRepGroupCode")) {
            this.model.set('RepSplit', 100); 
            return true
          }
          else {
            this.model.set('RepSplit', 0);
          } 
        }
      } 
      else { 
        var IsSameSalesRep = _.find(Global.CurrentCustomer.CurrentSalesRep, function(salesrep) {
          return salesrep.get("SalesRepGroupCode") == this.model.get("SalesRepGroupCode"); 
        }.bind(this));
        
        if (IsSameSalesRep != null) {
          this.model.set('RepSplit', IsSameSalesRep.get("RepSplit"));
          return true;
        }
        else{
          this.model.set('RepSplit', 0); 
        }
      }
    },
    
    OptionChange: function(e) {
      e.preventDefault();
      var isTicked = this.$(e.currentTarget).hasClass('icon-check-empty'), 
          id = e.currentTarget.id,
          isUnchecked = (isTicked) ? false : true;
      
      Shared.CustomCheckBoxChange("#" + id, isUnchecked);
      if (!isUnchecked) this.model.trigger('selected', this.model)
      else this.model.trigger('unselected', this.model);
    },
    
    SetSelected: function (id) {
      var isNotSelected = this.isSameSalesRepCodeWithCustomer();
      Shared.CustomCheckBoxChange("#chkOption-" + id, !isNotSelected);
      if (isNotSelected) this.model.trigger('selected', this.model);
    },
    
    ToggleEvents: function(e) {
      e.preventDefault();
      
      if(this.commissionInput.is(":hidden")) {
        this.commissionInput.show().focus();
        this.CommissionDisplay.hide();
        this.trigger("onEditMode", this.$el.attr("id"));
      }
    },
    
    ChangeCommissionInput: function(e) {
      e.preventDefault(); 
      var value = e.currentTarget.value;
      this.commissionInput.hide();
      this.CommissionDisplay.show();
      
      this.$el.find("h5").html(value + "%");
      this.model.set("RepSplit", value);
    },
    
    ResetCommissionInput: function (e) {
      e.preventDefault();
      e.currentTarget.value = "";
    }
  });
});