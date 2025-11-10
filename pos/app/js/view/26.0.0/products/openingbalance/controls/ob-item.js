
/**
 * @author MJFIGUEROA | 05-01-2013
 * Required: el, collection 
 */
define([
    'jquery',
	'mobile',
	'underscore',
	'backbone',
	'text!template/26.0.0/products/openingbalance/controls/ob-item.tpl.html'
], function ($, $$, _, Backbone, OBProductTemplate) {

    var ProductView = Backbone.View.extend({

        _obProduct: _.template(OBProductTemplate),

        initialize: function () {
            this.$el.show();
        },

        render: function () {
            this.model.set({ ViewID: this.cid });
            this.$el.html(this._obProduct(this.model.toJSON()));            
            return this;
        },

        Show: function () {
            this.render();
        }

    });
    return ProductView;
});



