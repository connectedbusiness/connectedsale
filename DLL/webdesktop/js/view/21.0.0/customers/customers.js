define(["jquery","mobile","underscore","backbone","view/21.0.0/customers/customers/customer-form","view/21.0.0/customers/typepopup/typepopup","text!template/21.0.0/customers/customers.tpl.html","text!template/21.0.0/customers/customers-header.tpl.html"],function(e,t,o,i,r,s,n,a){var m,u,c={Customers:"Customers"},h={Body:".customers-page .body",Header:".customers-page .header"},d=function(e){if(1===e){if(!u)return void(window.location.hash="dashboard");m.LoadForm(u)}},l=i.View.extend({_customers:o.template(n),_header:o.template(a),events:{"tap .customers-page .header .menu .customers":"Customers_tapped","tap .customers-page .header #back":"Back_tapped","tap #title a":"CustomerName_tapped"},Back_tapped:function(e){e.preventDefault(),this.ChangeFormWithValidation()},Customers_tapped:function(e){e.preventDefault(),this.ChangeFormWithValidation(c.Customers)},CustomerName_tapped:function(e){e.preventDefault(),this.BackToGeneralView()},initialize:function(){m=this,navigator.__proto__.escapedhtml=function(e){var t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;"};return String(e).replace(/[&<>"'\/]/g,function(e){return t[e]})}},InitializeChildViews:function(){this.CurrentForm=c.Customers,this.$(h.Header).html(this._header()),this.LoadForm(c.Customers),navigator.notification.overrideAlert(!0)},LoadForm:function(e){this.SetHeaderTitle(e),this.CurrentForm=e,this.InitializeCustomersView(),this.customersFormView.Show(),this.customersFormView.InitializeChildViews()},ChangeFormWithValidation:function(e){u=e,this.CurrentForm!=e&&this.CurrentForm==c.Customers&&this.CheckFormMode(this.customersFormView)},CheckFormMode:function(e){return e&&e.HasChanges&&e.HasChanges()?void(e.UnloadConfirmationMessage?navigator.notification.confirm(e.UnloadConfirmationMessage,d,"Confirmation",["Yes","No"]):navigator.notification.confirm("Do you want to cancel changes?",d,"Confirmation",["Yes","No"])):void d(1)},SetHeaderTitle:function(t){e(".header-content #title").html(t)},BackToGeneralView:function(){console.log("BackToGeneralView"),this.customersFormView.IsNew?navigator.notification.confirm("Do you want to cancel changes?",this.ProceedToGeneralView,"Confirmation",["Yes","No"]):this.customersFormView.ProceedToGeneralView()},ProceedToGeneralView:function(e){1===e&&m.customersFormView.ProceedToGeneralView()},InitializeCustomersView:function(){this.customersFormView||(this.customersFormView=new r({el:e(h.Body)}),this.customersFormView.on("tabChanged",this.SetHeaderTitle,this))},render:function(){return this.$el.html(this._customers),this}});return l});