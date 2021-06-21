/** 
 * @author MJFIGUEROA | 05-01-2013
 * Required: el, collection 
 */
define([
    'jquery',
	'mobile',
	'underscore',
	'backbone',	
	'shared/shared',
    'model/base',
    'model/lookupcriteria',
    'collection/base',
	'text!template/22.0.0/products/openingbalance/detail/general.tpl.html',
	'js/libs/moment.min.js',
    'js/libs/format.min.js'
], function ($, $$, _, Backbone, Shared,
             BaseModel, LookUpCriteriaModel,
             BaseCollection,
             GeneralTemplate) {

    var GeneralView = Backbone.View.extend({

        _generalTemplate: _.template(GeneralTemplate),

        events: {  },

        initialize: function () {
            this.$el.show();
            this.IsNew = false;
        },
		
		ConvertTransactionDate : function(){
		   var DateFormat = 'L';
		   var _tDate = moment((this.model.get("TransactionDate")) ).format(DateFormat); 
		   this.model.set({ ConvertedTransactionDate : _tDate })
		},
		
		SetEscapedHtml : function () {
            var _itemName = this.model.get("ItemName");
            _itemName = Shared.Escapedhtml(_itemName);
            this.model.set({ ItemName : _itemName });
        },
		
        render: function () {
            this.ConvertTransactionDate();
            this.SetEscapedHtml();
            this.$el.html(this._generalTemplate(this.model.toJSON()));
            return this;
        },
        
       

        Show: function () {
            this.render();
        },

        Close: function () {
            this.remove();
            this.unbind();
        },

        InitializeChildViews: function () {
        }

    });
    return GeneralView;
});



