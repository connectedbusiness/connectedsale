/**
 * @author MJFIGUEROA | 05-01-2013
 * Required: el, collection
 */
define([
    'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'shared/shared',
	'text!template/18.2.0/products/products/detail/pricing.tpl.html'
], function ($, $$, _, Backbone, Global, Shared,
             PricingTemplate) {

    var ClassID = {
        AverageCost: ".table-data #data-AverageCost",
        StandardCost: ".table-data #data-StandardCost",
        CurrentCost: ".table-data #data-CurrentCost",
        RetailPrice: ".table-data #data-RetailPrice",
        WholesalePrice: ".table-data #data-WholesalePrice"
    };

    var PricingView = Backbone.View.extend({

        _pricingTemplate: _.template(PricingTemplate),

        events: {
            //"keyup      .table-data #data-AverageCost": "txtChanged_AverageCost",
            "change     .table-data #data-AverageCost": "txtChanged_AverageCost",
            //"keyup      .table-data #data-RetailPrice": "txtChanged_RetailPrice",
            "change     .table-data #data-RetailPrice": "txtChanged_RetailPrice",
            //"keyup      .table-data #data-WholesalePrice": "txtChanged_WholesalePrice",
            "change     .table-data #data-WholesalePrice": "txtChanged_WholesalePrice",
            //"keydown    .table-data #data-AverageCost": "txtKeyDown",
            //"keydown    .table-data #data-RetailPrice": "txtKeyDown",
            //"keydown    .table-data #data-WholesalePrice": "txtKeyDown",
            "blur       .table-data #data-AverageCost": "txtBlur_AverageCost",
            "blur       .table-data #data-RetailPrice": "txtBlur_RetailPrice",
            "blur       .table-data #data-WholesalePrice": "txtBlur_WholesalePrice",
            //CSL : 8822 >> 06.05.13 >> PREBRON
            "focus    	.table-data #data-AverageCost"	 : "SaveAndClearValue",
            "focus    	.table-data #data-RetailPrice"	 : "SaveAndClearValue",
            "focus      .table-data #data-WholesalePrice": "SaveAndClearValue",

            //Keypress
            "keypress #data-AverageCost"    : "txtKeypress",
            "keypress #data-RetailPrice"    : "txtKeypress",
            "keypress #data-WholesalePrice" : "txtKeypress",

             "keyup #data-AverageCost"       : "Price_Keyup",
             "keyup #data-RetailPrice"       : "Price_Keyup",
             "keyup #data-WholesalePrice"    : "Price_Keyup"
        },

        txtChanged_AverageCost: function () { this.InputError(ClassID.AverageCost, true); var val = $(ClassID.AverageCost).val(); this.model.set({ AverageCost: val, CurrentCost: val, StandardCost: val }); this.pricing.HasChanges = true; },
        txtChanged_RetailPrice: function () { this.InputError(ClassID.RetailPrice, true); var val = $(ClassID.RetailPrice).val(); this.pricing.set({ RetailPrice: val }); this.pricing.HasChanges = true; },
        txtChanged_WholesalePrice: function () { this.InputError(ClassID.WholesalePrice, true); var val = $(ClassID.WholesalePrice).val(); this.pricing.set({ WholesalePrice: val }); this.pricing.HasChanges = true; },
        txtKeyDown: function (e) { if (this.PreventNegative(e)) e.preventDefault(); },
        txtBlur_AverageCost: function (e) {
        	this.RevertPreviousValue(e.target.id); //CSL : 8822 >> 06.05.13 >> PREBRON
        	this.Validate(ClassID.AverageCost); },
        txtBlur_RetailPrice: function (e) {
        	this.RevertPreviousValue(e.target.id); //CSL : 8822 >> 06.05.13 >> PREBRON
        	this.Validate(ClassID.RetailPrice); },
        txtBlur_WholesalePrice: function (e) {
        	this.RevertPreviousValue(e.target.id); //CSL : 8822 >> 06.05.13 >> PREBRON
        	this.Validate(ClassID.WholesalePrice); },

        txtKeypress: function (e) {
            Shared.MaxDecimalPlaceValidation($("#" + e.target.id), e);
        },

        Price_Keyup : function(e) {
            //console.log(e.currentTarget.value)
            if (e.currentTarget.value == '0.' || e.currentTarget.value == '.') {
                $(e.target).val("0.0");
                $(e.target).focus();
                $(e.target).val("0.");
            }
        },

        PreventNegative: function (e) {
            if (!e) return false;
            var c = e.keyCode;
            if (c == 109 || c == 189) return true;
            return false;
        },

        initialize: function () {
            this.$el.show();
            this.IsNew = false;
        },

        render: function () {
            this.model.set({ CurrencySymbol: Global.CurrencySymbol });
            this.model.set(this.pricing.attributes);
            this.$el.html(this._pricingTemplate(this.model.toJSON()));

            this.CheckItemType();
            this.CheckReadOnlyMode();
            this.CheckIsNew();
            return this;
        },

        CheckIsNew: function(){
            if(!this.IsNew){
            //Hide
               $('.tr-cost-type').css('display', 'none');
               $('.tr-cost-data').css('display', 'none');
               $('.tr-cost-data-cost').css('display', 'none');
             }
        },

        CheckReadOnlyMode: function () {
            if (this.options.IsReadOnly) {
                $(ClassID.AverageCost).addClass('ui-readonly');
                $(ClassID.RetailPrice).addClass('ui-readonly');
                $(ClassID.WholesalePrice).addClass('ui-readonly');

                //Hide
                $('.tr-cost-type').css('display', 'none');
                $('.tr-cost-data').css('display', 'none');
                $('.tr-cost-data-cost').css('display', 'none');
            }

        },

        Show: function () {
            this.render();
        },

        Close: function () {
            this.remove();
            this.unbind();
        },

        InitializeChildViews: function () {
        },

        InputError: function (ctl, _clear) {
            if (_clear) $(ctl).removeClass('cs-input-error');
            else $(ctl).addClass('cs-input-error');
        },

        CheckItemType: function () {
            if (this.model) {
                var itemType = this.model.get("ItemType");
                var cssDisplay = '';
                if (itemType == "Gift Card" || itemType == "Gift Certificate") cssDisplay = 'none';

                $(".tr-cost-type").css('display', cssDisplay);
                $(".tr-cost-data").css('display', cssDisplay);
                $(".tr-cost-data-cost").css('display', cssDisplay);
                $(".tr-pricing-data-retail").css('display', cssDisplay);
            }
        },

        Validate: function (ctl) {
            if (!this.model || !this.pricing) return true;

            if ((!ctl || ctl == ClassID.AverageCost) && ($.trim(this.model.get('AverageCost')) < 0)) {
                this.ValidationError = "AverageCost";
                this.trigger('validationError');
                this.InputError(ctl);
                return false;
            }
            if ((!ctl || ctl == ClassID.WholesalePrice) && ($.trim(this.pricing.get('WholesalePrice')) < 0)) {
                this.ValidationError = "WholesalePrice";
                this.trigger('validationError');
                this.InputError(ctl);
                return false;
            }
            if ((!ctl || ctl == ClassID.RetailPrice) && ($.trim(this.pricing.get('RetailPrice')) < 0)) {
                this.ValidationError = "RetailPrice";
                this.trigger('validationError');
                this.InputError(ctl);
                return false;
            }

            return true;
        },

        // CSL : 8822 >> 06.05.13 >> PREBRON
        SaveAndClearValue : function(e) {
        	var elem = '#' + e.target.id;
        	var val = $(elem).val();

        	switch(e.target.id) {
        		case "data-AverageCost" 	:  this.cost 		= val; 	break;
        		case "data-RetailPrice" 	:  this.retail 		= val; 	break;
        		case "data-WholesalePrice"  :  this.wholesale 	= val; 	break;
        	}
        	$(elem).val('');
        	this.AssignNumericValidation(e);
        },

		AssignNumericValidation : function(e) {
        	var elem = '#' + e.target.id;
        	Shared.Input.NonNegative(elem);
        },

        RevertPreviousValue : function(elemID) {
        	var val = $('#' + elemID).val();
        	var lastVal = '';

        	if(val !== '') lastVal = parseFloat(val);
        	else {
	        	switch(elemID) {
	        		case "data-AverageCost" 	:  lastVal = this.cost; 	break;
	        		case "data-RetailPrice" 	:  lastVal = this.retail; 	break;
	        		case "data-WholesalePrice"  :  lastVal = this.wholesale; 	break;
	        	}
        	}
        	$('#' + elemID).val(lastVal)
        },


    });
    return PricingView;
});
