define(["jquery","mobile","underscore","backbone","shared/global","shared/method","shared/service","shared/shared","collection/preferences","view/15.1.0/products/category/categories","view/15.1.0/products/products/products-form","view/15.1.0/products/openingbalance/openingbalance-form","view/15.1.0/products/unitmeasure/unitmeasure","view/15.1.0/products/iwanto/iwanto","view/15.1.0/products/departments/departments","view/15.1.0/products/location/locations","view/15.1.0/products/receivestocks/stocks","view/15.1.0/products/receivestocks/stocks","text!template/15.1.0/products/products.tpl.html","text!template/15.1.0/products/products-header.tpl.html","js/libs/format.min.js"],function(e,t,n,o,s,r,a,c,h,u,d,l,m,p,w,C,f,k,g,v){var V,I,S={Products:"Products",AdjustStock:"AdjustStock",OpeningBalance:"Opening Balance",Locations:"Locations",Categories:"Categories",Departments:"Departments",UOM:"Unit of Measure",ReceiveStocks:"Receive Stock",AdjustmentStocks:"Adjust Stock"},F={Body:".products-page .body",Header:".products-page .header"},b=function(e){if(1===e){if(!I)return void(window.location.hash="dashboard");V.CurrentForm!=I&&V.LoadForm(I)}},O=o.View.extend({_products:n.template(g),_header:n.template(v),events:{"tap .products-page .header .menu #products":"btnClick_Products","tap .products-page .header #back":"btnClick_Back","tap #iwantto ":"ShowIwantoOptions","tap #viewCategories":"btnClick_Categories","tap #viewDepartments":"btnClick_Departments","tap #viewUOM":"btnClick_UOM","tap #receivestock":"btnClick_ReceiveStocks","tap #viewLocation":"btnClick_Locations","tap #viewOpeningBalance":"btnClick_OpeningBalance","tap #adjuststock":"btnClick_AdjustmentStock"},btnClick_Back:function(e){e.preventDefault(),this.ChangeFormWithValidation()},btnClick_Products:function(e){e.preventDefault(),this.ChangeFormWithValidation(S.Products)},btnClick_Categories:function(e){e.preventDefault(),this.ChangeFormWithValidation(S.Categories)},btnClick_Departments:function(e){e.preventDefault(),this.ChangeFormWithValidation(S.Departments)},btnClick_UOM:function(e){e.preventDefault(),this.ChangeFormWithValidation(S.UOM)},btnClick_Locations:function(e){e.preventDefault(),this.ChangeFormWithValidation(S.Locations)},btnClick_ReceiveStocks:function(e){e.preventDefault(),this.ChangeFormWithValidation(S.ReceiveStocks)},btnClick_OpeningBalance:function(e){e.preventDefault(),this.ChangeFormWithValidation(S.OpeningBalance)},btnClick_AdjustmentStock:function(e){e.preventDefault(),this.ChangeFormWithValidation(S.AdjustmentStocks)},initialize:function(){V=this,navigator.__proto__.escapedhtml=function(e){var t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};return String(e).replace(/[&<>"'\/]/g,function(e){return t[e]})}},render:function(){return this.$el.html(this._products),this},InitializeChildViews:function(){this.CurrentForm=S.Products,this.$(F.Header).html(this._header()),this.LoadForm(S.Products),this.InitializeIwantoPopOver(),this.InitializePreference(),navigator.notification.overrideAlert(!0)},InitializeIwantoPopOver:function(){var t=this;e(document).on("tap",function(i){var n=e(i.target);n.hasClass("touchpop")===!1&&t.outsideMenuHandler()})},outsideMenuHandler:function(){e("#iwantoViewContainer").hide()},ShowIwantoOptions:function(){this.iwantoView||(this.iwantoView=new p({el:e("#iwantoViewContainer")}),this.iwantoView.InitializeChildViews()),e("#iwantoViewContainer").show()},LoadForm:function(e){switch(s.FormHasChanges=!1,this.SetHeaderTitle(e),this.CurrentForm=e,e){case S.Products:this.InitializeProducts(),this.productsFormView.Show(),this.productsFormView.InitializeChildViews();break;case S.Categories:this.InitializeCategories(),this.categoriesView.Show(),this.outsideMenuHandler();break;case S.Departments:this.InitializeDepartments(),this.departmentsView.Show();break;case S.UOM:this.InitializeUOM(),this.unitMeasureView.Show();break;case S.Locations:this.InitializeLocations(),this.locationsView.Show();break;case S.ReceiveStocks:this.InitializeReceiveStocks(),this.receiveStocksView.Show("In");break;case S.OpeningBalance:this.InitializeOpeningBalance(),this.openingBalanceFormView.Show(),this.openingBalanceFormView.InitializeChildViews();break;case S.AdjustmentStocks:this.InitializeStockAdjustment(),this.stockAdjustmentView.Show("Out")}},ChangeFormWithValidation:function(e){I=e,this.CurrentForm!=e&&(this.CurrentForm==S.Products&&this.CheckFormMode(this.productsFormView),this.CurrentForm==S.Categories&&this.CheckFormMode(this.categoriesView),this.CurrentForm==S.Departments&&this.CheckFormMode(this.departmentsView),this.CurrentForm==S.UOM&&this.CheckFormMode(this.unitMeasureView),this.CurrentForm==S.Locations&&this.CheckFormMode(this.locationsView),this.CurrentForm==S.ReceiveStocks&&this.CheckFormMode(this.receiveStocksView),this.CurrentForm==S.OpeningBalance&&this.CheckFormMode(this.openingBalanceFormView),this.CurrentForm==S.AdjustmentStocks&&this.CheckFormMode(this.stockAdjustmentView))},CheckFormMode:function(e){return e&&e.HasChanges&&e.HasChanges()?void(e.UnloadConfirmationMessage?navigator.notification.confirm(e.UnloadConfirmationMessage,b,"Confirmation",["Yes","No"]):navigator.notification.confirm("Do you want to cancel changes?",b,"Confirmation",["Yes","No"])):void b(1)},IsUserAdmin:function(){if(!s.UserRole)return!0;if(0==s.UserRole.length)return!0;for(i in s.UserRole)if(s.UserRole[i].RoleCode==s.UserInfo.RoleCode)return!0;return!1},SetHeaderTitle:function(t){e(".header-content #title").html(t)},InitializeCategories:function(){this.IsNullOrWhiteSpace(this.categoriesView)||this.categoriesView.unbind(),this.categoriesView=new u({el:e(F.Body),IsReadOnly:!this.IsUserAdmin()})},InitializeDepartments:function(){this.IsNullOrWhiteSpace(this.departmentsView)||this.departmentsView.unbind(),this.departmentsView=new w({el:e(F.Body),IsReadOnly:!this.IsUserAdmin()})},InitializeProducts:function(){this.productsFormView=new d({el:e(F.Body),IsReadOnly:!this.IsUserAdmin()})},InitializeUOM:function(){this.unitMeasureView=new m({el:e(F.Body),IsReadOnly:!this.IsUserAdmin()})},InitializeLocations:function(){this.locationsView=new C({el:e(F.Body),IsReadOnly:!this.IsUserAdmin()})},InitializeReceiveStocks:function(){this.receiveStocksView&&(this.receiveStocksView.unbind(),this.receiveStocksView=null),this.receiveStocksView=new f({el:e(F.Body),IsReadOnly:!this.IsUserAdmin()})},InitializeStockAdjustment:function(){this.stockAdjustmentView&&(this.stockAdjustmentView.unbind(),this.stockAdjustmentView=null),this.stockAdjustmentView=new k({el:e(F.Body),IsReadOnly:!this.IsUserAdmin()})},InitializeOpeningBalance:function(){this.openingBalanceFormView=new l({el:e(F.Body),IsReadOnly:!this.IsUserAdmin()})},SetSelectedModel:function(e){},IsNullOrWhiteSpace:function(e){return!e||(""===e||null===e||void 0===e)},InitializePreference:function(){var e=this;this.preferenceCollection=new h,this.preferenceCollection.url=s.ServiceUrl+a.POS+r.GETPREFERENCEBYWORKSTATION+s.POSWorkstationID,this.preferenceCollection.fetch({success:function(t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.ResetCustomerPreference(i.CustomerPreference)},error:function(e,t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error"),c.Products.RequestTimeOut()}})},ResetCustomerPreference:function(e){s.CustomerPreference=e}});return O});