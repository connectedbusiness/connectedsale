
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
	'text!template/15.0.1/products/controls/generic-item.tpl.html'
], function ($, $$, _, Backbone, Global, ProductTemplate) {

    var ProductView = Backbone.View.extend({

        _product: _.template(ProductTemplate),

        initialize: function () {
            this.$el.show();
        },

        render: function () {
            this.model.set({ ViewID: this.cid });
            this.$el.html(this._product(this.model.toJSON()));
            return this;
        },

        Show: function () {
            this.render();
        }

    });
    return ProductView;
});



