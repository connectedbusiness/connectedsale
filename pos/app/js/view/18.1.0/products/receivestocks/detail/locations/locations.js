define([
	'backbone',
	'shared/global',
	'shared/service',
	'shared/method',
	'shared/shared',
    'model/base',
    'collection/base',
    'view/18.1.0/products/receivestocks/detail/locations/location',
    'text!template/18.1.0/products/receivestocks/detail/location/locations.tpl.html'
], function (Backbone, Global, Service, Method, Shared,
             BaseModel,
             BaseCollection,
             LocationItemView,
          	template) {
    var item_el = ".custom-dropdown-tbody";
    var LocationsView = Backbone.View.extend({

        _template: _.template(template),

        events: {

        },

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(this._template());
            //this.$el.show();
            return this;
        },
        InitializeChildviews: function () {
            var self = this;
            this.collection.each(function (location) {
                var locationItemView = new LocationItemView({
                    el: item_el,
                    model : location
                });
                locationItemView.on('selected', self.SetSelected, self);
                locationItemView.InitializeChildViews(self.model.get("WarehouseCode"));
            });
            this.RefeshTable();
        },
        SetSelected : function(warehouseCode){
            this.trigger('selected',warehouseCode);
        },
        RefeshTable: function () {
            if (Global.isBrowserMode) {
                Shared.UseBrowserScroll('#locations-itemTable');
                $('#locations-itemTable').css('margin-bottom', '0');
            } else { this.LoadScroll(); }
        },
        LoadScroll : function(){
            if (Shared.IsNullOrWhiteSpace(this.myScroll)) {
                this.myScroll = new iScroll('locations-itemTable', { vScrollbar: true, vScroll: true, snap: false, momentum: true });
            } else {
                this.myScroll.refresh();
            }
            var self = this;
            setTimeout(function () {
                self.myScroll.refresh();
            }, 1000);
        },
        Show : function (x_coord, y_coord,warehouseCode) {

           y_coord = this._generatePopupCoordinates(y_coord);
            x_coord = (x_coord + 3) + "px";

            this.$el.css({
                left: x_coord,
                top: y_coord,
            })

            this.$el.show();
        },

        _generatePopupCoordinates: function (temp_y_coord) {
            var popupHeight = this.ComputePopUpHeight();
            temp_y_coord = temp_y_coord + 10;
            if ((temp_y_coord + popupHeight) > 748) {
              //  $(".arrow").hide();
              //  $(".arrow-bottom").show();
                temp_y_coord = (temp_y_coord - popupHeight) + "px";
            }
            else {
               // $(".arrow").show();
                //$(".arrow-bottom").hide();
                temp_y_coord = (temp_y_coord) + "px";
            }

            return temp_y_coord;
        },

        ComputePopUpHeight: function () {
            var popUpHeight = $("#receive-stocks-locations").height();
            return popUpHeight;
        },

    });

    return LocationsView;
});
