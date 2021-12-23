define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/base","collection/base","view/20.0.0/products/controls/generic-popup","text!template/20.0.0/products/products/detail/unitofmeasure.tpl.html","text!template/20.0.0/products/products/detail/uom/uom.tpl.html","text!template/20.0.0/products/products/detail/uom/acc.tpl.html","text!template/20.0.0/products/products/detail/uom/sub.tpl.html","js/libs/iscroll.js"],function(e,t,i,s,o,a,n,c,l,r,u,d,h,p,b){var C={UOM:" .uom select ",QTY:" .qty input ",UPC:" .upc input ",DEL:" .del ",UOMCollapse:" .uom-collapse i ",UOMTables:" .uom-tables ",SELLING:" .selling input ",AccDel:" .accDel ",AccCode:" .accCode ",AccName:" .accName ",AccDesc:" .accDesc ",AccTable:" #accessories-table ",AccTableGroup:" #tables-accessories ",AccCollapse:" .acc-collapse i ",SubDel:" .subDel ",SubCode:" .subCode ",SubName:" .subName ",SubDesc:" .subDesc ",SubTable:" #substitute-table ",SubTableGroup:" #tables-substitute ",SubCollapse:" .sub-collapse i "},m=s.View.extend({_uomTemplate:i.template(d),_uomLine:i.template(h),_accLine:i.template(p),_subLine:i.template(b),events:{"tap .uom-add span":"btnClick_Add","tap .sub-add span":"btnClick_SubAdd","tap .acc-add span":"btnClick_AccAdd","tap .acc-collapse":"btnClick_AccColl","tap .sub-collapse":"btnClick_SubColl","tap .uom-collapse":"btnClick_UoMColl"},btnClick_Add:function(e){e.preventDefault(),this.AddNew(),this.Collapse(C.UOMCollapse,!0)},btnClick_SubAdd:function(e){e.preventDefault(),this.LoadProductCollection(null,C.SubTable)},btnClick_AccAdd:function(e){e.preventDefault(),this.LoadProductCollection(null,C.AccTable)},btnClick_AccColl:function(e){e.preventDefault(),this.Collapse(C.AccCollapse)},btnClick_SubColl:function(e){e.preventDefault(),this.Collapse(C.SubCollapse)},btnClick_UoMColl:function(e){e.preventDefault(),this.Collapse(C.UOMCollapse)},initialize:function(){this.uomList=new r,this.$el.show()},render:function(){this.$el.html(this._uomTemplate());var t=this.model.get("ItemType");return"Gift Card"!=t&&"Gift Certificate"!=t||e(C.AccTableGroup).css("display","none"),this.LoadUoMCollection(),this.DisplaySubstitutes(),this.DisplayAccessories(),this.CheckReadOnlyMode(),this},CheckReadOnlyMode:function(){this.options.IsReadOnly&&(e(".uom-add span").addClass("ui-disabled"),e(".sub-add span").addClass("ui-disabled"),e(".acc-add span").addClass("ui-disabled"),e(C.UOM).addClass("ui-readonly"),e(C.UPC).addClass("ui-readonly"),e(C.QTY).addClass("ui-readonly"),e(C.DEL).addClass("ui-disabled"),e(C.AccDel).addClass("ui-disabled"),e(C.SubDel).addClass("ui-disabled"),e(C.SubName).addClass("ui-readonly"),e(C.AccName).addClass("ui-readonly"),e(C.SELLING).addClass("ui-readonly"))},Show:function(){this.GetUoM()},Close:function(){this.remove(),this.unbind()},InitializeChildViews:function(){},GetUoM:function(){var e=this,t=new l;this.uomList=new r,t.url=o.ServiceUrl+a.PRODUCT+n.LOADUNITSOFMEASURE,t.fetch({success:function(t,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.uomList.reset(t.get("UnitMeasures")),e.modifyUOMListCollection(),e.render()},error:function(t,i,s){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.render()}})},isGiftCredits:function(){var e=this.model.get("ItemType");return"Gift Card"==e||"Gift Certificate"==e},modifyUOMListCollection:function(){this.isGiftCredits()&&this.uomList.each(function(e){e.set({UnitMeasureQuantity:1})},this)},LoadUoMCollection:function(){var t=this,i=0;e("#uom-table-base").html(""),e("#uom-table-additional").html("");var s=!1;this.collection.each(function(e){s||(s=e.get("DefaultSelling")||!1)}),this.collection.each(function(e){if(e.get("UnitMeasureQty")){var o=e.get("UnitMeasureQty");e.set({UnitMeasureQuantity:o})}!s&&e.get("IsBase")&&e.set({DefaultSelling:!0}),t.RenderUoM(e,i),i++})},AddNew:function(){if(this.uomList.model.length=0)return void navigator.notification.alert("There are no available Unit of Measures!",null,"Error","OK");if(this.Validate()){var e=new l;e.set({IsNew:!1,IsBase:!1,UnitMeasureQuantity:0,UPCCode:"",UnitMeasureCode:"",DefaultSelling:!1}),this.collection.add(e),this.collection.HasChanges=!0,this.RenderUoM(e,this.collection.models.length-1)}},RefreshiScroll:function(){o.isBrowserMode||(this.myScroll?(this.myScroll.refresh(),e("#detail-body").height()<e("#unitofmeasure-details").height()&&this.myScroll.scrollToElement("li:first-child",100)):this.myScroll=new iScroll("detail-body",{vScrollbar:!0,vScroll:!0,snap:!0,momentum:!0,useTransform:!1,onBeforeScrollStart:function(e){for(var t=e.target;1!=t.nodeType;)t=t.parentNode;"SELECT"!=t.tagName&&"INPUT"!=t.tagName&&"TEXTAREA"!=t.tagName&&e.preventDefault()}}),e("#detail-body div:first-child").css("width","100%"),e(".tables").css("width","80%"))},RenderUoM:function(t,i){var s="-additional",o="uomIndex"+i;t.get("IsBase")&&(s="-base"),t.get("IsNew")&&(uomNew="new");var a="#uom-table"+s;t.set({uomIndex:o}),t.attributes.HasTransaction||t.set({HasTransaction:!1}),e(a).append(this._uomLine(t.toJSON())),e(".base .qty input").attr("readonly","readonly");var n=a+" #"+o;this.LoadUOMList(n+" select",t.get("UnitMeasureCode")),this.isGiftCredits()&&(e(C.QTY).addClass("ui-readonly"),e(C.QTY).attr("disabled",!0)),this.BindEvents(t,n),this.RefreshiScroll()},BindEvents:function(t,i){t.set({cid:i});var s=this;e(i+C.QTY).on("focus",function(){s.Quantity_focus(i,C.QTY)}),e(i+C.QTY).on("keyup",function(){s.InputError(i,C.QTY,!0),s.ChangeModelAttribute(i,C.QTY)}),e(i+C.QTY).on("change",function(){s.ChangeModelAttribute(i,C.QTY)}),e(i+C.QTY).on("blur",function(){s.RevertPreviousValue(i,C.QTY),s.Validate(!1,i,C.QTY)}),e(i+C.UPC).on("keyup",function(){s.ChangeModelAttribute(i,C.UPC)}),e(i+C.UPC).on("change",function(){s.ChangeModelAttribute(i,C.UPC)}),e(i+C.UOM).on("change",function(){s.ValidateUMChangeDelete(i,C.UOM)}),e(i+C.DEL).on("tap",function(e){e.preventDefault(),s.ValidateUMChangeDelete(i,C.DEL)}),e(i+C.SELLING).on("change",function(){s.ChangeModelAttribute(i,C.SELLING)})},ValidateUMChangeDelete:function(t,i){if(this.IsNew)return void this.ChangeModelAttribute(t,i);var s;if(this.collection.each(function(e){e.get("cid")==t&&(s=e)}),s){if(!s.get("UnitMeasureCode")||""==s.get("UnitMeasureCode"))return void this.ChangeModelAttribute(t,i);var n=this,r=new l;r.set({ItemCode:n.model.get("ItemCode"),UnitMeasureCode:s.get("UnitMeasureCode")});var u=function(i){i?(e(t+C.DEL+" i").removeClass("icon-trash"),e(t+C.DEL+" i").addClass("icon-spinner"),e(t+C.DEL+" i").addClass("icon-spin")):(e(t+C.DEL+" i").removeClass("icon-spinner"),e(t+C.DEL+" i").removeClass("icon-spin"),e(t+C.DEL+" i").addClass("icon-trash"))};u(!0),r.url=o.ServiceUrl+a.PRODUCT+"isItemHasTransaction/",r.save(r,{success:function(a,l){return o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),u(),l.Value?(i==C.DEL&&c.Products.ShowNotification("Unit Measure cannot be deleted when item has transaction.",!0),void(i==C.UOM&&(e(t+C.UOM).val(s.get("UnitMeasureCode")),c.Products.ShowNotification("Unit Measure cannot be changed when item has transaction.",!0)))):void n.ChangeModelAttribute(t,i)},error:function(e,t,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),u(),c.Products.ShowNotification("An error was encountered when trying to validate Unit Measure!",!0)}})}},ChangeModelAttribute:function(e,t){var i=this;this.collection.each(function(s){s.get("cid")==e&&i.DoChangeAttribute(s,e,t)})},DoChangeAttribute:function(t,i,s){var o=null;switch(s!=C.DEL&&(o=e(i+s).val()),this.collection.HasChanges=!0,s){case C.DEL:if(!t)return;if(t.get("IsBase"))return;this.collection.remove(t),this.LoadUoMCollection();break;case C.UOM:var a=null,n=o,c=t.get("UnitMeasureCode");if(t.set({UnitMeasureCode:o}),!this.Validate(!0))return t.set({UnitMeasureCode:c}),void this.LoadUOMList(i+s,c);if(t.get("IsBase"))break;this.uomList.each(function(e){e.get("UnitMeasureCode")==n&&(a=e.get("UnitMeasureQuantity"))}),a&&(e(i+C.QTY).val(a),t.set({UnitMeasureQuantity:a,UnitMeasureQty:a}));break;case C.QTY:if(t.get("IsBase"))return t.set({UnitMeasureQuantity:1,UnitMeasureQty:1}),void e(i+C.QTY).val(1);t.set({UnitMeasureQuantity:o,UnitMeasureQty:o});break;case C.UPC:t.set({UPCCode:o});break;case C.SELLING:o=e(i+s).prop("checked")||!1;var l=t.get("DefaultSelling")||!1;if(l&&!o)return void e(i+s).attr("checked",!0);this.collection.each(function(t){t.get("cid")!=i&&(t.set({DefaultSelling:!1}),e(t.get("cid")+s).attr("checked",!1))}),t.set({DefaultSelling:o})}},LoadUOMList:function(t,i){var s="UnitMeasureCode";this.uomList.sortedField=s,this.uomList.comparator=function(e){var t=this;return e.get(t.sortedField)};e(t).html(""),this.uomList.sort(s).each(function(s){var o="";s.get("UnitMeasureCode")==i&&(o="Selected"),e(t).append("<option "+o+">"+s.get("UnitMeasureCode")+"</option>")}),i||e(t).prop("selectedIndex",-1)},Validate:function(t,i,s){if(!this.collection)return!1;var a=this,n="",c=!1,l="";return this.collection.each(function(r){if(!(c||i&&i!=r.get("cid"))){if(!(t||s&&s!=C.QTY)){if(!r.get("UnitMeasureCode"))return c=!0,void(n="UnitMeasureCode");if(""==e.trim(r.get("UnitMeasureCode")))return c=!0,void(n="UnitMeasureCode");if(!r.get("UnitMeasureQuantity"))return c=!0,void(n="UnitMeasureQuantity");if(e.trim(r.get("UnitMeasureQuantity"))<=0)return c=!0,void(n="UnitMeasureQuantity");if(e.trim(r.get("UnitMeasureQuantity")).indexOf(".")>-1&&!o.InventoryPreference.IsAllowFractional)return c=!0,void(n="UnitMeasureQuantity")}if(!s||s==C.UOM){if(l.indexOf("["+r.get("UnitMeasureCode")+"]")>-1)return c=!0,void(n="UOM_Duplicate");l=l+"["+r.get("UnitMeasureCode")+"]",a.InputError(r.get("cid"),C.QTY,!0)}}}),l=null,!c||(this.ValidationError=n,this.trigger("validationError"),i&&s&&this.InputError(i,s),!1)},InputError:function(t,i,s){s?e(t+i).removeClass("cs-input-error"):e(t+i).addClass("cs-input-error")},Quantity_focus:function(t,i){if("#uom-table-base #uomIndex0"!=t){var s=t+i;this.currentQty=e(s).val(),e(s).val(""),this.AssignNumericValidation(t,i)}},AssignNumericValidation:function(e,t){var i=e+t;o.InventoryPreference.IsAllowFractional?c.Input.NonNegative(i):c.Input.NonNegativeInteger(i)},RevertPreviousValue:function(t,i){if("#uom-table-base #uomIndex0"!=t){var s=e(t+i).val(),o="";o=""!==s?parseFloat(s):this.currentQty,e(t+i).val(o)}},Collapse:function(t,i){var s="icon-chevron-up",o="icon-chevron-down";switch(t){case C.AccCollapse:e(C.AccCollapse).hasClass(s)&&!i?(e(C.AccCollapse).removeClass(s),e(C.AccCollapse).addClass(o),e(C.AccTable).hide()):(e(C.AccCollapse).removeClass(o),e(C.AccCollapse).addClass(s),e(C.AccTable).show());break;case C.SubCollapse:e(C.SubCollapse).hasClass(s)&&!i?(e(C.SubCollapse).removeClass(s),e(C.SubCollapse).addClass(o),e(C.SubTable).hide()):(e(C.SubCollapse).removeClass(o),e(C.SubCollapse).addClass(s),e(C.SubTable).show());break;case C.UOMCollapse:e(C.UOMCollapse).hasClass(s)&&!i?(e(C.UOMCollapse).removeClass(s),e(C.UOMCollapse).addClass(o),e(C.UOMTables).hide()):(e(C.UOMCollapse).removeClass(o),e(C.UOMCollapse).addClass(s),e(C.UOMTables).show())}this.RefreshiScroll()},ShowProductLookUp:function(){!this.genericpopup||this.genericpopup.Closed?(e(".page-popup").html("<div></div>"),this.genericpopup=new u({el:".page-popup div"}),this.genericpopup.on("search",this.SearchItem,this),this.genericpopup.on("selected",this.SelectedItem,this),this.genericpopup.collection=this._products,this.genericpopup.SetPlaceHolder("Search Products"),this.genericpopup.SetDisplayField("ItemName"),this.genericpopup.SetExtDisplayField("ItemDescription"),this.genericpopup.Show()):this.genericpopup.RefreshList(this._products),this.ItemLoadedFor==C.SubTable&&this.genericpopup.SetTitle("Substitute"),this.ItemLoadedFor==C.AccTable&&this.genericpopup.SetTitle("Accessory")},SearchItem:function(){this.genericpopup&&this.LoadProductCollection(this.genericpopup.GetItemToSearch(),this.ItemLoadedFor,this.ItemIndex)},SelectedItem:function(){if(this.SelectedItemModel=null,this.genericpopup){var e=new l;this.genericpopup.GetSelectedModel()&&e.set(this.genericpopup.GetSelectedModel().attributes),this.SelectedItemModel=e,this.genericpopup.Close(),this.ItemLoadedFor==C.SubTable&&this.LoadSelectedSub(e),this.ItemLoadedFor==C.AccTable&&this.LoadSelectedAcc(e)}},LoadSelectedAcc:function(t){var i=!1,s=new l;if(this.accessories.each(function(e){e.get("AccessoryCode")==t.get("ItemCode")&&(i=!0)}),i)return this.ValidationError="AccessoryExist",void this.trigger("validationError");this.accessories.HasChanges=!0;var o=this;return this.ItemIndex&&""!=this.ItemIndex?void this.accessories.each(function(i){i.get("accIndex")==o.ItemIndex&&(i.set({AccessoryCode:t.get("ItemCode"),AccessoryName:t.get("ItemName"),AccessoryDesc:t.get("ItemDescription")}),e("#"+o.ItemIndex+C.AccCode).html(c.EscapedModel(i).get("AccessoryCode")),e("#"+o.ItemIndex+C.AccName).html(c.EscapedModel(i).get("AccessoryName")),e("#"+o.ItemIndex+C.AccDesc).html(c.EscapedModel(i).get("AccessoryDesc")))}):(s.set({AccessoryCode:t.get("ItemCode"),AccessoryName:t.get("ItemName"),AccessoryDesc:t.get("ItemDescription")}),this.accessories.add(s),void this.RenderAccLine(s,this.accessories.length))},LoadSelectedSub:function(t){var i=!1,s=new l;if(this.substitutes.each(function(e){e.get("SubstituteCode")==t.get("ItemCode")&&(i=!0)}),i)return this.ValidationError="SubstituteExist",void this.trigger("validationError");this.substitutes.HasChanges=!0;var o=this;return this.ItemIndex&&""!=this.ItemIndex?void this.substitutes.each(function(i){i.get("subIndex")==o.ItemIndex&&(i.set({SubstituteCode:t.get("ItemCode"),SubstituteName:t.get("ItemName"),SubstituteDesc:t.get("ItemDescription")}),e("#"+o.ItemIndex+C.SubCode).html(c.EscapedModel(i).get("SubstituteCode")),e("#"+o.ItemIndex+C.SubName).html(c.EscapedModel(i).get("SubstituteName")),e("#"+o.ItemIndex+C.SubDesc).html(c.EscapedModel(i).get("SubstituteDesc")))}):(s.set({SubstituteCode:t.get("ItemCode"),SubstituteName:t.get("ItemName"),SubstituteDesc:t.get("ItemDescription")}),this.substitutes.add(s),void this.RenderSubLine(s,this.substitutes.length))},LoadProductCollection:function(e,t,i){this.ItemLoadedFor=t,this.ItemIndex=i,this.InitializeProductLookUp(),this._productLookUp.set({StringValue:e}),this._productLookUp.url=o.ServiceUrl+a.PRODUCT+n.GETITEMLIST,this._productLookUp.save(),c.Products.Overlay.Show()},InitializeProductLookUp:function(){this._productLookUp||(this._productLookUp=new l,this._productLookUp.on("sync",this.ProductLookUpLoadSuccess,this),this._productLookUp.on("error",this.ProductLookUpLoadError,this))},ProductLookUpLoadSuccess:function(e,t,i){if(o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this._products||(this._products=new r),this._products.reset(t.Items),this.model&&this.model.get("ItemCode")&&""!=this.model.get("ItemCode")){var s,a=this.model.get("ItemCode");this._products.each(function(e){s||e.get("ItemCode")==a&&(s=e)}),s&&this._products.remove(s)}this.ShowProductLookUp()},ProductLookUpLoadError:function(e,t,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),console.log(e),c.Products.Overlay.Hide()},DisplaySubstitutes:function(){if(this.substitutes){e(C.SubTable).html("");var t=this,i=0;this.substitutes.each(function(e){i++,t.RenderSubLine(e,i)})}else e(C.SubTable).html("")},RenderSubLine:function(t,i){i||(i=this.substitutes.length+1);var s=t.get("SubstituteDesc")||t.get("ItemDescription");t.set({subIndex:"subLine"+i,SubstituteDesc:s}),e(C.SubTable).append(this._subLine(c.EscapedModel(t).toJSON())),this.Collapse(C.SubCollapse,!0),this.BindeSubLineEvents(t),this.RefreshiScroll()},BindeSubLineEvents:function(t){var i=this,s=C.SubTable+" #"+t.get("subIndex");e(s+C.SubDel).on("tap",function(e){e.preventDefault(),i.DeleteSubLine(t.get("subIndex"))}),e(s+C.SubName).on("tap",function(e){e.preventDefault(),i.LoadProductCollection(null,C.SubTable,t.get("subIndex"))})},DeleteSubLine:function(e){var t;this.substitutes&&this.substitutes.each(function(i){t||e==i.get("subIndex")&&(t=i)}),t&&(this.substitutes.remove(t),this.substitutes.HasChanges=!0,this.DisplaySubstitutes())},DisplayAccessories:function(){if(this.accessories){e(C.AccTable).html("");var t=this,i=0;this.accessories.each(function(e){i++,t.RenderAccLine(e,i)})}else e(C.AccTable).html("")},RenderAccLine:function(t,i){i||(i=this.accessories.length+1);var s=t.get("AccessoryDesc")||t.get("ItemDescription");t.set({accIndex:"accLine"+i,AccessoryDesc:s}),e(C.AccTable).append(this._accLine(c.EscapedModel(t).toJSON())),this.Collapse(C.AccCollapse,!0),this.BindeAccLineEvents(t),this.RefreshiScroll()},BindeAccLineEvents:function(t){var i=this,s=C.AccTable+" #"+t.get("accIndex");e(s+C.AccDel).on("tap",function(e){e.preventDefault(),i.DeleteAccLine(t.get("accIndex"))}),e(s+C.AccName).on("tap",function(e){e.preventDefault(),i.LoadProductCollection(null,C.AccTable,t.get("accIndex"))})},DeleteAccLine:function(e){var t;this.accessories&&this.accessories.each(function(i){t||e==i.get("accIndex")&&(t=i)}),t&&(this.accessories.remove(t),this.accessories.HasChanges=!0,this.DisplayAccessories())}});return m});