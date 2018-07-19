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
	'text!template/16.0.0/products/products/detail/general/photo-editor.tpl.html'
], function ($, $$, _, Backbone, Global, Shared, PhotoEditorTempalte) {

    var ClassID = {
    };

    var PhotoDetails = {
        OSrcW: 0,
        OSrcH: 0,
        ZoomFactor: 1,
        X: 0, Y: 0,
        StageH: 0,
        StageW: 0
    };

    var PricingView = Backbone.View.extend({

        _photoEditorTemplate: _.template(PhotoEditorTempalte),

        initialize: function () {
            this.$el.show();
            this.ImageB64 = null;
        },

        render: function () {
            return this;
        },

        Show: function () {
            this.LoadPhotoEditor();
            if (!Global.isBrowserMode) {
                $("#global-modal #zoom").css('display', 'none');
                $("#global-modal #zoom-out").css('display', 'none');
            }
        },

        Close: function () {
            this.tmpImage = null;
            $("#global-modal").fadeOut();
        },

        InitializeChildViews: function () {
        },

        GetResultImage: function () {

            var imageObj;
            this.tmpImage = null;
            this.tmpImage = new Image();
            imageObj = this.tmpImage;
            var self = this;

            imageObj.onload = function () {

                var sourceX = parseFloat(PhotoDetails.X / PhotoDetails.ZoomFactor);
                var sourceY = parseFloat(PhotoDetails.Y / PhotoDetails.ZoomFactor);
                var sourceWidth = PhotoDetails.OSrcW;
                var sourceHeight = PhotoDetails.OSrcH; ;
                var destWidth = 250;
                var destHeight = 250;
                var destX = 0;
                var destY = 0;

                var stageX = parseFloat(PhotoDetails.StageW / PhotoDetails.ZoomFactor);
                var stageY = parseFloat(PhotoDetails.StageH / PhotoDetails.ZoomFactor);

                sourceWidth = stageX;
                sourceHeight = stageY;

                if (sourceX > 0) sourceX = 0; else sourceX = Math.abs(sourceX);
                if (sourceY > 0) sourceY = 0; else sourceY = Math.abs(sourceY);

                var newCanvas = document.createElement('canvas');
                var ctx = newCanvas.getContext('2d');

                newCanvas.height = destHeight;
                newCanvas.width = destWidth;

                if ((sourceX + sourceWidth) > this.width) sourceWidth = this.width - sourceX;
                if ((sourceY + sourceHeight) > this.height) sourceHeight = this.height - sourceY;

                ctx.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);

                var imgData = newCanvas.toDataURL();
                self.ImageB64 = Shared.Products.Base64Only(imgData);

                $('#item-image').html("<img />");
                $('#item-image img').attr('src', imgData).css('display', 'block');

                $('#item-image img').css('height', '100%');
                $('#item-image img').css('width', '100%');

                newCanvas = null;
                ctx = null;
                imgData = null;
                self.trigger('done', this);
            };

            imageObj.src = 'data:image/png;base64,' + this.ImageB64;
            this.Close();
        },


        Rotate: function (leftRotate) {
            if (this.PreventRotate) return;
            this.PreventRotate = true;

            Shared.Products.Overlay.Show();
            var self = this;
            var imgObj;
            this.tmpImage = null;
            this.tmpImage = new Image();
            imgObj = this.tmpImage;
            imgObj.src = 'data:image/png;base64,' + this.ImageB64;

            imgObj.onerror = function () {
                navigator.notification.alert("An error was encountered when trying to load image.", null, "Loading Error", "OK");
                Shared.Products.Overlay.Hide();
                self.PreventRotate = false;
            }

            imgObj.onload = function () {
                var canvas = document.createElement("canvas");
                var context = canvas.getContext('2d');
                var deg = 90;
                var tx, ty;

                canvas.height = PhotoDetails.OSrcW;
                canvas.width = PhotoDetails.OSrcH;

                if (leftRotate) {
                    deg = deg * 3;
                    tx = 0;
                    ty = canvas.height;
                } else {
                    tx = canvas.width;
                    ty = 0;
                }

                context.translate(tx, ty);
                context.rotate((Math.PI / 180) * deg);
                context.drawImage(imgObj, 0, 0);

                context.restore();
                var imgData = canvas.toDataURL();
                self.ImageB64 = Shared.Products.Base64Only(imgData);
                self.LoadPhotoEditor(true);
                //Shared.Products.Overlay.Hide();
                //self.PreventRotate = false;

                canvas = null;
                context = null;
                imgData = null;
            };

        },

        Zoom: function (isZoomOut) {
            var self = this;
            var doZoom = function () { self.DoZoom(isZoomOut, 10); }
            doZoom();
            clearInterval(this.zoomTimeOut);
            this.zoomTimeOut = setInterval(doZoom, 100);
        },

        DoZoom: function (isZoomOut, incSize) {

            var useH = true;
            var iSize = $('#imgCanvas').height();

            if ($('#imgCanvas').width() < $('#imgCanvas').height()) {
                iSize = $('#imgCanvas').width();
                useH = false;
            }

            if (!incSize) incSize = 5;

            if (isZoomOut) iSize = iSize - incSize;
            else iSize = iSize + incSize;

            if (useH) {
                if (iSize < PhotoDetails.StageH) iSize = PhotoDetails.StageH;
                PhotoDetails.ZoomFactor = parseFloat(iSize / PhotoDetails.OSrcH);
                $('#imgCanvas').css('height', iSize);
                $('#imgCanvas').css('width', 'auto');

            } else {
                if (iSize < PhotoDetails.StageW) iSize = PhotoDetails.StageW;
                PhotoDetails.ZoomFactor = parseFloat(iSize / PhotoDetails.OSrcW);
                $('#imgCanvas').css('height', 'auto');
                $('#imgCanvas').css('width', iSize);
            }

            this.ResetPosition();
            this.DrawCropPosition(true);
        },

        ResetPosition: function () {
            var sSize = { h: $('#stage').height(), w: $('#stage').width() }; 
            var iSize = { h: $('#imgCanvas').height(), w: $('#imgCanvas').width() };
            var sPos = { x: $('#stage').offset().left, y: $('#stage').offset().top };
            var iPos = { x: $('#imgCanvas').offset().left, y: $('#imgCanvas').offset().top };

            if (iPos.x > sPos.x) $('#imgCanvas').offset({ left: sPos.x + 1 }); //+1 for border
            if (iPos.y > sPos.y) $('#imgCanvas').offset({ top: sPos.y + 1 }); //+1 for border

            sPos = { x: $('#stage').offset().left, y: $('#stage').offset().top };
            iPos = { x: $('#imgCanvas').offset().left, y: $('#imgCanvas').offset().top };

            if ((iPos.x + iSize.w) < (sPos.x + sSize.w)) $('#imgCanvas').offset({ left: ((sPos.x + sSize.w + 1) - iSize.w) }); //+1 for border
            if ((iPos.y + iSize.h) < (sPos.y + sSize.h)) $('#imgCanvas').offset({ top: ((sPos.y + sSize.h + 1) - iSize.h) }); //+1 for border

            PhotoDetails.X = $('#imgCanvas').position().left;
            PhotoDetails.Y = $('#imgCanvas').position().top;
        },

        DrawCropPosition: function (doNotReload) {

            var canvasHTML = '';
            var canvasStyle = '';
            var iSize = { h: $('#imgCanvas').height(), w: $('#imgCanvas').width() };
            var adj = 0;
            var shrinkFactor = 1;

            if (!doNotReload) {
                if (iSize.w > iSize.h) {
                    shrinkFactor = (200 / iSize.w);
                    adj = shrinkFactor * iSize.h;
                    canvasStyle = 'height="' + adj + 'px" width="200px"  style="margin-top:' + ((200 - adj) / 2) + 'px;background: white;"';
                } else {
                    shrinkFactor = (200 / iSize.h);
                    adj = shrinkFactor * iSize.w;
                    canvasStyle = 'width="' + adj + 'px" height="200px"  style="margin-top:' + 0 + 'px;background: white;"';
                }

                canvasHTML = '<center><canvas id="crop-map" ' + canvasStyle + '></canvas></center>';
                $('#crop-location').html(canvasHTML);
            }

            var canvas = $("#crop-map");
            var context = document.getElementById("crop-map").getContext('2d');

            context.clearRect(0, 0, canvas.width(), canvas.height());
            context.drawImage(document.getElementById("imgCanvas"), 0, 0, canvas.width(), canvas.height());

            context.strokeStyle = '#f00'; // red
            context.lineWidth = 2;

            var locx = Math.abs(PhotoDetails.X * (canvas.width() / iSize.w));
            var locy = Math.abs(PhotoDetails.Y * (canvas.height() / iSize.h));
            var locw = (canvas.width() / iSize.w) * PhotoDetails.StageW;
            var loch = (canvas.height() / iSize.h) * PhotoDetails.StageH;

            context.strokeRect(locx, locy, locw, loch);
            context = null;
        },

        LoadPhotoEditor: function (isReload) {

            PhotoDetails = {
                OSrcW: 0,
                OSrcH: 0,
                ZoomFactor: 1,
                X: 0, Y: 0,
                StageH: 0,
                StageW: 0
            };

            var self = this;

            if (!isReload) {
                $("#global-modal").css('display', 'block');
                $("#global-modal").html("");
                $("#global-modal").html(this._photoEditorTemplate());
                $("#global-modal #close").on("tap", function (e) { e.preventDefault(); self.Close(); });
                $("#global-modal #done").on("tap", function (e) { e.preventDefault(); self.GetResultImage(); });
                $("#global-modal #rotate").on("tap", function (e) { e.preventDefault(); self.Rotate(); });
                $("#global-modal #rotate-left").on("tap", function (e) { e.preventDefault(); self.Rotate(true); });
                $("#global-modal #zoom").on("mousedown", function (e) { self.Zoom(); });
                $("#global-modal #zoom-out").on("mousedown", function (e) { self.Zoom(true); });

                $("#global-modal #zoom").on("mouseup", function (e) { clearInterval(self.zoomTimeOut); });
                $("#global-modal #zoom-out").on("mouseup", function (e) { clearInterval(self.zoomTimeOut); });
                $("#global-modal #zoom").on("mouseleave", function (e) { clearInterval(self.zoomTimeOut); });
                $("#global-modal #zoom-out").on("mouseleave", function (e) { clearInterval(self.zoomTimeOut); });
            }

            var canvas = document.getElementById("imgCanvas");
            var stage = document.getElementById("stage");
            var imgObj;
            this.tmpImage = null;
            this.tmpImage = new Image();
            imgObj = this.tmpImage;

            PhotoDetails.StageH = $('#stage').height();
            PhotoDetails.StageW = $('#stage').width();

            imgObj.src = 'data:image/png;base64,' + this.ImageB64;

            console.log("IMG-B64-LENGTH: " + this.ImageB64.length);

            imgObj.onerror = function () {
                navigator.notification.alert("An error was encountered when trying to load image.", null, "Loading Error", "OK");
                Shared.Products.Overlay.Hide();
                self.PreventRotate = false;
                imgObj = null;
            }

            imgObj.onload = function () {
                PhotoDetails.OSrcW = imgObj.width;
                PhotoDetails.OSrcH = imgObj.height;

                console.log(PhotoDetails.OSrcH + 'x' + PhotoDetails.OSrcW);

                PhotoDetails.ZoomFactor = 1;

                $('#imgCanvas').height(imgObj.height);
                $('#imgCanvas').width(imgObj.width);

                $('#imgCanvas').css('top', '0');
                $('#imgCanvas').css('left', '0');

                if ($('#imgCanvas').height() < $('#imgCanvas').width()) {
                    PhotoDetails.ZoomFactor = parseFloat($('#stage').height() / $('#imgCanvas').height());
                    $('#imgCanvas').height($('#stage').height());
                    $('#imgCanvas').width(parseFloat($('#stage').height() / imgObj.height) * imgObj.width);
                } else {
                    PhotoDetails.ZoomFactor = parseFloat($('#stage').width() / $('#imgCanvas').width());
                    $('#imgCanvas').width($('#stage').width());
                    $('#imgCanvas').height(parseFloat($('#stage').width() / imgObj.width) * imgObj.height);
                }

                canvas.onload = function () {
                    console.log('image ready to be rendered for crop positioning...');
                    self.DrawCropPosition();
                }

                $('#imgCanvas').attr('src', imgObj.src);
                console.log('image loaded');

                Shared.Products.Overlay.Hide();
                self.PreventRotate = false;

                imgObj = null;
            };

            if (isReload) return;

            var touchData = null;
            var zoomData = {
                x1: 0, y1: 0, t1: "",
                x2: 0, y2: 0, t2: ""
            };

            var touchStart = function (e) {
                e.preventDefault();
                if (!touchData) {
                    var ev, ev2;
                    if (Global.isBrowserMode) ev = e; else ev = e.originalEvent.touches[0];
                    touchData = {
                        x: ev.clientX - canvas.offsetLeft,
                        y: ev.clientY - canvas.offsetTop
                    };
                };

                if (Global.isBrowserMode) {
                    highLightBorder();
                }

                if (e.originalEvent) if (e.originalEvent.touches) if (e.originalEvent.touches.length > 1) {
                    ev = e.originalEvent.touches[0];
                    ev2 = e.originalEvent.touches[1];
                    zoomData = {
                        x1: ev.clientX,
                        y1: ev.clientY,
                        t1: ev.identifier,
                        x2: ev2.clientX,
                        y2: ev2.clientY,
                        t2: ev2.identifier
                    };
                }
            }

            var touchMove = function (e) {
                e.preventDefault();
                if (touchData) {
                    var ev, ev2;
                    if (Global.isBrowserMode) ev = e; else ev = e.originalEvent.touches[0];
                    if (zoomData) if (e.originalEvent) if (e.originalEvent.changedTouches) if (e.originalEvent.changedTouches.length > 1) {
                        for (var i = 0; i < e.originalEvent.changedTouches.length; i++) {
                            var idx = e.originalEvent.changedTouches[i].identifier;
                            if (idx == zoomData.t1) ev = e.originalEvent.changedTouches[i];
                            if (idx == zoomData.t2) ev2 = e.originalEvent.changedTouches[i];
                        }
                        if (ev && ev2) {
                            doZoom(ev, ev2);
                            return;
                        }
                    }
                    setPosition(ev);
                }
            }

            var touchEnd = function (e) {
                e.preventDefault();
                if (touchData) {
                    var ev;
                    if (Global.isBrowserMode) ev = e; else ev = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                    //setPosition(ev, true);
                    touchData = null;
                }

                if (Global.isBrowserMode) {
                    highLightBorder(true);
                }

                self.DrawCropPosition(true);
            }

            var setPosition = function (ev, validatePOS) {
                var exDx = (ev.clientX - touchData.x);
                var eyDy = (ev.clientY - touchData.y);

                canvas.style.left = (ev.clientX - touchData.x) + "px";
                PhotoDetails.X = ev.clientX - touchData.x;

                canvas.style.top = (ev.clientY - touchData.y) + "px";
                PhotoDetails.Y = ev.clientY - touchData.y;

                self.ResetPosition();
                self.DrawCropPosition(true);
            }

            var doZoom = function (ev, ev2) {

                var newZoom = {
                    x1: ev.clientX,
                    y1: ev.clientY,
                    t1: ev.identifier,
                    x2: ev2.clientX,
                    y2: ev2.clientY,
                    t2: ev2.identifier
                };

                var nxd = Math.abs(newZoom.x1 - newZoom.x2);
                var nyd = Math.abs(newZoom.y1 - newZoom.y2);
                var oxd = Math.abs(zoomData.x1 - zoomData.x2);
                var oyd = Math.abs(zoomData.y1 - zoomData.y2);
                var uxd = (nxd - oxd);
                var uyd = (nyd - oyd);
                var zoomIn = false;
                var iw, ih, iwn, ihn, incpx, resetPos;
                var useX = false;

                iw = $('#imgCanvas').width();
                ih = $('#imgCanvas').height();
                iwn = $('#imgCanvas').width();
                ihn = $('#imgCanvas').height();

                if (uxd == 0 && uxy == 0) return;
                if (Math.abs(uxd) >= Math.abs(uyd)) useX = true;

                var incXY = uxd + uyd;
                self.DoZoom(false, incXY);

                zoomData = newZoom;
            }

            var highLightBorder = function (reset) {
                if (reset) $('#stage').css('border', '1px solid gray');
                else $('#stage').css('border', '1px solid orange');
            };

            $("#imgCanvas").on("touchstart", touchStart);
            $("#imgCanvas").on("touchmove", touchMove);
            $("#imgCanvas").on("touchend", touchEnd);

            $("#imgCanvas").on("mousedown", touchStart);
            $("#imgCanvas").on("mousemove", touchMove);
            $("#imgCanvas").on("mouseup", touchEnd);

            var onMousLeave = function () { $("#imgCanvas").trigger('mouseup'); }
            if (Global.isBrowserMode) $("#imgCanvas").on("mouseleave", onMousLeave);

        }

    });
    return PricingView;
});



