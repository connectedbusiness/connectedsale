define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'collection/base',
  'shared/global',
  'shared/enum',
  'shared/method',
  'shared/shared',
  'text!template/15.1.0/pos/promotion/promotionitemlist.tpl.html'
], function($, $$, _, Backbone, BaseCollection, Global, Enum, Method, Shared, template) {
  var _optionVal = false;
  return Backbone.View.extend({
    template: _.template(template),
    tagName: 'li',
    initialize: function() {
	  this.model.set('cid', this.model.cid);
	  this.$el.attr('id', this.model.cid);
      this.$el.attr('data-icon', false);
      this.model.set('ImageLocation', this.showImage());
      this.$el.html(this.template(this.model.attributes));
	  this.ruleID = this.model.get('RuleID');
    },
    events: {
      "click": "select",
      "tap span.promo-checkoption": "OptionChange"
    },
    render: function() {
      return this;
    },
    select: function(e) {
      e.preventDefault();
      $(e.currentTarget).addClass('selected');
    },

    showImage: function() {
      return Global.ServiceUrl + Method.IMAGES + this.model.get("ItemCode") + ".png?" + Math.random();
    },
	  
	OptionChange: function(e) {
      e.preventDefault();
      var isTicked = this.$(e.currentTarget).hasClass('icon-check-empty'),
        id = e.currentTarget.id,
        isUnchecked = (isTicked) ? false : true;
          this.model.set({
            "IsSelected": true
          });

		 Shared.CustomCheckBoxChange("#" + id, isUnchecked);
//      var selectedItem = new BaseCollection(this.collection.filter(function(detail) {
//        return detail.get("IsSelected") == true && detail.get("GroupCode") == this.groupCode
//      }.bind(this)));
//      this.model.trigger('selected_item', selectedItem);
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
});
