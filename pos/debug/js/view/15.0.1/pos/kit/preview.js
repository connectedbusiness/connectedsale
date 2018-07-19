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
  'text!template/15.0.1/pos/kit/kitpreview.tpl.html'
], function($, $$, _, Backbone, BaseCollection, Global, Enum, Method, Shared, template) {
  var _optionVal = false;
  return Backbone.View.extend({
    template: _.template(template),
    tagName: 'li',
    initialize: function() {
      this.$el.attr('data-icon', false);
      this.model.set('Price', this.getPrice());
      this.model.set('ImageLocation', this.showImage());
      this.model.set('CurrencySymbol', Global.CurrencySymbol);
      this.model.set('cid', this.model.cid);
      this.$el.html(this.template(this.model.attributes));
      this.$el.attr('id', this.model.cid);
      //this.setSelected();
      this.groupType = this.options.groupType;
      this.groupCode = this.options.groupCode;

    },
    events: {
      "click": "select",
      "tap span.kit-checkoption": "OptionChange"
    },
    render: function() {
      return this;
    },
    select: function(e) {
      e.preventDefault();
      //this.model.trigger('resetSelected');
      $(e.currentTarget).addClass('selected');
      this.model.trigger('selected_option', this.model);
    },
    getPrice: function() {
      return this.model.get('Total');
    },
    removeSelected: function() {
      this.$el.removeClass('selected');
    },
    showImage: function() {
      return Global.ServiceUrl + Method.IMAGES + this.model.get("ItemCode") + ".png?" + Math.random();
    },
    OptionChange: function(e) {
      e.preventDefault();
      var isTicked = this.$(e.currentTarget).hasClass('icon-check-empty'),
        id = e.currentTarget.id,
        isUnchecked = (isTicked) ? false : true;

      switch (this.groupType) {
        case "Required":
          //Le Reset
          this.collection.each(function(detail) {
            if (detail.get('GroupCode') == this.groupCode) {
              detail.set({
                'IsSelected': false,
                'IsDefault': false
              });
            }
          }.bind(this));

          //Remove Check
          var list = $("#kit-configurator-preview").find("ul").children();
          _.each(list, function(li) {
            var list_id = $(li).find("span").attr("id");

            Shared.CustomCheckBoxChange("#" + list_id, true);
          });

          Shared.CustomCheckBoxChange("#" + id, false);
          this.model.set({
            "IsSelected": true,
            "IsDefault": true
          });
          break;
        default:
          var groupCode = this.model.get('GroupCode');

          if (this.groupCode == groupCode) {
            Shared.CustomCheckBoxChange('#' + id, isUnchecked);
            this.model.set({
              'IsSelected': isTicked,
              'IsDefault': isTicked
            });
          }
          break;
      }

      var selectedItem = new BaseCollection(this.collection.filter(function(detail) {
        return detail.get("IsSelected") == true && detail.get("GroupCode") == this.groupCode
      }.bind(this)));
      this.model.trigger('selected_item', selectedItem);
    },
    setSelected: function(id) {
      var isChecked = false;
      if (this.model.get('IsSelected') && this.model.get('IsDefault')) {
        isChecked = this.model.get('IsSelected');
      } else {
        isChecked = (this.model.get('IsSelected')) ? this.model.get('IsSelected') : this.model.get('IsDefault');
      }

      Shared.CustomCheckBoxChange("#chkOption-" + id, !isChecked);
      this.model.set('IsSelected', isChecked);
    }
  });
});
