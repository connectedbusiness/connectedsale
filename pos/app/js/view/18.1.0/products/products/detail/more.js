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
	'shared/service',
	'shared/method',
    'shared/shared',
    'model/base',
    'model/lookupcriteria',
    'collection/base',
	'text!template/18.1.0/products/products/detail/more.tpl.html',
    'text!template/18.1.0/products/products/detail/more/category.tpl.html',
    'text!template/18.1.0/products/products/detail/more/department.tpl.html',
    'js/libs/iscroll.js'
], function ($, $$, _, Backbone, Global, Service, Method, Shared,
             BaseModel, LookUpCriteriaModel,
             BaseCollection,
             MoreTemplate, CategoryLineTemplate, DepartmentLineTemplate) {

    var ClassId = {
        CAT: " .category select ",
        DELCAT: " .del ",
        DEP: " .department select ",
        DELDEP: " .del "
    }

    var Collapse = {
        Category: ".tables .header .category .collapse i",
        Department: ".tables .header .department .collapse i"
    }

    var Tables = {
        Category: "#category-table",
        Department: "#department-table"
    }

    var MoreView = Backbone.View.extend({

        _moreTemplate: _.template(MoreTemplate),
        _categoryLine: _.template(CategoryLineTemplate),
        _departmentLine: _.template(DepartmentLineTemplate),

        events: {
            "tap .category-add span": "btnClick_AddCategory",
            "tap .department-add span": "btnClick_AddDepartment",
            "tap .tables .header .category .collapse": "btnClick_CollapseCategory",
            "tap .tables .header .department .collapse": "btnClick_CollapseDepartment"
        },

        btnClick_AddCategory: function (e) { e.preventDefault(); this.AddNewCategory(); },
        btnClick_AddDepartment: function (e) { e.preventDefault(); this.AddNewDepartment(); },
        btnClick_CollapseCategory: function (e) { e.preventDefault(); this.ToggleCollapseButton(Collapse.Category, Tables.Category); },
        btnClick_CollapseDepartment: function (e) { e.preventDefault(); this.ToggleCollapseButton(Collapse.Department, Tables.Department); },

        initialize: function () {
            this.$el.show();
            this.categories = new BaseCollection();
            this.categoryList = new BaseCollection();
            this.departments = new BaseCollection();
            this.departmentList = new BaseCollection();
        },

        render: function () {
            this.$el.html(this._moreTemplate());
            this.LoadCategoryCollection();
            this.LoadDepartmentCollection();
            this.CheckReadOnlyMode();
            return this;
        },

        CheckReadOnlyMode: function () {
            if (this.options.IsReadOnly) {
                $(".category-add span").addClass('ui-disabled');
                $(".department-add span").addClass('ui-disabled');
                $(ClassId.CAT).addClass('ui-readonly');
                $(ClassId.DEP).addClass('ui-readonly');
                $(ClassId.DELCAT).addClass('ui-disabled');
                $(ClassId.DELDEP).addClass('ui-disabled');
            }
        },

        Show: function () {
            this.listCount = 0;
            this.GetCategories();
            this.GetDepartments();
        },

        Close: function () {
            this.remove();
            this.unbind();
        },

        InitializeChildViews: function () {
        },

        GetCategories: function () {
            var self = this;
            var newModel = new LookUpCriteriaModel();
            newModel.on('sync', this.GetCategoriesSuccess, this);
            newModel.on('error', this.GetCategoriesError, this);
            var _rowsToSelect = 1000;
            newModel.set({ StringValue: "" });
            newModel.url = Global.ServiceUrl + Service.PRODUCT + Method.GETCATEGORYDETAILS + _rowsToSelect;
            newModel.save();
        },

        GetCategoriesSuccess: function (model, option) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            this.categoryList.reset(model.get("SystemCategories"));
            this.listCount++;
            if (this.listCount == 2) this.render();
        },

        GetCategoriesError: function (model, option) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            this.listCount++;
            if (this.listCount == 2) this.render();
        },

        GetDepartments: function () {
            var self = this;
            var newModel = new LookUpCriteriaModel();
            newModel.on('sync', this.GetDepartmentsSuccess, this);
            newModel.on('error', this.GetDepartmentsError, this);
            var _rowsToSelect = 1000;
            newModel.set({ StringValue: "" });
            newModel.url = Global.ServiceUrl + Service.PRODUCT + Method.GETDEPARTMENTDETAILS + _rowsToSelect;
            newModel.save();
        },

        GetDepartmentsSuccess: function (model, option) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            this.departmentList.reset(model.get("Departments"));
            this.listCount++;
            if (this.listCount == 2) this.render();
        },

        GetDepartmentsError: function (model, option) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            this.listCount++;
            if (this.listCount == 2) this.render();
        },


        LoadCategoryCollection: function () {
            var self = this;
            var cnt = 0;
            $(Tables.Category).html("");
            this.categories.each(function (model) {
                self.RenderCategory(model, cnt);
                cnt++;
            });
        },

        LoadDepartmentCollection: function () {
            var self = this;
            var cnt = 0;
            $(Tables.Department).html("");
            this.departments.each(function (model) {
                self.RenderDepartment(model, cnt);
                cnt++;
            });
        },

        RenderCategory: function (model, index) {
            var categoryIndex = "categoryIndex" + index
            var categoryTable = Tables.Category;

            model.set({ categoryIndex: categoryIndex });
            $(categoryTable).append(this._categoryLine(model.toJSON()));

            var cid = categoryTable + ' #' + categoryIndex;
            this.LoadCategoryList(cid + ' select', model.get("CategoryCode"));
            this.BindEvents(model, cid, categoryTable);
            this.RefreshiScroll();
        },

        RenderDepartment: function (model, index) {
            var departmentIndex = "departmentIndex" + index
            var departmentTable = Tables.Department

            model.set({ departmentIndex: departmentIndex });
            $(departmentTable).append(this._departmentLine(model.toJSON()));

            var cid = departmentTable + ' #' + departmentIndex;
            this.LoadDepartmentList(cid + ' select', model.get("DepartmentCode"));
            this.BindEvents(model, cid, departmentTable);
            this.RefreshiScroll();
        },

        LoadCategoryList: function (_selectID, _selectedItem) {
            var DisplayField = "CategoryCode";
            this.categoryList.sortedField = DisplayField;
            this.categoryList.comparator = function (collection) {
                var self = this;
                return (collection.get(self.sortedField));
            };

            var self = this;
            $(_selectID).html("");
            //$(_selectID).append("<option>&nbsp;</option>");
            this.categoryList.sort(DisplayField).each(function (model) {
                var selected = '';
                if ($.trim(model.get("CategoryCode")) == $.trim(_selectedItem)) selected = 'Selected';
                $(_selectID).append('<option ' + selected + ' value="' + model.get("CategoryCode") + '" >' + Shared.Escapedhtml(model.get("CategoryDescription") || model.get("Description")) + '</option>');
            });

            if (!_selectedItem) {
                $(_selectID).prop("selectedIndex", -1);
            }

        },

        LoadDepartmentList: function (_selectID, _selectedItem) {
            var DisplayField = "DepartmentCode";
            this.departmentList.sortedField = DisplayField;
            this.departmentList.comparator = function (collection) {
                var self = this;
                return (collection.get(self.sortedField));
            };

            var self = this;
            $(_selectID).html("");
            //$(_selectID).append("<option>&nbsp;</option>");
            this.departmentList.sort(DisplayField).each(function (model) {
                var selected = '';
                if ($.trim(model.get("DepartmentCode")) == $.trim(_selectedItem)) selected = 'Selected';
                $(_selectID).append('<option ' + selected + ' value="' + model.get("DepartmentCode") + '">' + Shared.Escapedhtml(model.get("DepartmentDescription") || model.get("Description")) + '</option>');
            });

            if (!_selectedItem) {
                $(_selectID).prop("selectedIndex", -1);
            }
        },

        BindEvents: function (model, cid, table) {
            model.set({ cid: cid });
            var self = this;
            if (table == Tables.Category) {
                $(cid + ClassId.CAT).on("change", function () { self.ChangeModelAttribute(cid, ClassId.CAT, table); });
                $(cid + ClassId.DELCAT).on("tap", function (e) { e.preventDefault(); self.ChangeModelAttribute(cid, ClassId.DELCAT, table); });
            }
            if (table == Tables.Department) {
                $(cid + ClassId.DEP).on("change", function () { self.ChangeModelAttribute(cid, ClassId.DEP, table); });
                $(cid + ClassId.DELDEP).on("tap", function (e) { e.preventDefault(); self.ChangeModelAttribute(cid, ClassId.DELDEP, table); });
            }
        },

        ChangeModelAttribute: function (cid, ctl, table) {
            var self = this;
            if (table == Tables.Category) {
                this.categories.each(function (model) {
                    if (model.get("cid") == cid) self.DoChangeAttribute(model, cid, ctl, table);
                });
            }
            if (table == Tables.Department) {
                this.departments.each(function (model) {
                    if (model.get("cid") == cid) self.DoChangeAttribute(model, cid, ctl, table);
                });
            }
        },

        DoChangeAttribute: function (model, cid, ctl, table) {
            var ctlValue = null;
            if (ctl != ClassId.DELCAT && ctl != ClassId.DELDEP) ctlValue = $(cid + ctl).val();
            if (table == Tables.Category) {
                this.categories.HasChanges = true;
                switch (ctl) {
                    case ClassId.DELCAT:
                        if (!model) return;
                        this.categories.remove(model);
                        this.LoadCategoryCollection();
                        break;
                    case ClassId.CAT:
                        var prevVal = model.get("CategoryCode");
                        model.set({ CategoryCode: ctlValue });
                        if (!this.ValidateCategories(true)) {
                            model.set({ CategoryCode: prevVal });
                            this.LoadCategoryList(cid + ctl, prevVal);
                            /*if (!prevVal || prevVal == '') {
                            $(cid + ctl).prop("selectedIndex", -1);
                            } else {
                            model.set({ CategoryCode: prevVal });
                            $(cid + ctl).val(prevVal);
                            }*/
                        }                           

                        //Set Category Description
                        if (this.categoryList) {
                            this.categoryList.each(function (mdl) {
                                if (mdl.get("CategoryCode") == model.get("CategoryCode")) {
                                    model.set({
                                        Description: mdl.get("Description")
                                    });
                                }
                            });
                        }                        
                        break;
                }
            }
            if (table == Tables.Department) {
                this.departments.HasChanges = true;
                switch (ctl) {
                    case ClassId.DELDEP:
                        if (!model) return;
                        this.departments.remove(model);
                        this.LoadDepartmentCollection();
                        break;
                    case ClassId.DEP:
                        var prevVal = model.get("DepartmentCode");
                        model.set({ DepartmentCode: ctlValue });
                        if (!this.ValidateDepartments(true)) {
                            model.set({ DepartmentCode: prevVal });
                            this.LoadDepartmentList(cid + ctl, prevVal);
                            /*if (!prevVal || prevVal == '') {
                            $(cid + ctl).prop("selectedIndex", -1);
                            } else {
                            model.set({ DepartmentCode: prevVal });
                            $(cid + ctl).val(prevVal);
                            }*/
                        }

                        //Set Department Description
                        if (this.departmentList) {
                            this.departmentList.each(function (mdl) {
                                if (mdl.get("DepartmentCode") == model.get("DepartmentCode")) {
                                    model.set({
                                        Description: mdl.get("Description")
                                    });
                                }
                            });
                        }
                        break;
                }
            }
        },

        AddNewCategory: function () {
            if (this.categoryList.model.length = 0) {
                navigator.notification.alert("There are no available Categories!", null, "Error", "OK");
                return;
            }

            if (!this.Validate()) return;

            var _newModel = new BaseModel();
            this.categories.add(_newModel);
            this.categories.HasChanges = true;
            this.RenderCategory(_newModel, this.categories.models.length - 1);
            this.ToggleCollapseButton(Collapse.Category, Tables.Category, true);
        },

        AddNewDepartment: function () {
            if (this.categoryList.model.length = 0) {
                navigator.notification.alert("There are no available Departments!", null, "Error", "OK");
                return;
            }

            if (!this.Validate()) return;

            var _newModel = new BaseModel();
            this.departments.add(_newModel);
            this.departments.HasChanges = true;
            this.RenderDepartment(_newModel, this.departments.models.length - 1);
            this.ToggleCollapseButton(Collapse.Department, Tables.Department, true);
        },

        ToggleCollapseButton: function (collapseID, tableID, isForceShow) {
            if ($(collapseID).hasClass("icon-chevron-up") && !isForceShow) {
                $(collapseID).removeClass("icon-chevron-up");
                $(collapseID).addClass("icon-chevron-down");
                $(tableID).hide();
            } else {
                if (isForceShow) if ($(collapseID).hasClass("icon-chevron-up")) return;
                $(collapseID).removeClass("icon-chevron-down");
                $(collapseID).addClass("icon-chevron-up");
                $(tableID).show();
            }
        },

        Validate: function () {
            if (!this.ValidateCategories()) return false;
            if (!this.ValidateDepartments()) return false;
            return true;
        },

        ValidateCategories: function (checkDuplicatesOnly) {
            if (!this.categories) return false;
            var self = this;
            var _field = "";
            var _hasError = false;
            var _categories = "";
            this.categories.each(function (model) {
                if (_hasError) return;

                if (!checkDuplicatesOnly) {
                    if (!model.get("CategoryCode")) { _hasError = true; _field = "CategoryCode"; return; }
                    if ($.trim(model.get("CategoryCode")) == '') { _hasError = true; _field = "CategoryCode"; return; }
                }

                if (_categories.indexOf("[" + model.get("CategoryCode") + "]") > -1) {
                    _hasError = true; _field = "Category_Duplicate"; return;
                } else {
                    _categories = _categories + "[" + model.get("CategoryCode") + "]";
                }
            });
            _categories = null;
            if (_hasError) {
                this.ValidationError = _field;
                this.trigger('validationError');
                return false;
            }
            return true;
        },

        ValidateDepartments: function (checkDuplicatesOnly) {
            if (!this.departments) return false;
            var self = this;
            var _field = "";
            var _hasError = false;
            var _departments = "";
            this.departments.each(function (model) {
                if (_hasError) return;

                if (!checkDuplicatesOnly) {
                    if (!model.get("DepartmentCode")) { _hasError = true; _field = "DepartmentCode"; return; }
                    if ($.trim(model.get("DepartmentCode")) == '') { _hasError = true; _field = "DepartmentCode"; return; }
                }

                if (_departments.indexOf("[" + model.get("DepartmentCode") + "]") > -1) {
                    _hasError = true; _field = "DepartmentCode_Duplicate"; return;
                } else {
                    _departments = _departments + "[" + model.get("DepartmentCode") + "]";
                }
            });
            _departments = null;
            if (_hasError) {
                this.ValidationError = _field;
                this.trigger('validationError');
                return false;
            }
            return true;
        },

        RefreshiScroll: function () {
            if (Global.isBrowserMode) return;
            if (this.myScroll) {
                this.myScroll.refresh();
                if ($("#detail-body").height() < $("#more-details").height()) this.myScroll.scrollToElement('li:first-child', 100);
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
            //if(Global.isBrowserMode) this.myScroll.scrollToElement('div:nth-child(1)',0);
        }

    });
    return MoreView;
});



