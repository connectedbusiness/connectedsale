/**
 * @author alexis.banaag
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'text!template/24.0.0/pos/itemdetail/um/um.tpl.html'
], function($, $$, _, Backbone, template){
	var UnitOfMeasureView = Backbone.View.extend({
		_template : _.template( template ),
		
		tagName: "ul",
 		className : "unitOfMeasurement-container",
 		attributes : {
 			"data-role": "listview",
 			"data-inset": "true"
 		},
 		
		render : function(_collection) {
			var self = this;
 			self.$el.html("");
			_collection.each(function(model){
				self.$el.append(self._template(model.toJSON()));
			});	
			return this;
		}
	});
	return UnitOfMeasureView;
});
