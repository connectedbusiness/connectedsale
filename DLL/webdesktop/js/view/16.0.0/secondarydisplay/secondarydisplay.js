define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/base","collection/base","collection/cart","collection/workstations","view/16.0.0/secondarydisplay/cart","view/16.0.0/secondarydisplay/options","view/16.0.0/secondarydisplay/workstations/workstations","view/16.0.0/pos/signature/signature","view/16.0.0/pos/giftcard/giftcard","text!template/16.0.0/secondarydisplay/secondarydisplay.tpl.html","js/libs/signalr/jquery.signalR-2.0.3.js"],function(t,i,e,n,o,r,a,s,l,h,c,u,d,S,g,f,w,v){var C=n.View.extend({_SecondaryDisplayTemplate:e.template(v),events:{"tap .secondarydisplay-page .header-btn":"btnClick_Options"},InitializeChildViews:function(){this.InitializeCart(),this.InitializeOptionsView(),t("body, html, a").on("tap",this.outsideMenuHandler)},render:function(){return this.LoadAdvertisements(),this.$el.html(this._SecondaryDisplayTemplate(this.GetCompanyInformation().toJSON())),this.ShowWorkstationListView(),this},outsideMenuHandler:function(){t(".deletebtn-overlay").hide(),t(".popover").hide(),t("#lookup-search").blur()},remove:function(){t("body, html,a").off("tap",this.outsideMenuHandler),n.View.prototype.remove.call(this)},InitializeCart:function(){this.InitializeCartCollection(),this.cartView=new d({el:t("#secondarydisplay-cart"),collection:this.cartCollection})},InitializeCartCollection:function(){this.cartCollection?this.cartCollection.reset():this.cartCollection=new c},InitializeOptionsView:function(){this.optionsView=new S,this.optionsView.on("ShowConnectToOptions",this.ShowConnectToOptions,this),this.optionsView.on("BackToDashboard",this.BackToDashboard,this),this.$(".main-toolbar-header").append(this.optionsView.render().el)},GetCompanyInformation:function(){var t=(o.CompanyName.replace(/[^a-z0-9\s]/gi,"").replace(/[_\s]/g," "),o.ServiceUrl+a.COMPANYIMAGE+o.CompanyName+".png"),i=o.ServiceUrl+"Ads/";return new l({CompanyName:o.CompanyName,CompanyLogo:t,AdsSource:i})},ShowConnectToOptions:function(){this.ShowWorkstationListView()},ShowWorkstationListView:function(){this.workstationListView?(this.$(".blockOverlay").show(),this.workstationListView.Show()):(this.InitializeWorkstationListView(),this.ShowWorkstationListView())},HideWorkstationListView:function(){this.workstationListView&&this.workstationListView.Close()},InitializeWorkstationListView:function(){this.InitializeWorkstationCollection(),this.workstationListView=new g({el:this.$(".workstationContainer"),collection:this.workstationCollection}),this.workstationListView.on("ViewClosed",this.WorkstationListView_Closed,this)},InitializeWorkstationCollection:function(){this.workstationCollection||(this.workstationCollection=new u,this.workstationCollection.on("selected",this.WorkstationSelected,this))},WorkstationListView_Closed:function(t){this.$(".blockOverlay").hide()},WorkstationSelected:function(t){this.HideWorkstationListView(),o.WorkStationPreference=new l,o.WorkStationPreference=t,this.WorkstationID!=t.get("WorkstationID")&&(this.ResetCart(),this.WorkstationID=t.get("WorkstationID"),this.StartMonitoring(this.WorkstationID))},MonitorTransaction:function(t){s.IsNullOrWhiteSpace(t)||this.BeginLoadCurrentTransaction(t)},BeginLoadCurrentTransaction:function(t){this.cartTimeInterval&&this.StopCartTimeInterval(),this.cartTimeInterval=window.setInterval(function(){this.LoadCurrentTransaction(t)}.bind(this),250)},StartMonitoring:function(i){var e=o.ServiceUrl+"signalr";this.logCurrentHub=t.hubConnection(e,{useDefaultPath:!1}),this.logCurrentProxy=this.logCurrentHub.createHubProxy("secondaryDisplayHub"),this.logCurrentProxy.on("logCurrentTransaction",function(t){this.LoadCurrentTransaction(t)}.bind(this)),this.logCurrentHub.start().done(function(t){console.log(t.message),this.logCurrentHubStarted=!0,this.logCurrentHubID=t.id,this.logCurrentProxy.invoke("joinGroup",i)}.bind(this)).fail(function(t){console.log(t.message),this.logCurrentHubStarted=!1})},StopMonitoring:function(){this.logCurrentHub.stop(),this.logCurrentHubStarted=!1,this.logCurrentHub=null,this.logCurrentProxy=null,this.logCurrentHubID=null},LogCurrentTransaction:function(t,i){this.logCurrentProxy.invoke("logCurrentTransaction",t.toJSON(),this.logCurrentHubID,this.WorkstationID).done(function(e){"SIGNATURE"==i?this.LogCurrentSignature(t):"PIN"==i&&this.LogCurrentPIN(t),this.ClearGlobalDeclarations()}.bind(this)).fail(function(t){navigator.notification.alert(t,null,"Error","OK")})},LogCurrentSignature:function(t){this.logCurrentProxy.invoke("logCurrentSignature",t.toJSON(),this.logCurrentHubID,this.WorkstationID).done(function(t){console.log(t)}).fail(function(t){navigator.notification.alert(t,null,"Error","OK")})},LogCurrentPIN:function(t){this.logCurrentProxy.invoke("logCurrentPIN",t.toJSON(),this.logCurrentHubID,this.WorkstationID).done(function(t){console.log(t),this.HideOverlay()}.bind(this)).fail(function(t){navigator.notification.alert(t,null,"Error","OK")})},LoadCurrentTransaction:function(t){if(s.IsNullOrWhiteSpace(t))return void navigator.notification.alert("The secondary display seems to have encountered a(n) error.",null,"Error","OK");if(t.WorkstationID!=this.WorkstationID)return void navigator.notification.alert("Workstation ID mismatch. Try again by selecting the correct Workstation ID.",null,"Error","OK");var i=!!t.SOP.AskSignature&&t.SOP.AskSignature,n=!!t.SOP.AskPIN&&t.SOP.AskPIN;this.ManageSignatureView(i),this.ManageGiftPINView(n,t.SOP.PINType),s.IsNullOrWhiteSpace(t.SOP)?(this.cartCollection.reset(),this.cartView.UpdateSummary(null)):(o.LastResponse=t,this.SetLastRetrievalDate(t.SOP.DateModified),this.GetWorkStationPreference(t),this.cartCollection.reset(),e.each(t.SOPDetails,function(i){if(t.SOPKitDetails){var n=e.filter(t.SOPKitDetails,function(t){return t.ItemKitCode==i.ItemCode&&t.LineNum==i.LineNum});n&&0!=n.length&&(i.KitDetails=new h(n))}this.cartCollection.add(i)}.bind(this)),this.cartView.UpdateSummary(t.SOP))},GetWorkStationPreference:function(t){this.workStationPreferenceCollection||(this.workStationPreferenceCollection=new h),this.workStationPreferenceCollection.reset(t.Preferences),o.WorkStationPreference=this.workStationPreferenceCollection.find(function(t){return t.get("WorkstationID")==this.WorkstationID}.bind(this))},EncryptPIN:function(t){return t?Base64.encode(t):t},ManageGiftPINView:function(i,e){e&&(e=t.trim(e)),i?(this.ShowOverlay(),this.InitializeGiftPINView(),this.giftPINView.viewType="SecondaryDisplay",this.giftPINView.ShowGCardActivationForm(e)):(this.giftPINView&&this.giftPINView.Hide(),this.ClearGlobalDeclarations())},InitializeGiftPINView:function(){this.giftPINView||(this.giftPINView=new w({el:t("#giftCardContainer")}),this.giftPINView.on("pinCaptured",this.AttachPINCaptured,this))},AttachPINCaptured:function(t){var i=new l,e=o.LastResponse.SOP,n=o.LastResponse.SOPDetails;this.HideOverlay(),this.ShowOverlay(),o.LastResponse.SOP.WorkstationID=this.WorkstationID,o.LastResponse.SOP.SignatureDetail=null,o.LastResponse.SOP.AskSignature=!1,o.LastResponse.SOP.AskPIN=!1,o.LastResponse.SOP.PINDetail=this.EncryptPIN(t),i.set(o.LastResponse),i.set({WorkstationID:this.WorkstationID,SOP:e,SOPDetails:n}),i.url=o.ServiceUrl+r.POS+a.LOGCURRENTTRANSACTION,o.SVG_ReadyToSave=!0,this.LogCurrentTransaction(i,"PIN")},ManageSignatureView:function(t){return t?(this.InitializeSignatureView(),this.signatureView.viewType="SecondaryDisplay",void this.signatureView.Show()):(this.signatureView&&this.signatureView.Close(),void this.ClearGlobalDeclarations())},InitializeSignatureView:function(){this.signatureView||(this.signatureView=new f({el:t("#signatureContainer")}),this.signatureView.on("SignatureAdded",this.AttachSignature,this),this.signatureView.on("formClosed",this.SignatureClosed,this))},SignatureClosed:function(){t("#main-transaction-blockoverlay").hide()},SetLastRetrievalDate:function(t){this.lastRetrievalDate=t},LoadAdvertisements:function(){this.counter=0,this.adsCollection=new h;var t=new l;t.url=o.ServiceUrl+r.POS+a.GETADVERTISEMENTS,t.fetch({success:function(t,i,e){this.adsCollection.reset(i.FileInfoList),this.LoadNewAdvertisement(),this.adsCollection.length>1&&(this.adsTimeInterval=window.setInterval(function(){this.LoadNewAdvertisement()},5e3))}.bind(this)})},LoadNewAdvertisement:function(){if(0!=this.adsCollection.length){this.counter==this.adsCollection.length&&(this.counter=0);var i=this.formatADSUrl(this.adsCollection.at(this.counter).get("Name"));""!=i&&(t(".ads-container").css("background-image",i),this.counter++)}},formatADSUrl:function(t){var i=o.ServiceUrl+"Images/Ads/"+t;return"url("+i+")"},btnClick_Options:function(t){t.stopPropagation(),this.optionsView.Show()},StopInterval:function(){this.StopCartTimeInterval(),this.StopAdsTimeInterval()},StopCartTimeInterval:function(){window.clearInterval(this.cartTimeInterval)},StopAdsTimeInterval:function(){window.clearInterval(this.adsTimeInterval)},BackToDashboard:function(){this.StopInterval(),window.location.hash="dashboard"},ResetCart:function(){this.SetLastRetrievalDate(),this.cartCollection.reset(),this.cartView.UpdateSummary()},AttachSignature:function(){o.Signature&&this.AssignSignatureDetail()},AssignSignatureDetail:function(){var t=new l;o.SVG_Hold=new Array,o.SVG_ReadyToSave=!1;var i=function(){!this.IsHoldSVG()&&o.SVG_ReadyToSave&&t.save(null,{success:function(t,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),i.ErrorMessage?navigator.notification.alert(i.ErrorMessage,null,"Error saving current transaction"):this.ClearGlobalDeclarations()}.bind(this),error:function(t,i,e){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator()}})}.bind(this);o.LastResponse.SOP.WorkstationID=this.WorkstationID,o.LastResponse.SOP.SignatureDetail=this.ValidateSVG(o.Signature,i),o.LastResponse.SOP.AskSignature=!1;var e=o.LastResponse.SOP,n=o.LastResponse.SOPDetails;t.set(o.LastResponse),t.set({WorkstationID:this.WorkstationID,SOP:e,SOPDetails:n}),t.url=o.ServiceUrl+r.POS+a.LOGCURRENTTRANSACTION,o.SVG_ReadyToSave=!0,!this.IsHoldSVG()&&o.SVG_ReadyToSave&&this.LogCurrentTransaction(t,"SIGNATURE")},ShowOverlay:function(){t("#main-transaction-blockoverlay").show()},HideOverlay:function(){t("#main-transaction-blockoverlay").hide()},ClearGlobalDeclarations:function(){o.Signature=null,o.SVGArray=null,this.HideOverlay()},IsHoldSVG:function(){if(!o.SVG_Hold)return!1;if(0==o.SVG_Hold.length)return!1;if(this.SVGHasError())return!0;for(var t=!1,i=0;i<o.SVG_Hold.length;i++)if(o.SVG_Hold[i].length>0)return!0;return o.SVG_Hold=new Array,t},SVGHasError:function(){if(!o.SVG_Hold)return!1;if(0==o.SVG_Hold.length)return!1;for(var t=!1,i=0;i<o.SVG_Hold.length;i++)if("ERROR"==o.SVG_Hold[i])return!0;return t},ValidateSVG:function(t,i){if(!t)return t;var e="[SVGID]:"+Math.random()+"-"+Math.random(),n=8e3;if(o.SVGArray||(o.SVGArray=new Array),t.indexOf("[SVGID]:")!==-1?(o.SVGArray[f].ID=t)&&(t=o.SVGArray[f].SVG):o.SVGArray[o.SVGArray.length]={ID:e,SVG:t},t.length<=n)return t;for(var s=0,h=0,c=new Array,u=!0;u;){s++,h++;var d=t.substr((h-1)*n,n);0==t.substr(h*n).length&&(u=!1);var S={Part:h,SVG:d};c[c.length]=S}for(var g=new Array,f=0;f<c.length;f++){var w=new l({SignatureID:e,PartNumber:c[f].Part,PartCount:s,SignatureSVG:c[f].SVG});w.url=o.ServiceUrl+r.POS+a.UPDATESIGNATURE;var v=o.SVG_Hold.length;o.SVG_Hold[v]=e+"OF"+c[f].Part,g[g.length]=w}return this.SaveSVG(g,1,i),e},SaveSVG:function(t,i,e){if(0!=t.length&&!(i>t[0].get("PartCount")))for(var n=(t[0].get("PartCount"),0);n<t.length;n++){var r=t[n];r.get("PartNumber")!=i||this.SVGHasError()||r.save(r,{success:function(t,i){if(i.Value){for(var n=0;n<o.SVG_Hold.length;n++)o.SVG_Hold[n]==t.get("SignatureID")+"OF"+t.get("PartNumber")&&(o.SVG_Hold[n]="");e(),this.SaveSVG(_svgArray,_partNum+1,e)}}.bind(this),error:function(t,i,n){for(var r=0;r<o.SVG_Hold.length;r++)o.SVG_Hold[r]==t.get("SignatureID")+"OF"+t.get("PartNumber")&&(o.SVG_Hold[r]="ERROR");e(),navigator.notification.alert("An error was encoutered while trying to save signatures.",null,"Error Saving Signature","OK")}})}}});return C});