
/**
 * PRODUCT - MAINTENANCE
 * @author MJFIGUEROA | 02-27-2013
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
    'collection/base',
    'view/24.0.0/products/products/detail/general',
    'view/24.0.0/products/products/detail/pricing',
    'view/24.0.0/products/products/detail/unitofmeasure',
    'view/24.0.0/products/products/detail/more',
    'view/24.0.0/products/products/detail/summary',
	'text!template/24.0.0/products/products/products-detail.tpl.html'
], function ($, $$, _, Backbone, Global, Service, Method, Shared,
             BaseModel,
             BaseCollection,
             GeneralView, PricingView, UOMView, MoreView, SummaryView,
             ProductsDetailTemplate) {

    var ClassID = {
        Body: ".detail-body div",
        Main: ".detail-body"
    };

    var Tabs = {
        General: "General",
        Pricing: "Pricing",
        UnitOfMeasure: "UnitOfMeasure",
        More: "More",
        Summary: "Summary"
    };

    var Wizard = {
        Next: "#btn-next",
        Back: "#btn-back",
        Finish: "#btn-finish",
        Cancel: "#btn-cancel"
    }

    var currentInstance;

    var ProductsDetailView = Backbone.View.extend({

        _productsDetailTemplate: _.template(ProductsDetailTemplate),

        events: {
            "tap #general": "tabGeneral_click",
            "tap #pricing": "tabPricing_click",
            "tap #unitofmeasure": "tabUoM_click",
            "tap #more": "tabMore_click",
            "tap #btn-cancel": "btnClick_Cancel",
            "tap #btn-back": "btnClick_Back",
            "tap #btn-next": "btnClick_Next",
            "tap #btn-finish": "btnClick_Finish",
            "tap #btn-Save": "btnClick_Save",
            "tap #btn-Delete": "btnClick_Delete"
        },

        tabGeneral_click: function (e) { e.preventDefault(); this.ChangeTab(Tabs.General); },
        tabPricing_click: function (e) { e.preventDefault(); this.ChangeTab(Tabs.Pricing); },
        tabUoM_click: function (e) { e.preventDefault(); this.ChangeTab(Tabs.UnitOfMeasure); },
        tabMore_click: function (e) { e.preventDefault(); this.ChangeTab(Tabs.More); },

        btnClick_Cancel: function (e) { e.preventDefault(); this.trigger('cancel', this); },
        btnClick_Back: function (e) { e.preventDefault(); this.NavigateTab(); },
        btnClick_Next: function (e) { e.preventDefault(); this.NavigateTab(true); },
        btnClick_Finish: function (e) { e.preventDefault(); this.SaveNewProduct(); },

        btnClick_Save: function (e) { e.preventDefault(); this.SaveChanges(); },
        btnClick_Delete: function (e) { e.preventDefault(); this.ConfirmDelete(); },

        CurrentTab: "General",

        initialize: function () {
            currentInstance = this;
            this.CurrentTab = Tabs.General;
            this.IsNew = false;
            this.$el.show();
        },

        render: function () {
            if (this.model) this.$el.html(this._productsDetailTemplate());
            else {
                this.$el.html("");
                this.DisplayNoRecordFound();
            }
            //$(".paddingRight").css("width", "250px");
            this.CheckReadOnlyMode();
            return this;
        },

        CheckReadOnlyMode: function () {
            if (this.options.IsReadOnly) {
                $("#btn-Save").addClass('ui-disabled');
                $("#btn-Delete").addClass('ui-disabled');
            }
        },

        Show: function () {
            this.render();
            this.DisplayWait();
            this.GetItemDetails();
        },

        InitializeChildViews: function () {
        },

        DisplayWait: function () {
            Shared.Products.DisplayWait(ClassID.Body);
        },

        DisplayError: function () {
            Shared.Products.DisplayError(ClassID.Body);
        },

        DisplayNoRecordFound: function () {
            Shared.Products.DisplayNoRecordFound("#right-panel", ".list-wrapper", this.toBeSearched);
        },

        ChangeTab: function (tabCode) {
            if (this.CurrentTab == tabCode) return;
            if (!this.ValidateChangeTab()) return;

            if (tabCode == Tabs.General) this.LoadGeneralView();
            if (tabCode == Tabs.Pricing) this.LoadPricingView();
            if (tabCode == Tabs.UnitOfMeasure) this.LoadUOMView();
            if (tabCode == Tabs.More) this.LoadMoreView();
            this.CurrentTab = tabCode;
        },

        ChangeDisplayTab: function (tabID) {
            $(".detail-header .tab-active").addClass("tab");
            $(".detail-header .tab").removeClass("tab-active");
            $(tabID).addClass("tab-active");
            $(tabID).removeClass("tab");
        },

        NavigateTab: function (isNext) {
            if (!this.ValidateChangeTab()) return;
            switch (this.CurrentTab) {
                case Tabs.General:
                    if (isNext) {
                        if (this.IsNew) {
                            this.ToggleNextButton(true);
                            this.generalView.ValidateItemName(this, "ValidateItemName_Success", "ValidateItemName_Error");
                        } else {
                            this.LoadPricingView();
                        }
                    }
                    break;
                case Tabs.Pricing:
                    if (isNext) this.LoadUOMView(); else this.LoadGeneralView();
                    break;
                case Tabs.UnitOfMeasure:
                    if (isNext) this.LoadMoreView(); else this.LoadPricingView();
                    break;
                case Tabs.More:
                    if (isNext) this.LoadSummaryView(); else this.LoadUOMView();
                    break;
                case Tabs.Summary:
                    if (!isNext) this.LoadMoreView();
                    break;
            }
        },

        ToggleNextButton: function (isProcessing) {
            if (isProcessing) {
                $("#btn-next i").removeClass("icon-chevron-right");
                $("#btn-next i").addClass("icon-spinner");
                $("#btn-next i").addClass("icon-spin");
            } else {
                $("#btn-next i").removeClass("icon-spinner");
                $("#btn-next i").removeClass("icon-spin");
                $("#btn-next i").addClass("icon-chevron-right");
            }
        },

        ValidateItemName_Success: function () {
            this.LoadPricingView();
            this.ToggleNextButton();
        },

        ValidateItemName_Error: function () {
            this.ToggleNextButton();
        },

        ValidateChangeTab: function () {
            switch (this.CurrentTab) {
                case Tabs.General:
                    if (!this.ValidateGeneralDetails()) return false;
                    break;
                case Tabs.Pricing:
                    if (!this.ValidatePricing()) return false;
                    break;
                case Tabs.UnitOfMeasure:
                    if (!this.ValidateUOM()) return false;
                    break;
                case Tabs.More:
                    if (!this.ValidateMore()) return false;
                    break;
            }
            return true;
        },

        InitializeNewModels: function () {
            this.InitializeItemModel();
            this.InitializePricingModel();
            this.InitializeUOMCollection();
            this.InitializeCategoryCollection();
            this.InitializeDepartmentCollection();
            this.InitializeAccessoryCollection();
            this.InitializeSubstituteCollection();
        },

        InitializeItemModel: function () {
            this.model = new BaseModel();
            this.model.set({
                ItemCode: "",
                ItemName: "",
                ItemDescription: "",
                RetailPrice: 0,
                WholesalePrice: 0,
                AverageCost: 0,
                StandardCost: 0,
                CurrentCost: 0,
                ItemType: "Stock",
                SerializeLot: "None",
                AutoGenerate: false,
                DontEarnPoints: false
            });
        },

        InitializePricingModel: function () {
            this.pricingModel = new BaseModel();
            this.pricingModel.set({
                ItemCode: "",
                StandardCost: 0,
                RetailPrice: 0,
                WholesalePrice: 0
            });
        },

        InitializeUOMCollection: function () {
            this.uoms = new BaseCollection();
            var _newModel = new BaseModel();
            _newModel.set({
                IsNew: true,
                IsBase: true,
                UnitMeasureQuantity: 1,
                UnitMeasureQty: 1,
                UPCCode: "",
                UnitMeasureCode: "EACH",
                DefaultSelling: true
            });
            this.uoms.add(_newModel);
        },


        InitializeAccessoryCollection: function () {
            this.accessories = new BaseCollection();
        },

        InitializeSubstituteCollection: function () {
            this.substitutes = new BaseCollection();
        },

        InitializeCategoryCollection: function () {
            this.categories = new BaseCollection();
        },

        InitializeDepartmentCollection: function () {
            this.departments = new BaseCollection();
        },

        ResetMain: function () {
            $(ClassID.Main).html("<div></div>");
        },

        ResetTabViews: function () {
            if (this.generalView) this.generalView.Close();
            this.generalView = null;
            if (this.pricingView) this.pricingView.Close();
            this.pricingView = null;
            if (this.uomView) this.uomView.Close();
            this.uomView = null;
            if (this.moreView) this.moreView.Close();
            this.moreView = null;
        },

        ResetUM: function () {
            console.log('Unit Measure Reset: ' + Math.random());
            this.uoms.reset();
            this.InitializeUOMCollection();
        },

        LoadGeneralView: function () {
            var self = this;
            this.ChangeDisplayTab("#general");
            if (!this.model) return;
            this.CurrentTab = Tabs.General;
            if (this.generalView) this.generalView.Close();
            this.ResetMain();
            this.generalView = new GeneralView({ el: ClassID.Body, IsReadOnly: this.options.IsReadOnly });
            this.generalView.el = ClassID.Body;
            this.generalView.on('validationError', function () { self.ShowWarning(self.generalView.ValidationError); });
            this.generalView.on('resetUM', function () { self.ResetUM(); });
            if (this.pricingModel) if (this.pricingModel.get("RetailPrice")) this.model.set({ RetailPrice: this.pricingModel.get("RetailPrice") });
            this.generalView.model = this.model;
            this.generalView.IsNew = this.IsNew;
            this.DisplayWait();
            this.generalView.Show();
            this.ToggleWizard();
        },

        LoadPricingView: function () {
            var self = this;
            this.ChangeDisplayTab("#pricing");
            if (!this.pricingModel || !this.model) return;
            this.CurrentTab = Tabs.Pricing;
            if (this.pricingView) this.pricingView.Close();
            this.ResetMain();
            this.pricingView = new PricingView({ el: ClassID.Body, IsReadOnly: this.options.IsReadOnly });
            this.pricingView.on('validationError', function () { self.ShowWarning(self.pricingView.ValidationError); });
            this.pricingView.model = this.model;
            this.pricingView.pricing = this.pricingModel;
            this.pricingView.IsNew = this.IsNew;
            this.DisplayWait();
            this.pricingView.Show();
            this.ToggleWizard();
        },

        LoadUOMView: function () {
            var self = this;
            this.ChangeDisplayTab("#unitofmeasure");
            if (!this.uoms) return;
            this.CurrentTab = Tabs.UnitOfMeasure;
            if (this.uomView) this.uomView.Close();
            this.ResetMain();
            this.uomView = new UOMView({ el: ClassID.Body, IsReadOnly: this.options.IsReadOnly });
            this.uomView.on('validationError', function () { self.ShowWarning(self.uomView.ValidationError); });
            this.uomView.model = this.model;
            this.uomView.collection = this.uoms;
            this.uomView.substitutes = this.substitutes;
            this.uomView.accessories = this.accessories;
            this.uomView.IsNew = this.IsNew;
            this.DisplayWait();
            this.uomView.Show();
            this.ToggleWizard();
        },

        LoadMoreView: function () {
            var self = this;
            this.ChangeDisplayTab("#more");
            if (!this.categories) return;
            this.CurrentTab = Tabs.More;
            if (this.moreView) this.moreView.Close();
            this.ResetMain();
            this.moreView = new MoreView({ el: ClassID.Body, IsReadOnly: this.options.IsReadOnly });
            this.moreView.on('validationError', function () { self.ShowWarning(self.moreView.ValidationError); });
            this.moreView.categories = this.categories;
            this.moreView.departments = this.departments;
            this.moreView.IsNew = this.IsNew;
            this.DisplayWait();
            this.moreView.Show();
            this.ToggleWizard();
        },

        LoadSummaryView: function (isNew) {
            this.CurrentTab = Tabs.Summary;
            if (this.summaryView) this.summaryView.Close();
            this.ResetMain();
            this.summaryView = new SummaryView({ el: ClassID.Body });
            this.summaryView.IsNew = this.IsNew;
            this.summaryView.itemModel = this.model;
            this.summaryView.pricingModel = this.pricingModel;
            this.summaryView.uoms = this.uoms;
            this.summaryView.departments = this.departments;
            this.summaryView.categories = this.categories;
            this.summaryView.accessories = this.accessories;
            this.summaryView.substitutes = this.substitutes;
            this.DisplayWait();
            this.summaryView.Show();
            this.ToggleWizard();
        },

        ToggleWizard: function () {
            if (this.IsNew) {
                switch (this.CurrentTab) {
                    case Tabs.General:
                        $(Wizard.Back).css('display', 'none');
                        $(Wizard.Next).css('display', 'block');
                        break;
                    case Tabs.Pricing:
                    case Tabs.UnitOfMeasure:
                    case Tabs.More:
                        $(Wizard.Back).css('display', 'block');
                        $(Wizard.Next).css('display', 'block');
                        break;
                    case Tabs.Summary:
                        $(Wizard.Back).css('display', 'block');
                        $(Wizard.Next).css('display', 'none');
                        break;
                }
            }
        },

        GetItemDetails: function () {
            if (!this.model) return;
            var _self = this;
            var _model = new BaseModel();
            _model.set({
                StringValue: this.model.get("ItemCode")
            });
            _model.url = Global.ServiceUrl + Service.PRODUCT + Method.GETITEMDETAILS;
            _model.on('sync', this.GetItemDetailsSuccess, this);
            _model.on('error', this.GetItemDetailsError, this);
            _model.save();
        },

        GetItemDetailsSuccess: function (model, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            this.InitializeNewModels();
            if (model.get("ItemDetails")) if (model.get("ItemDetails")[0]) this.model.set(model.get("ItemDetails")[0]);
            if (model.get("ItemPricingDetails")) if (model.get("ItemPricingDetails")[0]) this.pricingModel.set(model.get("ItemPricingDetails")[0]);
            if (model.get("UnitOfMeasures")) if (model.get("UnitOfMeasures").length > 0) this.uoms.reset(model.get("UnitOfMeasures"));
            if (model.get("ItemCategories")) if (model.get("ItemCategories").length > 0) this.categories.reset(model.get("ItemCategories"));
            if (model.get("ItemDepartments")) if (model.get("ItemDepartments").length > 0) this.departments.reset(model.get("ItemDepartments"));
            if (model.get("Accessories")) if (model.get("Accessories").length > 0) this.accessories.reset(model.get("Accessories"));
            if (model.get("Substitutes")) if (model.get("Substitutes").length > 0) this.substitutes.reset(model.get("Substitutes"));
            if (this.uoms) {
                this.uoms.each(function (model) {
                    var qty = model.get("UnitMeasureQty");
                    model.set({ UnitMeasureQuantity: qty });
                });
            }
            this.LoadGeneralView();
        },

        GetItemDetailsError: function (model, error, options) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            this.DisplayError();
        },

        AddMode: function () {
            $("#item-details").addClass("addmode");
            this.IsNew = true;
            this.InitializeNewModels();
            this.ResetTabViews();
            this.LoadGeneralView();
        },

        ShowValidationError: function (_attr) {

        },

        ValidateModel: function (isAll) {
            if (isAll || this.CurrentTab == Tabs.General) if (!this.ValidateGeneralDetails()) return false;
            if (isAll || this.CurrentTab == Tabs.Pricing) if (!this.ValidatePricing()) return false;
            if (isAll || this.CurrentTab == Tabs.UnitOfMeasure) if (!this.ValidateUOM()) return false;
            if (isAll || this.CurrentTab == Tabs.More) if (!this.ValidateMore()) return false;
            return true;
        },

        ValidateGeneralDetails: function () {
            if (!this.generalView) return true;
            return this.generalView.Validate();
        },

        ValidatePricing: function () {
            if (!this.pricingView) return true;
            return this.pricingView.Validate();
        },

        ValidateUOM: function () {
            if (!this.uomView) return true;
            return this.uomView.Validate();
        },

        //ValidateDepartments //ValidateCategories
        ValidateMore: function () {
            if (!this.moreView) return true;
            return this.moreView.Validate();
        },

        ShowWarning: function (_field) {
            if (_field == "ItemName") {
                //navigator.notification.alert("Item Name is required!", null, "Incomplete Details", "OK");
                Shared.Products.ShowNotification("Item Name is required!", true);
                if (this.CurrentTab != Tabs.General) this.LoadGeneralView();
                return;
            }
            if (_field == "ItemDescription") {
                //navigator.notification.alert("Item Description is required!", null, "Incomplete Details", "OK");
                Shared.Products.ShowNotification("Item Description is required!", true);
                if (this.CurrentTab != Tabs.General) this.LoadGeneralView();
                return;
            }

            if (_field == "ItemExists") {
                //navigator.notification.alert("Item Description is required!", null, "Incomplete Details", "OK");
                Shared.Products.ShowNotification("Item Name already exists.", true);
                if (this.CurrentTab != Tabs.General) this.LoadGeneralView();
                return;
            }

            if (_field == "ValidationError") {
                //navigator.notification.alert("Item Description is required!", null, "Incomplete Details", "OK");
                Shared.Products.ShowNotification("An error was encountered during validation.", true);
                if (this.CurrentTab != Tabs.General) this.LoadGeneralView();
                return;
            }

            if (_field == "AverageCost") {
                Shared.Products.ShowNotification("Item Cost can not be less than zero!", true);
                if (this.CurrentTab != Tabs.Pricing) this.LoadPricingView();
                return;
            }

            if (_field == "RetailPrice") {
                Shared.Products.ShowNotification("Retail Price can not be less than zero!", true);
                if (this.CurrentTab != Tabs.Pricing) this.LoadPricingView();
                return;
            }

            if (_field == "WholesalePrice") {
                Shared.Products.ShowNotification("Wholesale Price can not be less than zero!", true);
                if (this.CurrentTab != Tabs.Pricing) this.LoadPricingView();
                return;
            }

            if (_field == "UnitMeasureCode") {
                //navigator.notification.alert("Unit of Measure code is required!", null, "Incomplete Details", "OK");
                Shared.Products.ShowNotification("Unit of Measure code is required!", true);
                if (this.CurrentTab != Tabs.UnitOfMeasure) this.LoadUOMView();
                return;
            }
            if (_field == "UnitMeasureQuantity") {
                //navigator.notification.alert("Unit of Measure Quantity can not be zero!", null, "Incomplete Details", "OK");
                Shared.Products.ShowNotification("Unit of Measure Quantity can not be equal or less than zero!", true);
                if (this.CurrentTab != Tabs.UnitOfMeasure) this.LoadUOMView();
                return;
            }
            if (_field == "UOM_Duplicate") {
                //navigator.notification.alert("Duplicate Unit of Measure!", null, "Duplicate", "OK");
                Shared.Products.ShowNotification("Duplicate Unit of Measure!", true);
                if (this.CurrentTab != Tabs.UnitOfMeasure) this.LoadUOMView();
                return;
            }
            if (_field == "AccessoryExist") {
                Shared.Products.ShowNotification("Accessory Already Exists!", true);
                if (this.CurrentTab != Tabs.UnitOfMeasure) this.LoadUOMView();
                return;
            }
            if (_field == "SubstituteExist") {
                Shared.Products.ShowNotification("Substitute Already Exists!", true);
                if (this.CurrentTab != Tabs.UnitOfMeasure) this.LoadUOMView();
                return;
            }
            if (_field == "CategoryCode") {
                //navigator.notification.alert("Category cannot be empty!", null, "Incomplete Details", "OK");
                Shared.Products.ShowNotification("Category cannot be empty!", true);
                if (this.CurrentTab != Tabs.More) this.LoadMoreView();
                return;
            }
            if (_field == "Category_Duplicate") {
                //navigator.notification.alert("Duplicate Categories!", null, "Duplicate", "OK");
                Shared.Products.ShowNotification("Duplicate Categories!", true);
                if (this.CurrentTab != Tabs.More) this.LoadMoreView();
                return;
            }
            if (_field == "DepartmentCode") {
                //navigator.notification.alert("Department cannot be empty!", null, "Incomplete Details", "OK");
                Shared.Products.ShowNotification("Department cannot be empty!", true);
                if (this.CurrentTab != Tabs.More) this.LoadMoreView();
                return;
            }
            if (_field == "DepartmentCode_Duplicate") {
                //navigator.notification.alert("Duplicate Departments!", null, "Duplicate", "OK");
                Shared.Products.ShowNotification("Duplicate Departments!", true);
                if (this.CurrentTab != Tabs.More) this.LoadMoreView();
                return;
            }

            return;
        },

        HasChanges: function (_clear, _doNotCheckPhoto) {
            if (_clear) {
                if (this.model) this.model.HasChanges = false;
                if (this.pricingModel) this.pricingModel.HasChanges = false;
                if (this.categories) this.categories.HasChanges = false;
                if (this.departments) this.departments.HasChanges = false;
                if (this.uoms) this.uoms.HasChanges = false;
                if (this.accessories) this.accessories.HasChanges = false;
                if (this.substitutes) this.substitutes.HasChanges = false;
                this.HasPhotoChanges(true);
                this.IsNew = false;
                return;
            }
            if (this.model) if (this.model.HasChanges) return true;
            if (this.pricingModel) if (this.pricingModel.HasChanges) return true;
            if (this.categories) if (this.categories.HasChanges) return true;
            if (this.departments) if (this.departments.HasChanges) return true;
            if (this.uoms) if (this.uoms.HasChanges) return true;
            if (this.accessories) if (this.accessories.HasChanges) return true;
            if (this.substitutes) if (this.substitutes.HasChanges) return true;
            if (!_doNotCheckPhoto) if (this.HasPhotoChanges()) return true;
        },

        HasPhotoChanges: function (_clear) {
            if (!this.model) return;
            if (_clear) {
                this.model.set({ "OPhotoB64": null });
                return;
            }
            if (this.model.get("PhotoB64") && this.model.get("OPhotoB64") && this.model.get("PhotoB64") != this.model.get("OPhotoB64")) {
                return true;
            }
            return false;
        },

        UpdateValuesByItemType: function () {
            if (this.model && this.pricingModel) {
                var itemType = this.model.get("ItemType");
                if (itemType == "Gift Card" || itemType == "Gift Certificate") {
                    var _price = this.pricingModel.get("WholesalePrice");
                    this.pricingModel.set({ RetailPrice: _price });
                    this.model.set({ AverageCost: 0, StandardCost: 0, CurrentCost: 0 });
                    this.accessories.reset();
                }
            }
        },

        UpdateAccessoriesAndSubstitutes: function () {
            var itemCode = this.model.get("ItemCode");
            if (this.IsNew) itemCode = "[To Be Generated]";
            this.accessories.each(function (model) { model.set({ ItemCode: itemCode }); })
            this.substitutes.each(function (model) { model.set({ ItemCode: itemCode }); })
        },

        SaveNewProduct: function () {
            if (!this.ValidateModel(true)) return;
            var newModel = new BaseModel();

            //PrepareImage
            this.ResetPhotoFromModel(this.model);

            var itemCollection = new BaseCollection();
            var pricingCollection = new BaseCollection();

            this.UpdateValuesByItemType();
            this.UpdateAccessoriesAndSubstitutes();

            itemCollection.add(this.model);
            pricingCollection.add(this.pricingModel);

            newModel.set({
                ItemDetails: itemCollection.toJSON(),
                ItemPricingDetails: pricingCollection.toJSON(),
                UnitOfMeasures: this.uoms.toJSON(),
                ItemCategories: this.categories.toJSON(),
                ItemDepartments: this.departments.toJSON(),
                Accessories: this.accessories.toJSON(),
                Substitutes: this.substitutes.toJSON()
            });

            newModel.on('sync', this.SaveNewProductSuccess, this);
            newModel.on('error', this.SaveNewProductError, this);
            newModel.url = Global.ServiceUrl + Service.PRODUCT + Method.CREATEINVENTORYITEM;
            newModel.save({ timeout: 0 });
            Shared.Products.Overlay.Show();
        },

        SaveNewProductSuccess: function (model, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            Shared.Products.Overlay.Hide();
            if (model.get("ErrorMessage")) {
                if (this.model && this.PhotoQue) {
                    this.model.set({ "Photo": this.PhotoQue.Photo, "PhotoB64": this.PhotoQue.PhotoB64, "OPhotoB64": this.PhotoQue.OPhotoB64 });
                }
                //navigator.notification.alert(model.get("ErrorMessage"), null, "Saving Error", "OK");
                Shared.Products.ShowNotification(model.get("ErrorMessage"), true);
                return;
            }
            this.ItemCode = model.get("ItemPricingDetails")[0].ItemCode;
            this.IsNew = false;
            this.HasChanges(true);
            this.trigger('saved', this);
            this.DoUploadPhoto();
        },

        SaveNewProductError: function (model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            Shared.Products.Overlay.Hide();
            navigator.notification.alert("An error was encounter when trying to save new product!", null, "Saving Error", "OK");
        },

        SaveChanges: function () {

            //Hide keyboard
            if (!Global.isBrowserMode) {
                document.activeElement.blur();
                $("input").blur();
            }

            if (!this.HasChanges(false, true)) {
                if (this.HasPhotoChanges()) {
                    this.SaveImage();
                    return;
                }
                Shared.Products.ShowNotification("No Changes Made!");
                return;
            }
            this.DoSaveChanges();
        },

        DoSaveChanges: function () {
            if (!this.ValidateModel(true)) return;
            var newModel = new BaseModel();
            var itemCollection = new BaseCollection();
            var pricingCollection = new BaseCollection();

            this.UpdateValuesByItemType();
            this.UpdateAccessoriesAndSubstitutes();

            var itemCode = this.model.get("ItemCode");
            this.ItemCode = itemCode;

            //PrepareImage
            this.ResetPhotoFromModel(this.model);

            itemCollection.add(this.model);
            pricingCollection.add(this.pricingModel);

            newModel.set({
                ItemDetails: itemCollection.toJSON(),
                ItemPricingDetails: pricingCollection.toJSON(),
                UnitOfMeasures: this.uoms.toJSON(),
                ItemCategories: this.categories.toJSON(),
                ItemDepartments: this.departments.toJSON(),
                Accessories: this.accessories.toJSON(),
                Substitutes: this.substitutes.toJSON()
            });

            newModel.on('sync', this.UpdateProductSuccess, this);
            newModel.on('error', this.UpdateProductError, this);
            newModel.url = Global.ServiceUrl + Service.PRODUCT + Method.UPDATEINVENTORYITEM;
            newModel.save({ timeout: 0 });
            Shared.Products.Overlay.Show();
        },

        UpdateProductSuccess: function (model, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            Shared.Products.Overlay.Hide();
            if (model.get("ErrorMessage")) {
                navigator.notification.alert(model.get("ErrorMessage"), null, "Saving Error", "OK");
                return;
            }
            this.HasChanges(true);
            this.trigger('updated', this);
            this.DoUploadPhoto();
        },

        UpdateProductError: function (model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            Shared.Products.Overlay.Hide();
            navigator.notification.alert("An error was encounter when trying to update product!", null, "Saving Error", "OK");
        },

        ResetPhotoFromModel: function (model) {
            var b01, b64, ob64;
            if (model) {
                b01 = this.model.get("Photo");
                b64 = this.model.get("PhotoB64");
                ob64 = this.model.get("OPhotoB64");
                this.model.set({ "Photo": null });
                this.model.set({ "PhotoB64": null });
                this.model.set({ "OPhotoB64": null });

                this.PhotoQue = {
                    Photo: b01,
                    PhotoB64: b64,
                    OPhotoB64: ob64,
                    IsNew: this.IsNew
                }
                return;
            }
            if (this.model && this.PhotoQue) {
                this.model.set({ "Photo": this.PhotoQue.Photo, "PhotoB64": this.PhotoQue.PhotoB64, "OPhotoB64": this.PhotoQue.OPhotoB64 });
            }
        },

        DoUploadPhoto: function () {
            if (this.PhotoQue) {
                this.ResetPhotoFromModel();
                if (this.HasPhotoChanges()) {
                    this.SaveImage();
                }
            }
        },

        ConfirmDelete: function () {
            navigator.notification.confirm("Are you sure you want to delete this product?", deleteItem, "Confirm Delete", ['Yes','No']);
        },

        DoDelete: function () {
            var itemCode = this.model.get("ItemCode");
            var newModel = new BaseModel();
            this.ItemCode = itemCode;

            newModel.set({ StringValue: itemCode });
            newModel.on('sync', this.DeleteSuccess, this);
            newModel.on('error', this.DeleteError, this);
            newModel.url = Global.ServiceUrl + Service.PRODUCT + Method.DELETEITEMBYITEMCODE;
            newModel.save({ timeout: 0 });
            Shared.Products.Overlay.Show();
        },

        DeleteSuccess: function (model, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            Shared.Products.Overlay.Hide();
            if (response.ErrorMessage) {
                if (response.ErrorMessage.indexOf('DELETE statement conflicted') > -1) {
                    Shared.Products.ShowNotification("The product selected is currently being used as part of another record!", true, 5000);
                } else {
                    navigator.notification.alert(response.ErrorMessage, null, "Delete Error", "OK");
                }
            } else {
                this.HasChanges(true);
                this.trigger('deleted', this);
            }
        },

        DeleteError: function (model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            Shared.Products.Overlay.Hide();
            navigator.notification.alert("An error was encounter when trying to delete product!", null, "Delete Error", "OK");
        },

        SaveImage: function () {
            if (!this.model.get("PhotoB64")) return;

            var imgData = this.model.get("PhotoB64");
            imgData = Shared.Products.Base64Only(imgData);

            var itemCode = this.model.get("ItemCode");
            var refID = "REFID-" + Math.random() + '-' + Math.random();
            var imgLimit = 8000;
            var partNumber = 0;
            var imgColl = new BaseCollection();
            var imgModel = function (_itemCode, _refId, _pCnt, _pNum, _b64) {
                return new BaseModel({
                    ItemCode: _itemCode,
                    ReferenceID: _refId,
                    PartCount: _pCnt,
                    PartNumber: _pNum,
                    Base64Content: _b64
                });
            };

            for (var resume = true; resume; ) {
                partNumber++;
                var b64 = imgData.substr((partNumber - 1) * imgLimit, imgLimit);
                if (imgData.substr(partNumber * imgLimit).length == 0) resume = false;
                imgColl.add(imgModel(itemCode, refID, partNumber, partNumber, b64));
            }

            imgColl.each(function (model) { model.set({ PartCount: partNumber }); });

            var pollErrors = 0;
            var pollSuccess = 0;
            var self = this;
            var modelIdx = 0;
            var imgPoll = function (isError, msg) {
                //if (isError) pollErrors++; else pollSuccess++;
                if (!isError) pollSuccess++;

                if(isError) {
                    if(pollErrors >= 3) {
                        Shared.Products.ShowNotification("Photo Not Uploaded! Error on index : " + modelIdx +" ; "+ msg , true);
                        Shared.Products.Overlay.Hide();
                        return;
                    }
                    pollErrors++;
                    uploadImage();
                    return;
                }

                pollErrors = 0;
                if ((pollErrors + pollSuccess) == partNumber) {
                    if (pollSuccess == partNumber) {
                        Shared.Products.Overlay.Hide();
                        Shared.Products.ShowNotification("Photo Uploaded!");
                        if (self.PhotoQue) if (self.PhotoQue.IsNew) {
                            if (self.generalView) {
                                self.generalView.model.set({ "Photo": [0] });
                                self.generalView.LoadImage(self.PhotoQue.PhotoB64);
                            }
                        }
                        self.PhotoQue = null;
                        self.HasPhotoChanges(true);
                    } else {
                        Shared.Products.Overlay.Hide();
                        Shared.Products.ShowNotification("Photo Not Uploaded! " + msg, true);
                    }
                } else {
                    modelIdx++;
                    uploadImage();
                }
            }

            var uploadImage = function () {

                Shared.Products.Overlay.Show();

                var model = imgColl.at(modelIdx);
                model.set({ PartCount: partNumber });
                model.url = Global.ServiceUrl + Service.PRODUCT + Method.SAVEPHOTOBYPARTS;
                model.save(model, {
                    success: function (model, response) {
                        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                        if (response.Value) { imgPoll(); } else { imgPoll(true, response.ErrorMessage); }
                    },
                    error: function (model, error, response) {
                        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                        imgPoll(true, "Request Time out");
                    },
                    timeout: 0
                });
            }

            uploadImage();

        }

    });

    var deleteItem = function (button) {
        if (button == 1) currentInstance.DoDelete();
    }


    return ProductsDetailView;
});
