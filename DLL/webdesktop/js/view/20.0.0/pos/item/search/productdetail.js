define(["jquery","mobile","underscore","backbone","model/base","shared/global","shared/method","shared/shared","shared/service","text!template/20.0.0/pos/item/search/productdetail.tpl.html"],function(e,t,i,o,n,a,s,r,l,c){var h=o.View.extend({_template:i.template(c),initialize:function(){this.render()},GenerateItemImageByCode:function(){this.generateImage=new n,this.generateImage.set({StringValue:this.model.get("ItemCode")}),this.generateImage.url=a.ServiceUrl+l.PRODUCT+s.GENERATEITEMIMAGEBYCODE,this.generateImage.save(),this.generateImage.on("sync",this.ShowItemDetails,this)},ShowItemDetails:function(){a.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator();var t=a.ServiceUrl+s.IMAGES+this.model.get("ItemCode")+".png?"+Math.random();a.IsUseISEImage&&(t=this.AssignISEImageLocation(this.model.get("Filename"))),console.log(t),this.model.set({ImageLocation:t},{silent:!0});var i=this.model.get("UnitsInStock"),o=i.toString().split(".");return 0===o[1]&&(i=parseFloat(i)),this.model.set({UnitsInStock:i,CurrencySymbol:a.CurrencySymbol},{silent:!0}),e("#lookup-inner").html(this._template(this.model.toJSON())),this.DisplayWholesalePrice(),this.CheckItemType(),e("#lookup-detail-content").trigger("create"),e("#lookup-detail-content").find(".category-detail").css("max-width","80%"),e("#lookup-detail-content").find(".category-detail").css("white-space","nowrap"),e("#lookup-detail-content").find(".category-detail").css("overflow","hidden"),this},render:function(){this.GenerateItemImageByCode()},CheckItemType:function(){var t=this.model.get("ItemType");console.log("culprint here"),"Service"==t||"Non-Stock"==t||"Kit"==t?e("#onHand-btn").hide():e("#onHand-btn").show()},DisplayWholesalePrice:function(){switch(a.Preference.ShowWholesalePrice){case!0:e(".li-wholesalePrice").show();break;case!1:e(".li-wholesalePrice").hide()}},AssignISEImageLocation:function(e){return a.WebSiteURL+"/"+s.ISEIMAGES+a.ISEImageSize+e}});return h});