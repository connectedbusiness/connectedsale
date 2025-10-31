define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'shared/service',
	'shared/method',
    'model/base',
    'model/lookupcriteria',
    'collection/base',
    'text!template/25.1.0/products/receivestocks/detail/location/location.tpl.html',
     'js/libs/iscroll.js'
], function ($, $$, _, Backbone, Global, Service, Method,
             BaseModel, LookUpCriteriaModel,
             BaseCollection,
          	template) {
    var LocationItemView = Backbone.View.extend({

        _template: _.template(template),

        BindEvents: function () {
            var self = this;
            $(this.classID.CID).on("tap", function (e) { self.SelectedItem(e); });
        },

        initialize: function () {
            this.classID = {
                CID: " #" + this.cid + " "
            }
            this.render();
        },
        SelectedItem: function (e) {
            e.preventDefault();
            console.log("TRIGGER SELECTED!");
            this.trigger('selected', this.model.get("WarehouseCode"));
        },
        render: function () {
            var self = this;
            this.model.set({
                ModelID: self.cid
            });
            this.$el.append(this._template(this.model.toJSON()));
            return this;
        },
        InitializeChildViews: function (warehouseCode) {
            if (warehouseCode == this.model.get("WarehouseCode")) {
                $(this.classID.CID + ".location-item-content").append('<span class="icon-check" style="color:black;"></span>')
            } else {
            }
            this.BindEvents();
        },

    });

    return LocationItemView;
});
