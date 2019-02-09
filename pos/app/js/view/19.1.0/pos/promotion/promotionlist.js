define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'collection/base',
  'shared/shared',
  'shared/method',
  'shared/enum',
  'text!template/19.1.0/pos/promotion/promotionlist.tpl.html'
], function($, $$, _, Backbone, Global, Service, BaseCollection, Shared, Method, Enum, template){
	var PromoListView = Backbone.View.extend({
		template: _.template(template),
		tagName: 'li',
		
		initialize: function(model){
		  this.model.set('cid', this.model.cid);
	  	  this.$el.attr('id', this.model.cid);
			this.model.set('CurrencySymbol', Global.CurrencySymbol);
			this.model.set('ImageLocation', this.showImage());
			 this.$el.html(this.template(
			 	this.model.attributes
			 ));
		},
		events: {
		  "click": "select",
      	  "tap span.promo-checkoption": "OptionChange"
		},
		select: function(e) {
		  e.preventDefault();
      	  $(e.currentTarget).addClass('selected');
//		  var isSelected = this.$el.hasClass("selected");
//		  if (!isSelected) {
//			this.model.trigger('resetSelected');
//			$(e.currentTarget).addClass('selected');
//			this.model.trigger('selected_option', this.model);
//		  }
		},
		removeSelected: function() {
      		this.$el.removeClass('selected');
    	},
		render: function(){
			return this;
		},

		showImage: function() {
    	  return Global.ServiceUrl + Method.IMAGES + this.model.get("ItemCode") + ".png?" + Math.random();
	    },
		
		OptionChange: function(e) {
			var self = this;
		  e.preventDefault();
		  var isTicked = this.$(e.currentTarget).hasClass('icon-check-empty'),
			id = e.currentTarget.id,
			isUnchecked = (isTicked) ? false : true;
/*			  this.model.set({
				"IsSelected": true
			  });*/
			
		 var selected = new BaseCollection(self.collection.filter(function(detail) {
	        return detail.get("IsSelected") == true
	     }.bind(this)));

/*			//Remove Check
			var list = $("#promo-form-list").find("ul").children();
			_.each(list, function(li) {
			var list_id = $(li).find("span").attr("id");
			Shared.CustomCheckBoxChange("#" + list_id, true);
			});*/
			selected.each(function(items){
				if(items.get('RuleID') != self.model.get('RuleID')) {
					items.set('IsSelected',false)
					Shared.CustomCheckBoxChange("#" + 'chkOption-' + items.cid, true);
				}
			});
		  if(self.model.get('GetType') == 'ALL') {
			  self.collection.each(function(detail) {
				if (detail.get("RuleID") == self.model.get('RuleID'))
				{
					detail.set('IsSelected',isTicked);
					Shared.CustomCheckBoxChange("#" + 'chkOption-' + detail.cid, isUnchecked);
				}
			  }.bind(this));
		  }
			else {
					self.model.set('IsSelected',isTicked);
					Shared.CustomCheckBoxChange("#" + id, isUnchecked);
			}
			 self.collection.each(function(detail) {
			 	if (detail.get("IsSelected") == false) {
					Shared.CustomCheckBoxChange("#" + 'chkOption-' + detail.cid, true);
				}
			 });
		},
		
		  setSelected: function(id) {
			  var isChecked = false;
			  if (this.model.get('IsSelected')) {
				isChecked = true;
			  } else {
				isChecked = false;
			  }

			  Shared.CustomCheckBoxChange("#chkOption-" + id, !isChecked);
			  this.model.set('IsSelected', isChecked);
			},
	});

	return PromoListView;
});
  

