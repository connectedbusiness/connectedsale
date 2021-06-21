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
    'view/22.0.0/products/products/detail/general/photo-editor',
	'text!template/22.0.0/products/products/detail/general.tpl.html'
], function ($, $$, _, Backbone, Global, Service, Method, Shared,
             BaseModel,
             PhotoEditorView,
             GeneralTemplate) {


    var ClassID = {
        ItemName: ".table-data #data-ItemName",
        ItemDescription: ".table-data #data-ItemDescription",
        ItemType: ".table-data #data-ItemType",
        SerializeLot: ".table-data #data-SerializeLot",
        AutoGenerate: ".table-data #data-AutoGenerate",
        DontEarnPoints: ".table-data #data-DontEarnPoints"
    };

    var GeneralView = Backbone.View.extend({

        _generalTemplate: _.template(GeneralTemplate),

        events: {
            //"keyup  .table-data #data-ItemName": "inputChange_ItemName",
            "keypress  .table-data #data-ItemName": "inputChange_ItemName",
            "change .table-data #data-ItemName": "inputChange_ItemName",
            //"keyup  .table-data #data-ItemDescription": "inputChange_Description",
            "keypress  .table-data #data-ItemDescription": "inputChange_Description",
            "change .table-data #data-ItemDescription": "inputChange_Description",
            "change .table-data #data-ItemType": "selectChange_ItemType",
            "change .table-data #data-SerializeLot": "selectChange_SerializeLot",
            "change .table-data #data-AutoGenerate": "checkChange_AutoGenerate",
            "change .table-data #data-DontEarnPoints": "checkChange_DontEarnPoints",
            "tap #item-image": "btnClick_Image",
            "tap .photo-menu .camera": "btnClick_Camera",
            "tap .photo-menu .gallery": "btnClick_Gallery",
            "tap .photo-menu .edit": "btnClick_Edit",
            "tap .photo-menu-upper .remove": "btnClick_Remove",
            "change #browse-image": "browseImage_Changed",
            "tap .copyname": "btnClick_CopyName"
        },

        inputChange_ItemName: function () { var val = $(ClassID.ItemName).val(); this.model.set({ ItemName: val, ItemCode: val }); this.model.HasChanges = true; },
        inputChange_Description: function () { var val = $(ClassID.ItemDescription).val(); this.model.set({ ItemDescription: val }); this.model.HasChanges = true; },
        selectChange_ItemType: function () { var val = $(ClassID.ItemType).val(); this.model.set({ ItemType: val }); this.model.HasChanges = true; this.CheckItemType(); this.ResetUM(); },
        selectChange_SerializeLot: function () { var val = $(ClassID.SerializeLot).val(); this.model.set({ SerializeLot: val }); this.model.HasChanges = true; },
        checkChange_AutoGenerate: function () { var val = $(ClassID.AutoGenerate).is(":checked"); this.model.set({ AutoGenerate: val }); this.model.HasChanges = true; },
        checkChange_DontEarnPoints: function () { var val = $(ClassID.DontEarnPoints).is(":checked"); this.model.set({ DontEarnPoints: val }); this.model.HasChanges = true; },

        btnClick_Image: function (e) { e.preventDefault(); this.ShowPhotoMenu(); },
        btnClick_Camera: function (e) { e.preventDefault(); this.ShowPhotoMenu(); this.GetImage(); },
        btnClick_Gallery: function (e) { e.preventDefault(); this.ShowPhotoMenu(); this.GetImage(true); },
        btnClick_Edit: function (e) { e.preventDefault(); this.ShowPhotoMenu(); this.EditPhoto(); },
        btnClick_Remove: function (e) { e.preventDefault(); this.ShowPhotoMenu(); this.RemovePhoto(); },

        btnClick_CopyName: function (e) {
            e.preventDefault();
            var val = $(ClassID.ItemName).val();
            if (!val || val == "") {
                Shared.Products.ShowNotification("Item Name is empty!", true);
                return;
            }
            $(ClassID.ItemDescription).val(val);
            this.inputChange_Description();
        },

        browseImage_Changed: function (e) {
            var self = this;
            var readURL = function (input) {
                if (input.files && input.files[0]) {

                    console.log('File Size: ' + input.files[0].size);

                    //Use to limit image file size that can be used.
                    if (input.files[0].size > 15000000) { //15MB
                        navigator.notification.alert("Maximum image file size allowed is 15MB.", null, "Image Size", "OK");
                        $("#browse-image").val('');
                        return;
                    }

                    var reader = new FileReader();

                    reader.onerror = function (e) {
                        navigator.notification.alert("An error was encountered when trying to load file.", null, "Loading Error", "OK");
                        reader = null;
                    }

                    reader.onload = function (e) {
                        self.LoadFromFileURI(e.target.result);
                        reader = null;
                    }

                    reader.readAsDataURL(input.files[0]);
                    $("#browse-image").val('');
                }
            }
            readURL(document.getElementById('browse-image'));
        },

        initialize: function () {
            this.$el.show();
            this.IsNew = false;
            currentInstance = this;
        },

        render: function () {
            var self = this;
            var formattedItemName = Shared.Escapedhtml(this.model.get("ItemName"));
            this.model.set({ CurrencySymbol: Global.CurrencySymbol, IsNew: self.IsNew, FormattedItemName: formattedItemName });
            this.$el.html(this._generalTemplate(this.model.toJSON()));
            this.LoadImage();
            this.LoadDrapDowns();
            this.CheckReadOnlyMode();
            return this;
        },

        CheckReadOnlyMode: function () {
            if (this.options.IsReadOnly) {
                $(ClassID.AutoGenerate).addClass('ui-readonly');
                $(ClassID.ItemName).addClass('ui-readonly');
                $(ClassID.ItemDescription).addClass('ui-readonly');
                $(ClassID.ItemType).addClass('ui-readonly');
                $(ClassID.SerializeLot).addClass('ui-readonly');
                $(ClassID.DontEarnPoints).addClass('ui-readonly');
            }
        },

        Show: function () {
            this.render();
        },

        Close: function () {
            this.remove();
            this.unbind();
        },

        RemovePhoto: function () {
            if (!this.model.get("Photo")) return;
            navigator.notification.confirm("Do you really want to delete the photo from this item?", confirmRemovePhoto, "Delete Photo", ['Yes','No']);
        },

        DoRemovePhoto: function () {
            var newModel = new BaseModel();
            var itemCode = this.model.get("ItemCode");
            var self = this;
            newModel.set({ StringValue: itemCode });

            if (this.IsNew) {
                self.model.set({ Photo: null, PhotoB64: null });
                self.render();
                Shared.Products.ShowNotification("Photo Deleted!");
                return;
            }

            newModel.on('sync', function (model, response) {
                if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                Shared.Products.Overlay.Hide();
                if (response.ErrorMessage) {
                    Shared.Products.ShowNotification("Error Removing Photo!", true);
                    return;
                }
                self.model.set({ Photo: null, PhotoB64: null });
                self.render();
                Shared.Products.ShowNotification("Photo Deleted!");
            }, this);

            newModel.on('error', function (model, error, response) {
                Shared.Products.Overlay.Hide();
                if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                Shared.Products.ShowNotification("Error Removing Photo!", true);
            }, this);

            newModel.url = Global.ServiceUrl + Service.PRODUCT + Method.DELETEITEMPHOTO;
            newModel.save({ timeout: 0 });
            Shared.Products.Overlay.Show();

        },

        ShowPhotoMenu: function () {

            if (this.options.IsReadOnly) return;

            var photoMenu = ".photo-menu";
            var photoMenuUpper = ".photo-menu-upper";

            if (Global.isBrowserMode) $(photoMenu).addClass('photo-menu-browser');

            if (this.MenuVisible) {
                $(photoMenu).fadeOut();
                $(photoMenuUpper).fadeOut();
                this.MenuVisible = false;
                return;
            }

            var imagePoint = $("#item-image").position();

            $(photoMenu).css("left", imagePoint.left + 4);
            $(photoMenu).css("top", imagePoint.top + 154);
            $(photoMenuUpper).css("left", imagePoint.left + 4);
            $(photoMenuUpper).css("top", imagePoint.top + 4);

            $(photoMenu).fadeIn();
            $(photoMenuUpper).fadeIn();
            this.MenuVisible = true;

        },

        LoadImage: function (imgB64) {
            if (!this.model.get("Photo")) return;
            if (this.model.get("PhotoB64") && !imgB64) imgB64 = this.model.get("PhotoB64");
            $('#item-image').html("<img />");
            if (imgB64) $('#item-image img').attr('src', 'data:image/png;base64,' + imgB64).css('display', 'block');
            else $('#item-image img').attr('src', Global.ServiceUrl + Method.IMAGES + this.model.get("ItemCode") + ".png?" + Math.random()).css('display', 'block');
            $('#item-image img').css('height', '100%');
            $('#item-image img').css('width', '100%');
        },

        LoadPhotoEditor: function (imgB64) {
            var self = this;
            if (!this.photoEditor) this.photoEditor = new PhotoEditorView();
            var ob64 = this.model.get('PhotoB64');
            this.photoEditor.on('done', function () { self.model.set({ 'Photo': [0], 'PhotoB64': self.photoEditor.ImageB64, 'OPhotoB64': ob64 || "0" }); }, this);
            if (this.model.get('PhotoB64')) this.photoEditor.ImageB64 = this.model.get('PhotoB64');
            if (imgB64) this.photoEditor.ImageB64 = imgB64;
            this.photoEditor.Show();
        },

        GetImage: function (fromGallery) {

            if (Global.isBrowserMode) {
                document.getElementById('browse-image').click();
                return;
            }

            var self = this;
            var _sourceType = 1;
            if (fromGallery) _sourceType = 0;

            var popover = new CameraPopoverOptions(600, 130, 200, 200, 8);

            if (!fromGallery) Shared.SetFullScreen(true);
            navigator.camera.getPicture(
                function (imgURI) {
                    self.ValidateFileSize(imgURI);
                    if (!fromGallery) Shared.ToggleDisplayAlignment();
                },
                function (error) {
                    console.log('Camera - getPicute Error Log.');
                    if (!fromGallery) Shared.ToggleDisplayAlignment();
                },
                {
                    quality: 40,
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: _sourceType,
                    allowEdit: false,
                    mediaType: Camera.MediaType.PICTURE,
                    encodingType: Camera.EncodingType.PNG,
                    popoverOptions: popover
                }
            );

        },

        ValidateFileSize: function (imgURI) {
            var self = this;
            window.resolveLocalFileSystemURI(
                imgURI,
                function (fileEntry) {
                    var fileSize = 0;
                    fileEntry.file(function (fileObj) {
                        fileSize = fileObj.size;
                        console.log("Size = " + fileSize);
                    });
                    self.LoadFromFileURI(imgURI, fileSize);
                },
                function () {
                    navigator.notification.alert("An error was encountered when trying to load image.", null, "Loading Error", "OK");
                }
            );
        },

        LoadFromFileURI: function (imgURI, fileSize) {
            Shared.Products.Overlay.Show();
            var imageObj = new Image();
            var self = this;

            console.log('LoadFromFileURI: ' + imgURI);

            imageObj.onerror = function () {
                navigator.notification.alert("An error was encountered when trying to load image.\nFile might be corrupted or format not supported.", null, "Loading Error", "OK");
                Shared.Products.Overlay.Hide();
                imageObj = null;
            }

            imageObj.onload = function () {

                var limitSize = 1024;

                if (fileSize && fileSize > 3000000) {

                }

                var newCanvas = document.createElement('canvas');
                var ctx = newCanvas.getContext('2d');

                var iRatio = 1;
                var iSize;

                if (imageObj.width > imageObj.height) {
                    if (imageObj.width > limitSize) iSize = imageObj.width;
                    if (iSize) iRatio = (limitSize / imageObj.width);
                }
                else {
                    if (imageObj.height > limitSize) iSize = imageObj.height;
                    if (iSize) iRatio = (limitSize / imageObj.height);
                }

                newCanvas.height = imageObj.height * iRatio;
                newCanvas.width = imageObj.width * iRatio;

                ctx.drawImage(imageObj, 0, 0, newCanvas.width, newCanvas.height);
                var imgData = newCanvas.toDataURL();
                imgData = Shared.Products.Base64Only(imgData);
                self.LoadPhotoEditor(imgData);
                Shared.Products.Overlay.Hide();

                newCanvas = null;
                ctx = null;
                imgData = null;
                imageObj = null;
            };
            imageObj.src = imgURI;
        },

        EditPhoto: function () {
            if (!this.model.get("PhotoB64")) {
                this.GetItemImage();
                return;
            }
            this.LoadPhotoEditor();
        },

        GetItemImage: function () {
            var newModel = new BaseModel();
            var itemCode = this.model.get("ItemCode");
            newModel.set({
                StringValue: itemCode
            });
            newModel.on('sync', this.GetItemImageSuccess, this);
            newModel.on('error', this.GetItemImageError, this);
            newModel.url = Global.ServiceUrl + Service.PRODUCT + Method.GETITEMIMAGE;
            newModel.save();
            Shared.Products.Overlay.Show();
        },

        GetItemImageSuccess: function (model, options) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            Shared.Products.Overlay.Hide();
            if (model.get("ItemDetails")) if (model.get("ItemDetails")[0]) {
                var b01 = model.get("ItemDetails")[0].Photo;
                if (!b01) {
                    Shared.Products.ShowNotification("No Photo Found!", true);
                    return;
                }
                var b64 = Shared.Products.ByteToBase64(b01);
                b64 = this.model.set({ 'PhotoB64': b64 });
                this.LoadPhotoEditor();
            }
        },

        GetItemImageError: function (model, error, options) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            Shared.Products.Overlay.Hide();
            console.log(model);
            navigator.notification.alert("An error was encountered when trying to load image!", null, "Loading Error", "OK");
        },

        IsAllowService: function(){
            var prodEd = Global.UserInfo ? Global.UserInfo.ProductEdition : "";
            var allowService = !(prodEd == "Connected Retail" || prodEd == "Connected Sale" || prodEd == "Woohaa");
            return (allowService || (!allowService && !this.IsNew));
        },

        LoadDrapDowns: function () {
            var itemType = { Stock: "", NonStock: "", Service: "", Matrix: "", GiftCard: "", GiftCertificate: "", Kit: "", Bundle: "" };
            var serialLot = { None: "", Serial: "", Lot: "" };

            switch (this.model.get("ItemType")) {
                case "Stock": itemType.Stock = "Selected"; break;
                case "Non-Stock": itemType.NonStock = "Selected"; break;
                case "Service": itemType.Service = "Selected"; break;
                case "Matrix Item": itemType.Matrix = "Selected"; break;
                case "Gift Card": itemType.GiftCard = "Selected"; break;
                case "Gift Certificate": itemType.GiftCertificate = "Selected"; break;
                case "Kit": itemType.Kit = "Selected"; break;
                case "Bundle": itemType.Bundle = "Selected"; break;
            }
            switch (this.model.get("SerializeLot")) {
                case "None": serialLot.None = "Selected"; break;
                case "Serial": serialLot.Serial = "Selected"; break;
                case "Lot": serialLot.Lot = "Selected"; break;
            }

            $("#data-ItemType").html("");
            $("#data-ItemType").append('<option ' + itemType.Stock + ' value="Stock">Stock</option>');
            $("#data-ItemType").append('<option ' + itemType.NonStock + ' value="Non-Stock">Non-Stock</option>');
            if(this.IsAllowService()) $("#data-ItemType").append('<option ' + itemType.Service + ' value="Service">Service</option>');
            $("#data-ItemType").append('<option ' + itemType.GiftCard + ' value="Gift Card">Gift Card</option>');
            $("#data-ItemType").append('<option ' + itemType.GiftCertificate + ' value="Gift Certificate">Gift Certificate</option>');
            $("#data-ItemType").append('<option ' + itemType.Kit + ' value="Kit">Kit</option>');
            $("#data-ItemType").append('<option ' + itemType.Bundle + ' value="Bundle">Bundle</option>');
            $("#data-SerializeLot").html("");
            $("#data-SerializeLot").append('<option ' + serialLot.None + ' value="None">None</option>');
            $("#data-SerializeLot").append('<option ' + serialLot.Serial + ' value="Serial">Serial</option>');
            $("#data-SerializeLot").append('<option ' + serialLot.Lot + ' value="Lot">Lot</option>');
            if (!this.IsNew) {
                $("#data-ItemType").append('<option ' + itemType.Matrix + ' value="Matrix Item">Matrix Item</option>');
                $("#data-ItemType").attr('disabled', 'disabled').addClass('disabled');
                $(ClassID.ItemName).addClass('ui-readonly'); //$(ClassID.ItemName).attr('readonly', 'readonly').addClass('disabled');
            }

            $(ClassID.AutoGenerate).prop('checked', this.model.get("AutoGenerate"));
			$(ClassID.DontEarnPoints).prop('checked',this.model.get("DontEarnPoints"));
            this.CheckItemType();

        },

        ResetUM: function () {
            if (!this.IsNew) return;
            this.trigger("resetUM");
        },

        CheckItemType: function () {
            if (this.model) {
                var itemType = this.model.get("ItemType");
                if (itemType == "Gift Card" || itemType == "Gift Certificate") {
                    $("#tr-SerializeLot").css('display', 'none');
                    $("#tr-AutoGenerate").css('display', '');
 					$("#tr-DontEarnPoints").css('display', 'none');
  					this.model.set({DontEarnPoints : false});
                    $(ClassID.DontEarnPoints).prop('checked',this.model.get("DontEarnPoints"));

                    $(ClassID.SerializeLot).val("None");
                    this.model.set({ SerializeLot: "None" });
                } else {
                    $("#tr-SerializeLot").css('display', '');
                    $("#tr-AutoGenerate").css('display', 'none');
                    $("#tr-DontEarnPoints").css('display', '');

                }
            }
        },


        InitializeChildViews: function () {
        },

        Validate: function () {
            if (!this.model) return false;
            if (!this.model.get("ItemName")) return this.ShowWarning("ItemName");
            if ($.trim(this.model.get("ItemName")) == '') return this.ShowWarning("ItemName");
            if (!this.model.get("ItemDescription")) return this.ShowWarning("ItemDescription");
            if ($.trim(this.model.get("ItemDescription")) == '') return this.ShowWarning("ItemDescription");
            return true;
        },

        ValidateItemName: function (caller, onSuccess, onError) {
            var self = this;
            if (!self.IsNew) return;
            var item = new BaseModel();
            item.set({
                StringValue: self.model.get("ItemName")
            });
            item.url = Global.ServiceUrl + Service.PRODUCT + 'loaditembycriterianame/';
            item.save(item, {
                success: function (model, response) {
                    if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                    if (response.Items) if (response.Items.length > 0) {
                        self.ShowWarning("ItemExists");
                        if (onError && caller) caller[onError]();
                        return;
                    }
                    if (onSuccess && caller) caller[onSuccess]();
                },
                error: function () {
                    if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                    self.ShowWarning("ValidationError");
                    if (onError && caller) caller[onError]();
                }
            });
        },

        ShowWarning: function (_field) {
            this.ValidationError = _field;
            this.trigger('validationError');
        }

    });

    var currentInstance;
    var confirmRemovePhoto = function (button) {
        if (button == 1) {
            currentInstance.DoRemovePhoto();
        }
    }

    return GeneralView;
});
