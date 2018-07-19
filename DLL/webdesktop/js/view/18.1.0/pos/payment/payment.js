define(["jquery","mobile","underscore","backbone","shared/enum","shared/global","shared/method","shared/service","shared/shared","model/postal","model/country","collection/postal","collection/countries","view/18.1.0/pos/keypad/keypad","view/18.1.0/pos/payment/gift","view/18.1.0/pos/payment/loyaltypoints","view/18.1.0/pos/postal/addpostal","text!template/18.1.0/pos/payment/payment.tpl.html","text!template/18.1.0/pos/payment/cash.tpl.html","text!template/18.1.0/pos/payment/check.tpl.html","text!template/18.1.0/pos/payment/creditcard.tpl.html","view/spinner","js/libs/jSignature.min.js","js/libs/moment.min.js","js/libs/format.min.js"],function(t,e,i,n,a,o,s,r,l,c,d,u,y,h,m,p,g,C,f,P,v,w){var S,b,k,T=function(t){1==t?k.AddNewPostal():k.ClearPostalDetails()},N=n.View.extend({_template:i.template(C),_cashTemplate:i.template(f),_checkTemplate:i.template(P),_creditCardTemplate:i.template(v),events:{"tap #keypad-done-btn":"btnSave_tap","tap #cmdDone":"btnSave_tap","tap #btn-cancelPayment":"btnClose_tap","tap .btn-clear-signature":"btnClearSignature_tap","tap #cc-swipe":"btnUni","change #cc-msg":"processMsg","change #isUnimag":"checkUnimag","tap #btn-more":"btnLoadMoreInfo_tap","change #ccCountry":"CountryChanged","change #ccCity":"CityChanged","keyup #ccPostal":"keyupPostal","blur  #ccPostal":"blurPostal","blur #ccEmail":"blurEmail","keydown #ccPhone":"txtPhone_Keydown","keyup #cardNumber":"cardNumber_keyup","focus #cardNumber":"AssignNumericValidation","focus #cvNumber":"AssignNumericValidation","focus #ccPhoneExt":"AssignNumericValidation","focus #ccPhone":"AssignNumericValidation","tap #btn-ask-to-sign":"btn_AskToSign","tap #btn-stop-asking":"btnCancel_Retrieval","blur #expDate":"ExpDate_blur","keydown #ccPhone":"CCPhone_keydown","keydown #expDate":"ExpDate_keydown"},ExpDate_keydown:function(e){if(o.isBrowserMode)return 9==e.keyCode?(t("#cvNumber").focus(),e.preventDefault(),!1):void 0},CCPhone_keydown:function(e){if(o.isBrowserMode)return 9==e.keyCode?(t("#ccPhoneExt").focus(),e.preventDefault(),!1):void 0},ExpDate_blur:function(){t("#cvNumber").focus()},btn_AskToSign:function(t){t.preventDefault(),this.$(".btn-ask-to-sign").attr("id","btn-stop-asking"),I(),this.trigger("allowUserToAttachSign","Payment",this)},btnCancel_Retrieval:function(t){t.preventDefault(),console.log("btnCancel_Retrieval"),this.$(".btn-ask-to-sign").attr("id","btn-ask-to-sign"),D(),this.trigger("cancelSignRetrieval","Refund",this)},SketchSignature:function(t){D(),O=!0,this.sketchView=!0,this.ShowSignatureDisplay(),this.LoadSignature(t)},LoadSignature:function(e){if(null!=e){var i=new Image;i.src="data:image/svg+xml;base64,"+e,this.$(".signatureDisplay").html(t(i))}},ShowSignatureDisplay:function(){this.sketchView&&(this.$(".signature").jSignature("reset"),this.$(".signature").hide(),this.$(".signatureDisplay").show())},keyupPostal:function(e){if(13===e.keyCode){this.keyupIsTriggered=!0;var i=t("#ccPostal").val();this.LoadPostal(i)}},AssignNumericValidation:function(t){o.isBrowserMode||l.Input.NonNegativeInteger("#"+t.target.id)},blurPostal:function(e){if(l.IsNullOrWhiteSpace(this.keyupIsTriggered)){var i=t("#ccPostal").val();this.LoadPostal(i)}this.keyupIsTriggered=!1},blurEmail:function(e){var i=t("#ccEmail").val();if(l.ValidateEmailFormat(i))return void navigator.notification.alert("Email format is invalid.",null,"Invalid Email","OK")},txtPhone_Keydown:function(t){var e=t.keyCode;8==e||e>47&&e<58||e>95&&e<106||t.preventDefault()},cardNumber_keyup:function(e){if(13===e.keyCode){var i=t("#cardNumber").val();o.isBrowserMode&&i.length>16&&(this.isUnimag=!1,l.CreditCard.ParseCreditCardMagWithValidation(i,this.isUnimag))}},checkUnimag:function(e){e.preventDefault();var i=t("#isUnimag").text();console.log("IsUnimag :"+i),o.isBrowserMode?t("#cc-msg").text("Enter Credit card details."):"true"===i&&t("#cc-msg").text("Establishing connection...")},btnClearSignature_tap:function(t){t.preventDefault(),this.ClearSignature()},ClearSignature:function(){var t=o.Signature;this.sketchView?(this.$(".signature").show(),this.$(".signatureDisplay").hide(),t&&(t.indexOf("[SVGID]:")!==-1?this.trigger("deleteSavedSignature",o.Signature,this):o.Signature=null)):this.$(".signature").jSignature("reset"),this.sketchView=!1,O=!1},btnSave_tap:function(e){return e.preventDefault(),this.IsWaiting()?void navigator.notification.alert("Waiting for customer's signature",null,"Invalid Action","OK"):void(t("#keypad-done-btn").hasClass("keypad-btn-faded")||this.SavePayment())},btnClose_tap:function(e){if(e.preventDefault(),!this.giftView||!this.giftView.IsWaiting()){if(this.CheckIfShowSignature()&&this.IsWaiting())return void navigator.notification.alert("Waiting for customer's signature",null,"Invalid Action","OK");this.Close(),t("#main-transaction-blockoverlay").hide()}},CheckIfShowSignature:function(){var t=!1;return o.PaymentType==a.PaymentType.Check&&(t=o.Preference.RequireSignatureOnCheck),o.PaymentType==a.PaymentType.CreditCard&&(t=o.Preference.RequireSignatureOnCreditCard),t},IsWaiting:function(){return this.$("#signature").hasClass("ui-disabled")},btnLoadMoreInfo_tap:function(e){switch(e.preventDefault(),e.currentTarget.innerHTML){case"More":t("#paymentAdditionalFields").show(),t("#paymentPrimaryFields").hide(),t(".signature-container").css("visibility","hidden"),t("#cc-msgContainer").css("visibility","hidden"),t("#btn-more").text("Back"),this.InitializePostal(),this.InitializeCountry(),t("#ccPostal").focus();break;case"Back":t("#paymentAdditionalFields").hide(),t("#paymentPrimaryFields").show(),t(".signature-container").css("visibility","visible"),t("#cc-msgContainer").css("visibility","visible"),t("#btn-more").text("More"),t("#cardNumber").focus()}},btnUni:function(e){if(e.preventDefault(),o.isBrowserMode)t("#cardNumber").focus(),this.RequestSwipe("Please swipe card."),l.CreditCard.ClearCreditCardInfo(),t("#expDate").removeClass("ui-disabled");else{var i=t("#isUnimag").text();"true"===i?this.RequestSwipe("Please swipe card."):this.LoadUnimagPlugin()}},processCard:function(e){e.preventDefault(),console.log("CHANGED CARD"),this.HideActivityIndicator(),t(".keypad").removeClass("ui-disabled"),t(".left-popover-btn").removeClass("ui-disabled"),t(".right-popover-btn").removeClass("ui-disabled")},processMsg:function(e){e.preventDefault(),this.HideActivityIndicator();var i=t("#cc-msg").text(),n=t("#track1").text(),a=t("#track2").text(),s=t("#ksn").text();t("#magnePrint").text(),t("#magnePrintStatus").text();console.log("Payment: "+i),"Card unreadable. Try again."===i?this.RequestSwipe("Please swipe card again."):"Successfully retrieved credit card information."===i&&""===n&&""===a&&""===s&&(console.log("Unable to read card information."),t("#cardNumber").val(""),l.SetDefaultToday("#expDate","YYYY-MM"),t("#cardName").val(""),t("#track1").text(""),t("#track2").text(""),t("#ksn").text(""),t("#magnePrint").text(""),t("#magnePrintStatus").text(""),o.isBrowserMode||navigator.notification.alert("Unable to get credit card information. Please swipe again.",null,"Unable to Proceed","OK"))},CountryChanged:function(e){var i=e.target.id,n=t("#"+i).val(),a=t("#ccPostal").val();this.countrySelected!=n&&a.length>0&&this.ClearPostalInfo(),this.countrySelected=n,this.PreviousCountrySelected=n},CityChanged:function(t){t.preventDefault(),this.SetState()},initialize:function(){var t=this.options.showForm;this.transactionBalance=this.options.balance,k=this,t&&(this.render(),this.InitializeSignature(),this.SetFocusedField()),this.on("processPINCaptured",this.TiggerPopulateTextFields)},render:function(){b=this;var e=this.transactionBalance;e>=1e10?navigator.notification.alert("Total exceeded the allowed maximum amount of 10,000,000,000.00",null,"Error","OK"):(this.$el.html(this._template({PaymentType:o.PaymentType})),o.TermDiscount>0&&this.$("#term-discount").text("Term Discount "+o.CurrencySymbol+o.TermDiscount.toFixed(2)).show(),this.InitializePaymentDetail(),this.ToggleFields(),t("#main-transaction-blockoverlay").show()),this.countrySelected=null,o.isBrowserMode&&this.BindLastElement(),o.isBrowserMode||this.ActivateUnimagPlugin()},BindLastElement:function(){o.isBrowserMode&&t("#paymentBody input:visible:last").on("keydown",function(e){if(9==e.keyCode)return t("#paymentBody input:visible:first").focus(),e.preventDefault(),!1})},RemoveScreenOverLay:function(){t("#main-transaction-blockoverlay").hide()},LoadUnimagPlugin:function(){l.NMIPaymentGateway.ActivateUnimag(),l.NMIPaymentGateway.isConnected();var e=this;t("#cc-msg").off("failedToDetectDevice"),t("#cc-msg").on("failedToDetectDevice",function(){navigator.notification.confirm("The device was not detected, would you like to try again?",function(t){1==t&&(console.log("Attemping to detect device."),l.NMIPaymentGateway.DeactivateUnimag(),e.LoadUnimagPlugin())},"Unable to Detect Device",["Yes","No"])})},InitializePaymentDetail:function(){switch(o.PaymentType){case a.PaymentType.Cash:this.InitializeCashPayment();break;case a.PaymentType.Check:this.InitializeCheckPayment();break;case a.PaymentType.CreditCard:this.InitializeCreditCardPayment();break;case a.PaymentType.Gift:this.InitializeGiftPayment();break;case a.PaymentType.Loyalty:this.InitializeLoyaltyPayment()}this.$(".paymentDetails").trigger("create"),o.PaymentType!=a.PaymentType.Loyalty?(this.InitializeKeypadView(),t(".complete-btn-container").removeClass("loyaltyBtn"),t("#keypad-done-btn").show(),t("#btn-donePayment").hide()):(t(".complete-btn-container").addClass("loyaltyBtn"),t("#keypad-done-btn").hide(),t("#btn-donePayment").show()),this.ToggleSize()},InitializePostal:function(){this.postalmodel||(this.postalmodel=new c),this.postalCollection||(this.postalCollection=new u)},LoadPostal:function(e){if(""==e)this.ClearCity();else{var i=this;l.LoadPostalByCode(e,function(t){i.postalCollection.reset(t),i.DisplayResultOnPostal(e)},function(e){i.postalCollection.reset(),i.postalCollection.RequestError(e,"Error Loading Postal Code"),t("#ccPostal").val("")})}},AddNewPostal:function(){var e=t("#addPostalCodeContainer"),i=t("#ccPostal").val(),n=t("#ccCountry option:selected").val();t(e).html("<div id='addPostalContainer' style='display: none'></div>");var a=t("#addPostalContainer");l.IsNullOrWhiteSpace(this.newPostalView)?this.newPostalView=new g({el:a}):(this.newPostalView.remove(),this.newPostalView=new g({el:a})),this.newPostalView.on("AcceptPostal",this.AcceptPostal,this),this.newPostalView.on("ClearPostal",this.ClearPostalDetails,this),this.newPostalView.Show(i,n,this.countryCollection)},AcceptPostal:function(e){this.disableEnter=!1,this.countrySelected=e.CountryCode,this.SetSelectedCountry(this.countrySelected),t("#ccPostal").val(e.PostalCode),t("#ccCity").val(e.StateCode),this.postal=e.PostalCode,this.city=e.City,this.LoadPostal(this.postal,this.city)},ClearPostalDetails:function(){this.disableEnter=!1,t("#ccPostal").val(""),this.postal="",this.ClearCity()},DisplayResultOnPostal:function(e){this.newCollection=new u,this.postalCollection.each(this.RemoveInvalidPostals,this),this.postalCollection=this.newCollection,0===this.postalCollection.length?(this.disableEnter=!0,navigator.notification.confirm("The Postal Code '"+e+"' does not exist in the Country selected. Do you want to add '"+e+"' ?",T,"Postal Not Found",["Yes","No"])):(t('#ccCity > option[val !=""]').remove(),this.LoadRetrievedPostal(),t("#ccCity").prop("selectedIndex",0),t("#ccCity").trigger("change"))},LoadRetrievedPostal:function(){this.postalCollection.each(this.SetFields,this)},RemoveInvalidPostals:function(t){var e=t.get("CountryCode");e===this.countrySelected&&this.newCollection.add(t)},ClearPostalInfo:function(){t("#ccPostal").val(""),t("#ccState").val(""),this.ClearCity()},ClearCity:function(){t('#ccCity > option[val !=""]').remove(),t("#ccCity").append(new Option("City...","")),t("#ccCity").prop("selectedIndex",0),t("#ccCity").trigger("change"),t("#ccState").val("")},SetState:function(){var e=t("#ccCity option:selected").val();if(""!=e){var i=this.postalCollection.find(function(t){return e=t.get("City")}),n=i.get("StateCode");t("#ccState").val(n)}else t("#ccState").val("")},SetFields:function(e){var i=e.get("City");t("#ccCity").append(new Option(i,i)),t("#ccCity").selectmenu("refresh",!0),this.SetState()},InitializeCountry:function(){this.countryModel||(this.countryModel=new d,this.countryModel.on("sync",this.SuccessCountryLookupResult,this),this.countryModel.on("error",this.ErrorCountryLookupResult,this)),this.countryCollection?0===this.countryCollection.length?this.LoadCountry():this.ReloadCountry(this.countryCollection):(this.countryCollection=new y,this.countryCollection.on("reset",this.DisplayCountries,this),this.LoadCountry())},LoadCountry:function(){_rows=1e4,this.index=0,this.countryModel.set({Criteria:""}),this.countryModel.url=o.ServiceUrl+r.CUSTOMER+s.COUNTRYCODELOOKUP+_rows,this.countryModel.save()},SuccessCountryLookupResult:function(t,e,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.countryCollection.reset(e.Countries)},ErrorCountryLookupResult:function(t,e,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.RequestError(e,"Error Loading Country List")},DisplayCountries:function(t){0===t.length?(console.log("no countries available."),navigator.notification.alert("No country available.",null,"No Country Found","OK")):this.ReloadCountry(t)},LoadRetrievedCountry:function(e){e.each(this.SetCountryOptions,this),t("#ccCountry").selectmenu("refresh",!0)},SetCountryOptions:function(e){var i=e.get("CountryCode");t("#ccCountry").append(new Option(i,i))},ReloadCountry:function(e){t('#ccCountry > option[val !=""]').remove(),this.LoadRetrievedCountry(e),null!==this.countrySelected&&void 0!==this.countrySelected||(this.countrySelected=o.CurrentCustomer.Country?o.CurrentCustomer.Country:o.ShipTo.Country),this.SetSelectedCountry(this.countrySelected)},SetSelectedCountry:function(e){t("#ccCountry > option[value='"+e+"']").attr("selected","selected"),t("#ccCountry").selectmenu("refresh",!0)},InitializeCashPayment:function(){},InitializeCheckPayment:function(){t(".paymentDetails").html(this._checkTemplate({Balance:this.transactionBalance}))},InitializeCreditCardPayment:function(){t(".paymentDetails").html(this._creditCardTemplate({NameOnCard:o.CurrentCustomer.CustomerName,Balance:this.transactionBalance})),l.BrowserModeDatePicker("#expDate","datepicker","yy-mm"),o.isBrowserMode&&t("#cardNumber").focus(),t("#cc-msg").text("Enter Credit card details.")},InitializeGiftPayment:function(){this.giftView&&(this.giftView.unbind(),this.giftView.remove()),t(".paymentDetails").html("<div></div>"),this.giftView=new m({el:".paymentDetails div"}),this.giftView.on("askToEnterPIN",this.TriggerAskToEnterPIN,this),this.giftView.on("stopAskingPIN",this.TriggerStopPINRetrieval,this),this.giftView.on("changeKeypadAmount",this.GiftChangeKeypadAmount,this)},GiftChangeKeypadAmount:function(t){var e=this.transactionBalance;t>e?this.keypadView.SetAmount(e.toString()):this.keypadView.SetAmount(t.toString())},PopulatePINFields:function(t){this.giftView&&this.giftView.PopulatePINFields(t)},TriggerAskToEnterPIN:function(t){this.trigger("askToEnterPIN",t,this)},TriggerStopPINRetrieval:function(){this.trigger("stopAskingPIN","payment",this)},InitializeLoyaltyPayment:function(){l.IsNullOrWhiteSpace(this.loyaltyView)||this.loyaltyView.unbind();console.log("Balance : "+this.transactionBalance),this.loyaltyView=new p({el:".paymentDetails"}),this.loyaltyView.paymentCollection=this.collection,this.loyaltyView.render(this.transactionBalance)},ToggleSize:function(){var t=!1;switch(o.PaymentType){case a.PaymentType.Cash:this.$("#paymentBody").addClass("cashPayment"),this.$(".paymentDetails").hide();break;case a.PaymentType.Check:t=o.Preference.RequireSignatureOnCheck,t?this.$("#paymentBody").addClass("checkPaymentWithSignature"):this.$("#paymentBody").addClass("checkPayment"),this.$(".keypad").addClass("keypadWithLeftPadding");break;case a.PaymentType.CreditCard:t=o.Preference.RequireSignatureOnCreditCard,t?this.$("#paymentBody").addClass("creditCardPaymentWithSignature"):this.$("#paymentBody").addClass("creditCardPayment"),this.$(".keypad").addClass("keypadWithLeftPadding");break;case a.PaymentType.Gift:this.$("#paymentBody").addClass("giftPayment"),this.$(".keypad").addClass("keypadWithLeftPadding");break;case a.PaymentType.Loyalty:this.$("#paymentBody").addClass("loyaltyPayment")}o.PaymentType!=a.PaymentType.Cash&&(o.PaymentType==a.PaymentType.Loyalty?this.AdjustPaymentBodyHeight(!0):this.AdjustPaymentBodyHeight())},DestroyCountryAndPostal:function(){this.postalModel&&this.postalModel.clear(),this.countryModel&&this.countryModel.clear(),this.countryCollection&&this.countryCollection.reset(void 0,{silent:!0}),this.postalCollection&&this.postalCollection.reset(void 0,{silent:!0})},Close:function(){o.PaymentType!=a.PaymentType.CreditCard&&o.PaymentType!=a.PaymentType.Check||this.CheckIfShowSignature()&&this.ClearSignature(),o.Signature=null,this.DestroyCountryAndPostal(),this.Hide(),t("#paymentContainer").removeClass("paymentFormLarge"),this.trigger("formClosed",this)},GetExistingNewLoyaltyPayment:function(){if(o.PaymentType!=a.PaymentType.Loyalty)return 0;if(!this.collection)return 0;if(0==this.collection.length)return 0;var t=this.collection.find(function(t){return t.get("PaymentType")==a.PaymentType.Loyalty&&1==t.get("IsNew")});return t?parseFloat(t.get("AmountPaid")):0},Show:function(t){this.sketchView=!1,this.cancelledPayment=!1,this.transactionBalance=parseFloat(t)+this.GetExistingNewLoyaltyPayment(),this.render(),this.$el.show(),this.InitializeSignature(),this.SetFocusedField()},Hide:function(){t(document).unbind("keydown"),this.isFullPayment||this.RemoveScreenOverLay(),console.log("Payment Type: "+o.PaymentType),this.DeactiveUnimag(),this.$el.html(""),this.$el.hide()},ActivateUnimagPlugin:function(){void 0!=window.plugins&&"Credit Card"===o.PaymentType&&(o.isBrowserMode||this.LoadUnimagPlugin());var e=t("#isUnimag").text();"false"===e&&t("#cc-msg").text("Device is not connected.")},DeactiveUnimag:function(){void 0!=window.plugins&&"Credit Card"===o.PaymentType&&(o.isBrowserMode||l.NMIPaymentGateway.DeactivateUnimag())},InitializeSignature:function(){var e=!1;switch(O=!1,o.PaymentType){case a.PaymentType.Check:e=o.Preference.RequireSignatureOnCheck;break;case a.PaymentType.CreditCard:e=o.Preference.RequireSignatureOnCreditCard}e&&(this.$(".signature-container").show(),this.$(".signature").jSignature({height:"100px"}),this.$(".signature").bind("change",this.SignatureChanged),t("#paymentContainer").addClass("paymentFormLarge"))},SignatureChanged:function(t){O=!0},MustOverwriteExistingGift:function(){return o.TransactionType==a.TransactionType.Order||o.TransactionType==a.TransactionType.UpdateOrder||o.TransactionType==a.TransactionType.ConvertQuote||o.TransactionType==a.TransactionType.ConvertOrder},IsGiftAlreadyExist:function(){var t=!1;if(o.PaymentType==a.PaymentType.Gift&&this.giftView){var e=this;this.collection&&this.collection.length>0&&this.collection.each(function(i){var n=i.get("IsNew")||!1,o=i.get("PaymentType")||"",s=i.get("SerialLotNumber")||"";!t&&n&&o==a.PaymentType.Gift&&s.toUpperCase()==e.giftView.gift.get("SerialLotNumber").toUpperCase()&&(l.IsNullOrWhiteSpace(n)||(t=!0))}),t&&navigator.notification.confirm("This Gift Card/Certificate is already added as payment.\nWould you like to use this amount instead?",V,"Gift Exists",["Yes","No"])}return t},ChangeGiftAmountToUse:function(){this.keypadView.GetAmount();if(this.collection&&this.collection.length>0){var t,e=this;this.collection.each(function(i){var n=i.get("IsNew")||!1,o=i.get("PaymentType")||"",s=i.get("SerialLotNumber")||"";t||!n&&!e.MustOverwriteExistingGift()||o!=a.PaymentType.Gift||s.toUpperCase()!=e.giftView.gift.get("SerialLotNumber").toUpperCase()||l.IsNullOrWhiteSpace(n)||(t=i)}),t&&(this.collection.remove(t),this.transactionBalance=this.options.GetTransactionBalance()||0,this.SavePayment())}},ValidateGift:function(t,e,i,n){return o.PaymentType!=a.PaymentType.Gift||!!this.giftView&&this.giftView.ValidateGift(t,e,i,n)},SavePayment:function(){var e,i;o.PaymentType==a.PaymentType.Loyalty?(e=this.loyaltyView.monetaryPoints,i=this.loyaltyView.monetaryPoints,console.log("Amount Paid : "+e)):(e=this.keypadView.GetAmount(),i=this.keypadView.GetAmount());var n=t("#ccEmail").val();this.ValidateGift(e,this,"SavePayment",arguments)&&(this.IsGiftAlreadyExist()||this.IsNumeric(e)&&(e=this.GetTransactionPayment(),this.ValidatePayment(o.PaymentType,e,i)&&this.ValidateSignature(o.PaymentType)&&this.ValidateEmail(o.PaymentType,n)&&this.AddPayment(o.PaymentType,e)))},ValidateEmail:function(t,e){return t!==a.PaymentType.CreditCard||""==e||(!l.ValidateEmailFormat(e)||(navigator.notification.alert("Email format is invalid.",null,"Invalid Email","OK"),!1))},ValidatePayment:function(e,i,n){if(!i||0===i)return console.log("Please specify an amount."),navigator.notification.alert("Please specify an amount.",null,"Amount is Required","OK"),!1;switch(e){case a.PaymentType.Check:var o=t("#checkNumber").val();if(""===o.trim())return console.log("Please enter the Check Number."),navigator.notification.alert("Please enter the Check Number.",null,"Check Number is Required","OK"),!1;if(isNaN(o))return console.log("Please enter a valid Check Number"),navigator.notification.alert("Please enter valid Check Number",null,"Check Number invalid","OK"),!1;if(n>i)return console.log("Non-cash over payment is not allowed."),navigator.notification.alert("Non-cash over payment is not allowed.",null,"Invalid Payment","OK"),this.keypadView.SetAmount(this.transactionBalance.toFixed(2)),!1;break;case a.PaymentType.CreditCard:var s=t("#cardNumber").val(),r=t("#expDate").val(),l=t("#cardName").val(),c=(t("#track1").text(),t("#track2").text(),t("#ksn").text(),t("#magnePrint").text(),t("#magnePrintStatus").text(),t("#isSwiped").html()),d=t("#authorizationNumber").val();if(_cv=t("#cvNumber").val(),""===s.trim())return console.log("Please enter the Card Number."),navigator.notification.alert("Please enter the Card Number.",null,"Card Number is Required","OK"),!1;if(""===r.trim())return console.log("Please enter the Expiration Date."),navigator.notification.alert("Please enter the Expiration Date.",null,"Expiration Date is Required","OK"),!1;if(""===l.trim())return console.log("Please enter the Name on Card."),navigator.notification.alert("Please enter the Name on Card.",null,"Name on Card is Required","OK"),!1;var u=this.GetDateError(r);if(u)return console.log(u),navigator.notification.alert(u,null,"Invalid Date","OK"),!1;if(n>i)return console.log("Non-cash over payment is not allowed."),navigator.notification.alert("Non-cash over payment is not allowed.",null,"Invalid Payment","OK"),this.keypadView.SetAmount(this.transactionBalance.toFixed(2)),!1;if(0==d.length&&"false"==c&&null==s.match(/^\d+$/))return navigator.notification.alert("Card Number is not valid.",null,"Invalid Payment","OK"),!1;if(isNaN(s))return navigator.notification.alert("Please enter valid Card Number",null,"Card Number Invalid","OK"),!1;if(isNaN(_cv))return console.log("Invalid CV Number"),navigator.notification.alert("Please enter valid CV Number",null,"CV Number Invalid","OK"),!1;break;case a.PaymentType.Gift:if(n>i)return console.log("Non-cash over payment is not allowed."),navigator.notification.alert("Non-cash over payment is not allowed.",null,"Invalid Payment","OK"),this.keypadView.SetAmount(this.transactionBalance.toFixed(2)),!1}return!0},GetDateError:function(t){var e=0,i=0,n=new Date,a=n.getMonth()+1,o=n.getFullYear(),s=!1,r=!1;return t=t.split("-"),2===t.length?(e=t[0],i=t[1],isNaN(i)||isNaN(e)?s=!0:(e=parseFloat(e),i=parseFloat(i),i>12||0==i?s=!0:e<o?r=!0:e==o&&i<a&&(r=!0))):s=!0,s?"Invalid Expiration Date format. Use YYYY-MM.":r?"Card is already expired.":null},ValidateSignature:function(t){switch(t){case a.PaymentType.Check:if(o.Preference.RequireSignatureOnCheck&&O===!1)return console.log("A signature from the customer is required."),navigator.notification.alert("A signature from the customer is required.",null,"Signature is Required","OK"),!1;break;case a.PaymentType.CreditCard:if(o.Preference.RequireSignatureOnCreditCard&&O===!1)return console.log("A signature from the customer is required."),navigator.notification.alert("A signature from the customer is required.",null,"Signature is Required","OK"),!1}return!0},AddPayment:function(t,e){return 0===e?(console.log("Please enter the Amount Paid."),navigator.notification.alert("Please enter the Amount Paid.",null,"Amount is Required","OK"),!1):(payment=this.CreatePayment(t,e),void(t!=a.PaymentType.Cash&&this.Close()))},CreatePayment:function(t,e){switch(t){case a.PaymentType.Cash:S=e,this.CheckCashPaymentChangeDue();break;case a.PaymentType.Check:this.AddCheckPayment(e);break;case a.PaymentType.CreditCard:this.AddCreditCardPayment(e);break;case a.PaymentType.Gift:this.AddGiftPayment(e);break;case a.PaymentType.Loyalty:var i=this.collection.find(function(t){return t.get("PaymentType")==a.PaymentType.Loyalty&&1==t.get("IsNew")}),n=this;if(i)return void navigator.notification.confirm("There's an existing Loyalty Payment in this transaction.\nWould you like to use this new amount instead?",function(t){1==t?n.DoAddLoyaltyPayment(i,e):(n.isFullPayment=!1,n.Close())},"Loyalty Payment Exists",["Yes","No"]);this.AddLoyaltyPayment(e)}},DoAddLoyaltyPayment:function(t,e){t&&(this.transactionBalance=parseFloat(parseFloat((this.transactionBalance||0)+parseFloat(t.get("AmountPaid")||0)).toFixed(2)),this.isFullPayment=parseFloat(e)>=this.transactionBalance,this.collection.remove(t)),this.AddLoyaltyPayment(e)},AddLoyaltyPayment:function(t){this.collection.add({AmountPaid:t,PaymentType:a.PaymentType.Loyalty,Account:this.GetPaymentAccountInfo(),IsNew:!0,POSWorkstationID:o.POSWorkstationID,POSClerkID:o.Username}),this.Close()},formatAmount:function(t){var e=t.replace(",",""),i=e.replace(",",""),n=format("#,##0.00",i.replace(",",""));return n},AddCashPayment:function(){var t=this;this.collection.add({AmountPaid:S,PaymentType:a.PaymentType.Cash,Account:this.GetPaymentAccountInfo(),IsNew:!0,POSWorkstationID:o.POSWorkstationID,POSClerkID:o.Username,ChangeAmount:isNaN(t.lastChangeAmount)?0:t.lastChangeAmount}),this.Close()},AddCheckPayment:function(e){var i=t("#checkNumber").val(),n="",s="";O&&(n=this.GetSignature(),n.indexOf("[SVGID]:")!==-1&&(s=o.SignatureContent)),o.Signature=null,this.collection.add({CheckNumber:i,PaymentType:a.PaymentType.Check,AmountPaid:e,Account:this.GetPaymentAccountInfo(),IsNew:!0,SignatureSVG:n,SignatureSVGContent:s,POSWorkstationID:o.POSWorkstationID,POSClerkID:o.Username})},AddGiftPayment:function(t){var e="Gift Certificate";this.giftView.IsCard&&(e="Gift Card"),this.collection.add({AmountPaid:t,PaymentType:a.PaymentType.Gift,Account:this.GetPaymentAccountInfo(),IsNew:!0,CreditCode:this.giftView.gift.get("CreditCode"),SerialLotNumber:this.giftView.gift.get("SerialLotNumber"),GiftType:e,POSWorkstationID:o.POSWorkstationID,POSClerkID:o.Username}),this.Close()},AddCreditCardPayment:function(e){var i=["January","February","March","April","May","June","July","August","September","October","November","December"],n=t("#cardNumber").val(),s=t("#expDate").val(),r=t("#track1").text(),l=t("#track2").text(),c=t("#ksn").text(),d=t("#magnePrint").text(),u=t("#magnePrintStatus").text(),y=t("#cvNumber").val(),h=t("#ccCountry option:selected").val(),m=t("#ccPostal").val(),p=t.trim(t("#cardName").val())||o.CurrentCustomer.CustomerName,g=t("#ccAddress").val(),C=t("#ccCity option:selected").val(),f=t("#ccState").val(),P=t("#ccPhone").val(),v=t("#ccPhoneExt").val(),w=t("#ccEmail").val(),S=t("#authorizationNumber").val(),b=t("#isSwiped").html(),k="",T="",N="",I="",A="",D=!1,x=""!=c&&null!=c;s=s.split("-"),2===s.length&&(k=s[0],T=i[parseInt(s[1])-1]),b="false"!==b,N="Authorize",""!=S&&(D=!0),O&&(I=this.GetSignature(),I.indexOf("[SVGID]:")!==-1&&(A=o.SignatureContent)),this.sketchView=!1,o.Signature=null;var V=this.EncryptCardNumber(n);N=this.GetCreditCardTransactionType(N,D,a.PaymentType.CreditCard,n),this.collection.add({AmountPaid:e,PaymentType:a.PaymentType.CreditCard,CreditCardNumber:n,ExpDateYear:k,ExpDateMonth:T,NameOnCard:p,CardTransactionType:N,IsNew:!0,SignatureSVG:I,SignatureSVGContent:A,Track1:r,Track2:l,Ksn:c,MagnePrint:d,MagnePrintStatus:u,IsCreditCardEncrypted:x,IsUnimag:this.isUnimag,EncryptedCreditCardNumber:V,CreditCardIsAuthorizedVerbally:D,CreditCardAuthorizationCode:S,Email:w,Address:g,Country:h,PostalCode:m,City:C,State:f,Telephone:P,TelephoneExtension:v,CardVerification:y,POSWorkstationID:o.POSWorkstationID,POSClerkID:o.Username}),this.isUnimag=!1},GetCreditCardTransactionType:function(t,e,i,n){if("Credit Card"==i)switch(o.TransactionType){case"Convert Quote":case"Order":case"Update Order":return"Authorize";case"Convert Order":return 1!=e||"Auth"!=t&&"Authorize"!=t?1==o.AllowSaleCreditPreference?"Sale":"Auth/Capture":"Force";case"Suspended":case"Resume Sale":return e&&o.IsPosted&&("Auth"==t||"Authorize"==t)?"Force":o.IsPosted&&!e?1==o.AllowSaleCreditPreference?"Sale":"Auth/Capture":"Authorize";default:return o.IsPosted?e&&o.IsPosted?"Force":1==o.AllowSaleCreditPreference?"Sale":"Auth/Capture":"Authorize"}return null},EncryptCardNumber:function(t){for(var e=t.length,i=t.substr(e-4,4),n=e-4,a="",o=0;o<n;o++)a+="X";return a+i},CheckCashPaymentChangeDue:function(){var t=this.transactionBalance;t=parseFloat(t.toFixed(2));var e;o.PaymentType==a.PaymentType.Loyalty?this.loyaltyView.monetaryPoints:e=this.keypadView.GetAmount();var i;e>t?(i=e-t,i=i.toFixed(2),this.lastChangeAmount=isNaN(i)?0:i,this.Hide(),console.log("Your change is "+o.CurrencySymbol+" "+this.formatAmount(i)+"."),navigator.notification.confirm("Your change is "+o.CurrencySymbol+" "+this.formatAmount(i)+".",x,"Change Due",["Yes","No"])):(this.lastChangeAmount=0,this.AddCashPayment())},GetTransactionPayment:function(){var t;return o.PaymentType==a.PaymentType.Loyalty?(t=this.loyaltyView.monetaryPoints,console.log("Amount Paid : "+t)):t=this.keypadView.GetAmount(),t>=this.transactionBalance?(this.isFullPayment=!0,this.transactionBalance):(this.isFullPayment=!1,t)},GetPaymentAccountInfo:function(){return o.Preference.IsDepositPayment?"Deposit":"Undeposited"},IsNumeric:function(t){return!isNaN(t)||(console.log("The value you entered is not valid."),navigator.notification.alert("The value you entered is not valid.",null,"Invalid Format","OK"),!1)},SetFocusedField:function(){switch(o.PaymentType){case a.PaymentType.Cash:t("#amountPaid:visible").focus();break;case a.PaymentType.Check:t("#checkNumber:visible").focus();break;case a.PaymentType.CreditCard:}},RequestSwipe:function(e){t("#cardNumber").val(""),l.SetDefaultToday("#expDate","YYYY-MM"),t("#expDate").removeAttr("readonly"),t("#cardName").val(""),t("#track1").text(""),t("#track2").text(""),t("#ksn").text(""),t("#magnePrint").text(""),t("#magnePrintStatus").text(""),o.isBrowserMode||l.NMIPaymentGateway.RequestSwipe(),t("#cc-msg").text(e)},GetCardNumber:function(t){return t.substring(1,17)},UpdateChangeDue:function(t){var e=0;t>this.transactionBalance&&(e=t-this.transactionBalance),this.$("#changeDue").html(e.toFixed(2)+"&nbsp;&nbsp;")},ToggleFields:function(){switch(o.TransactionType){case a.TransactionType.SalesRefund:t("#amountPaid").attr("readonly","readonly"),t("#label-balance").html("Paid"),t("#label-amountPaid").html("Refund"),t("#cardRefNumber").show();break;default:t("#amountPaid").removeAttr("readonly"),t("#label-balance").html("Balance"),t("#label-amountPaid").html("Amount"),t("#cardRefNumber").hide()}},GetSignature:function(){if(this.sketchView)return o.Signature;var t=this.$(".signature").jSignature("getData","svgbase64");return t?t[1]:null},InitializeKeypadView:function(){this.keypadView&&this.keypadView.remove();var e=this;this.keypadView=new h({el:t(".keypad")}),this.keypadView.on("enterTriggered",function(){l.IsNullOrWhiteSpace(e.disableEnter)&&t("#keypad-done-btn").tap()},this),this.keypadView.Show(),this.keypadView.SetAmount(this.transactionBalance.toFixed(2));
},closePluginDevice:function(){window.plugins.cbCCSwipe.CloseDevice("close")},ShowSpinner:function(){var t=document.getElementById("lblCard");this.ShowActivityIndicator(t)},ShowActivityIndicator:function(e){e||(e=document.getElementById("lblCard")),t("<div id='lblSpinner'></div>").appendTo(e);var i=document.getElementById("lblSpinner");_spinner=w,_spinner.opts.color="#000",_spinner.opts.lines=11,_spinner.opts.length=4,_spinner.opts.width=2,_spinner.opts.radius=5,_spinner.opts.top=-21,_spinner.opts.left=139,_spinner.spin(i)},HideActivityIndicator:function(){_spinner=w,_spinner.stop(),t("#lblSpinner").remove()},ResetField:function(){t("#track1").text(""),t("#track2").text(""),t("#ksn").text(""),t("#magnePrint").text(""),t("#magnePrintStatus").text("")},AdjustPaymentBodyHeight:function(e){this.$("input#checkNumber").attr("style","width: 71% !important;"),!o.TermDiscount>0||(e?(o.TermDiscount>0?this.$("#paymentBody").css("height","335px"):this.$("#paymentBody").css("height","276px"),this.$(".term-discount").css("margin-top","20px")):o.PaymentType==a.PaymentType.Check&&t("#paymentBody").hasClass("checkPayment")?this.$("#paymentBody").css("height","459px"):this.$("#paymentBody").css("height","400px"))}}),I=function(){var e=document.getElementById("btn-stop-asking");_spinner=w,_spinner.opts.left=10,_spinner.opts.radius=3,_spinner.opts.lines=9,_spinner.opts.length=4,_spinner.opts.width=3,_spinner.opts.color="#000",_spinner.spin(e,"Cancel"),t("#btn-stop-asking .ui-btn-text").text("Cancel"),t(".btn-ask-to-sign").css("text-align","center"),t("#signature").addClass("ui-disabled")},A=function(){_spinner=w,_spinner.stop()},D=function(){this.$(".btn-ask-to-sign").attr("id","btn-ask-to-sign"),t(".btn-ask-to-sign .ui-btn-text").text("Allow User To Sign"),t(".btn-ask-to-sign").css("text-align","center"),A(),t("#signature").removeClass("ui-disabled")},x=function(t){return 1!==t?void b.RemoveScreenOverLay():void b.AddCashPayment()},V=function(t){1===t&&b.ChangeGiftAmountToUse()},O=!1;return N});