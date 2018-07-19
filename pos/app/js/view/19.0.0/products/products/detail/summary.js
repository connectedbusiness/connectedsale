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
	'shared/shared',
    'model/base',
	'text!template/19.0.0/products/products/detail/summary.tpl.html',
    'js/libs/iscroll.js'
], function ($, $$, _, Backbone,
             Global, Shared,
             BaseModel,
             SummaryTemplate) {

    var ClassID = {
        General: "#summary-general",
        Pricing: "#summary-pricing",
        UOM: "#summary-uom",
        Category: "#summary-category",
        Department: "#summary-department",
        Accessory: "#summary-acc",
        Substitute: "#summary-sub"
    };

    var Collapse = {
        General: "#collapse-general i",
        Pricing: "#collapse-pricing i",
        UOM: "#collapse-uom i",
        Department: "#collapse-department i",
        Category: "#collapse-category i",
        Accessory: "#collapse-acc i",
        Substitute: "#collapse-sub i"
    };

    var SummaryView = Backbone.View.extend({

        _summaryTemplate: _.template(SummaryTemplate),

        events: {
            "tap #collapse-general ": "btnClick_CollapseGeneral",
            "tap #collapse-pricing ": "btnClick_CollapsePricing",
            "tap #collapse-uom ": "btnClick_CollapseUOM",
            "tap #collapse-department ": "btnClick_CollapseDepartment",
            "tap #collapse-category ": "btnClick_CollapseCategory",
            "tap #collapse-acc ": "btnClick_CollapseAccessory",
            "tap #collapse-sub ": "btnClick_CollapseSubstitute"
        },

        btnClick_CollapseGeneral: function (e) { e.preventDefault(); this.ToggelCollapse(Collapse.General); },
        btnClick_CollapseUOM: function (e) { e.preventDefault(); this.ToggelCollapse(Collapse.UOM); },
        btnClick_CollapsePricing: function (e) { e.preventDefault(); this.ToggelCollapse(Collapse.Pricing); },
        btnClick_CollapseCategory: function (e) { e.preventDefault(); this.ToggelCollapse(Collapse.Category); },
        btnClick_CollapseDepartment: function (e) { e.preventDefault(); this.ToggelCollapse(Collapse.Department); },
        btnClick_CollapseAccessory: function (e) { e.preventDefault(); this.ToggelCollapse(Collapse.Accessory); },
        btnClick_CollapseSubstitute: function (e) { e.preventDefault(); this.ToggelCollapse(Collapse.Substitute); },

        initialize: function () {
            this.$el.show();
            this.IsNew = false;
        },

        render: function () {
            this.model = new BaseModel();
            if (this.itemModel) this.model.set(this.itemModel.attributes);
            if (this.pricingModel) this.model.set(this.pricingModel.attributes);
            this.$el.html(this._summaryTemplate(Shared.EscapedModel(this.model).toJSON()));
            return this;
        },         

        IsShowContent: function (collapseID) {
            var cMinus = 'icon-minus-sign';
            var cPlus = 'icon-plus-sign';
            if ($(collapseID).hasClass(cMinus)) {
                $(collapseID).removeClass(cMinus);
                $(collapseID).addClass(cPlus);
                return false;
            } else {
                $(collapseID).removeClass(cPlus);
                $(collapseID).addClass(cMinus);
                return true;
            }
        },

        ToggelCollapse: function (collapseID) {
            switch (collapseID) {
                case Collapse.General:
                    if (this.IsShowContent(collapseID)) $(ClassID.General).show();
                    else $(ClassID.General).hide();
                    break;
                case Collapse.Pricing:
                    if (this.IsShowContent(collapseID)) $(ClassID.Pricing).show();
                    else $(ClassID.Pricing).hide();
                    break;
                case Collapse.UOM:
                    if (this.IsShowContent(collapseID)) $(ClassID.UOM).show();
                    else $(ClassID.UOM).hide();
                    break;
                case Collapse.Department:
                    if (this.IsShowContent(collapseID)) $(ClassID.Department).show();
                    else $(ClassID.Department).hide();
                    break;
                case Collapse.Category:
                    if (this.IsShowContent(collapseID)) $(ClassID.Category).show();
                    else $(ClassID.Category).hide();
                    break;
                case Collapse.Accessory:
                    if (this.IsShowContent(collapseID)) $(ClassID.Accessory).show();
                    else $(ClassID.Accessory).hide();
                    break;
                case Collapse.Substitute:
                    if (this.IsShowContent(collapseID)) $(ClassID.Substitute).show();
                    else $(ClassID.Substitute).hide();
                    break;
            }
            this.RefreshiScroll();
        },

        LoadOtherDetails: function () {
            var self = this;
            if (this.uoms) {
                var hdr = '<tr>';
                hdr = hdr + self.NewTD('UM', 'um', '', true);
                hdr = hdr + self.NewTD('Selling', 'selling', '', true);
                hdr = hdr + self.NewTD('Quantity', 'qty', '', true);
                hdr = hdr + self.NewTD('UPC Code', 'upc', '', true);
                hdr = hdr + '</tr>';
                $(ClassID.UOM).append(hdr);

                this.uoms.each(function (model) {
                    var row = '<tr>';
                    row = row + self.NewTD(model.get('UnitMeasureCode'));
                    row = row + self.NewTD(model.get('DefaultSelling') ? 'YES' : '');
                    row = row + self.NewTD(model.get('UnitMeasureQuantity'));
                    row = row + self.NewTD(model.get('UPCCode'));
                    row = row + '</tr>';
                    $(ClassID.UOM).append(row);
                });
            }

            if (this.departments) {
                this.departments.each(function (model) {
                    var row = '<tr>';
                    row = row + self.NewTD(model.get('Description'));
                    row = row + '</tr>';
                    $(ClassID.Department).append(row);
                });
            }

            if (this.categories) {
                this.categories.each(function (model) {
                    var row = '<tr>';
                    row = row + self.NewTD(model.get('Description'));
                    row = row + '</tr>';
                    $(ClassID.Category).append(row);
                });
            }

            if (this.accessories) {
                var hdr = '<tr>';
                //hdr = hdr + self.NewTD('Code', 'accCode', '', true);
                hdr = hdr + self.NewTD('Name', 'accCode', '', true);
                hdr = hdr + self.NewTD('Description', 'accName', '', true);
                hdr = hdr + '</tr>';
                $(ClassID.Accessory).append(hdr);

                this.accessories.each(function (model) {
                    var row = '<tr>';
                    //row = row + self.NewTD(model.get('AccessoryCode'), 'accCode');
                    row = row + self.NewTD(model.get('AccessoryName'), 'accCode');
                    row = row + self.NewTD(model.get('AccessoryDesc'), 'accName');
                    row = row + '</tr>';
                    $(ClassID.Accessory).append(row);
                });
            }

            if (this.substitutes) {
                var hdr = '<tr>';
                //hdr = hdr + self.NewTD('Code', 'subCode', '', true);                
                hdr = hdr + self.NewTD('Name', 'subCode', '', true);
                hdr = hdr + self.NewTD('Description', 'subName', '', true);
                hdr = hdr + '</tr>';
                $(ClassID.Substitute).append(hdr);

                this.substitutes.each(function (model) {
                    var row = '<tr>';
                    //row = row + self.NewTD(model.get('SubstituteCode'), 'subCode');
                    row = row + self.NewTD(model.get('SubstituteName'), 'subCode');
                    row = row + self.NewTD(model.get('SubstituteDesc'), 'subName');
                    row = row + '</tr>';
                    $(ClassID.Substitute).append(row);
                });
            }

            this.RefreshiScroll();
        },

        NewTD: function (_val, _class, _id, isHeader) {
            var _td = '<td ';
            var _b1 = '';
            if (isHeader) _b1 = ' summary-table-header ';

            if (_class) _td = _td + ' class="' + _class + _b1 + '" ';
            if (_id) _td = _td + ' id="' + _class + '" ';

            _td = _td + '>' + Shared.Escapedhtml(_val) + '</td>';
            return _td;
        },

        Show: function () {
            this.render();
            this.LoadOtherDetails();
        },

        Close: function () {
            this.remove();
            this.unbind();
        },

        InitializeChildViews: function () {
        },

        RefreshiScroll: function () {
            if(Global.isBrowserMode) {
                Shared.UseBrowserScroll('#detail-body');
                return;
            }

            if (this.myScroll) {
                this.myScroll.refresh();
                if ($("#detail-body").height() < $("#summary-details").height()) this.myScroll.scrollToElement('li:first-child', 100);
            }
            else {
                this.myScroll = new iScroll("detail-body", {
                    vScrollbar: true, vScroll: true, snap: true, momentum: true, useTransform: false,
                    onBeforeScrollStart: function (e) {
                        var target = e.target;
                        while (target.nodeType != 1) target = target.parentNode;

                        if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
                            e.preventDefault();
                    }
                });
            }
            $("#detail-body div:first-child").css("width", "100%");
            $(".tables").css("width", "80%");
        }


    });
    return SummaryView;
});



