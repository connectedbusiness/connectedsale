/**
 * @author Connected Business
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'text!template/15.1.0/pos/item/search/freestock.tpl.html'
], function($, $$, _, Backbone, template){
	var StockItemView = Backbone.View.extend({
		_template : _.template( template ),
		initialize : function(){
			this.render();
		},
		render : function(){
			if(this.model.get("IsActive")){
				
				$("#list-detail-content").append( this._template(this.model.toJSON()));
				$("#list-detail-content").listview("refresh");

				$("#detail-bottom-wrapper").css('overflow', 'hidden');
				$("#detail-bottom-wrapper").css('height', '353px');
				$("#detail-bottom-wrapper").css('position', 'relative');
			}

		}
	});
	return StockItemView;
});
