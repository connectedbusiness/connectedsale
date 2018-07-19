define(["jquery","mobile","underscore","backbone","shared/global","view/19.0.0/settings/general/workstation/workstations","view/19.0.0/settings/general/customer/customers","view/19.0.0/settings/general/location/locations","view/19.0.0/settings/general/posshippingmethod/posshippingmethods","view/19.0.0/settings/general/pos/pos","view/19.0.0/settings/general/gateway/gateways","view/19.0.0/settings/general/paymenttype/paymenttypes","view/19.0.0/settings/general/website/websitelist","view/19.0.0/settings/general/imagesize/imagesize","view/19.0.0/settings/general/email/email","view/19.0.0/settings/manager/administrators","view/19.0.0/settings/manager/userroles","view/19.0.0/settings/receipt/typelist/receipttypelist","view/19.0.0/settings/receipt/print/printsetting","view/19.0.0/settings/receipt/print/printerlist","view/19.0.0/settings/user/usermaintenance/maintainuser","view/19.0.0/settings/user/usermaintenance/adduser","view/19.0.0/settings/dejavoo/protocol/protocol","text!template/19.0.0/settings/modal/modal.tpl.html"],function(e,t,i,n,s,o,l,a,r,c,d,m,h,p,g,u,w,y,f,I,P,S,z,b){var L=n.View.extend({_template:i.template(b),events:{"tap #back-general":"btnback_click"},initialize:function(e,t){this.render()},render:function(){return e("#settings-blockoverlay").show(),this.$el.html(this._template()),this.initializeModalContent(),this},initializeModalContent:function(){switch(this.options.preferencetype){case"Workstation":this.InitializeWorkstationDisplay(this.collection);break;case"Location":this.InitializeLocationDisplay(this.collection);break;case"ShippingMethod":this.InitializeShippingMethodDisplay(this.collection);break;case"Customer":this.InitializeCustomerDisplay(this.collection);break;case"POS":this.InitializePOSDisplay(this.model);break;case"Gateway":this.InitializeGatewayDisplay(this.collection);break;case"PaymentType":this.InitializePaymentTypeDisplay(this.collection);break;case"Website":this.InitializeWebsiteDisplay(this.collection);break;case"ImageSize":this.InitializeImageSizeTypeDisplay(this.model);break;case"Email":this.InitializeEmailDisplay(this.model);break;case"Admin":this.InitializeAdministratorList(this.collection);break;case"UserRole":this.InitializeUserroleList(this.collection);break;case"Receipt":this.InitializeReceiptList(this.collection);break;case"UserMaintenance":this.InitializeUserMaintenanceList(this.model);break;case"UserAdd":this.InitializeUserAddView(this.model);break;case"Printer":this.InitializePrinterSettings(this.model);break;case"DejavooConnectionProtocol":this.InitializeDejavooConnectionProtocol(this.model);break;case"DefaultPrinter":this.InitializePrinterList(this.collection)}},btnback_click:function(e){e.preventDefault(),this.close()},InitializeLocationDisplay:function(t){_selectedLocation=this.options.selectedLocation,this.locationPreference=new a({el:e("#settings-modal-content"),collection:t}),_selectedLocation||(_selectedLocation=null),this.locationPreference.SetSelected(_selectedLocation),document.getElementById("settings-modal-title").innerHTML="Location"},InitializeShippingMethodDisplay:function(t){_selectedShippingMethod=this.options.selectedShippingMethod,this.shippingMethodPreference=new r({el:e("#settings-modal-content"),collection:t}),_selectedShippingMethod||(_selectedShippingMethod=null),this.shippingMethodPreference.SetSelected(_selectedShippingMethod),document.getElementById("settings-modal-title").innerHTML="Shipping Method"},InitializeWorkstationDisplay:function(t){t.sort(),_selectedWorkstation=this.options.selectedWorkstation,this.workstationsPreference=new o({el:e("#settings-modal-content"),collection:t}),_selectedWorkstation||(_selectedWorkstation=null),this.workstationsPreference.SetSelected(_selectedWorkstation),document.getElementById("settings-modal-title").innerHTML="Workstation"},InitializeCustomerDisplay:function(t){_selectedCustomer=this.options.selectedCustomer,this.customerPreference=new l({el:e("#settings-modal-content"),collection:t}),_selectedCustomer||(_selectedCustomer=null),this.customerPreference.SetSelected(_selectedCustomer),document.getElementById("settings-modal-title").innerHTML="Customer"},InitializePOSDisplay:function(t){s.Preference.DefaultPOSTransaction=t.get("DefaultPOSTransaction"),this.posPreference=new c({el:e("#settings-modal-content"),model:t}),this.posPreference.general=this.options.general,document.getElementById("settings-modal-title").innerHTML="Transaction"},InitializeGatewayDisplay:function(t){_selectedGateway=this.options.selectedGateway,this.gatewayPreference=new d({el:e("#settings-modal-content"),collection:t}),_selectedGateway||(_selectedGateway=null),this.gatewayPreference.SetSelected(_selectedGateway),document.getElementById("settings-modal-title").innerHTML="Merchant"},InitializePaymentTypeDisplay:function(t){_selectedPaymentType=this.options.selectedPaymentType,this.paymentTypePreference=new m({el:e("#settings-modal-content"),collection:t}),_selectedPaymentType||(_selectedPaymentType=null),this.paymentTypePreference.SetSelected(_selectedPaymentType),document.getElementById("settings-modal-title").innerHTML="Payment Type"},InitializeWebsiteDisplay:function(t){_selectedWebsite=this.options.selectedWebsite,this.websitePreference=new h({el:e("#settings-modal-content"),collection:t}),_selectedWebsite||(_selectedWebsite=null),this.websitePreference.SetSelected(_selectedWebsite),document.getElementById("settings-modal-title").innerHTML="Website"},InitializeImageSizeTypeDisplay:function(t){this.imageSizePreference=new p({el:e("#settings-modal-content"),model:t}),this.imageSizePreference.general=this.options.general,document.getElementById("settings-modal-title").innerHTML="Image Size"},InitializeEmailDisplay:function(t){this.emailPreference=new g({el:e("#settings-modal-content"),model:t}),document.getElementById("settings-modal-title").innerHTML="Pickup Order Template"},InitializeAdministratorList:function(e){this.administratorsView||(this.administratorsView=new u),this.administratorsView.$el=this.$("#settings-modal-content"),this.administratorsView.SetSelectedAdministratorUserRoles(this.collection),this.administratorsView.SetPreferences(this.options.preferences),this.administratorsView.Show(),document.getElementById("settings-modal-title").innerHTML="Administrators"},InitializeUserroleList:function(){this.userRoleView||(this.userRoleView=new w({preferenceCollection:this.options.preferenceCollection,userRoleCollection:this.options.userRoleCollection})),this.userRoleView.$el=this.$("#settings-modal-content"),this.userRoleView.SetPreferences(this.options.preferences),this.userRoleView.SetType(this.options.userroletype),this.userRoleView.Show(),document.getElementById("settings-modal-title").innerHTML=this.options.userroletype},InitializeReceiptList:function(t){this.receiptListView=new y({el:e("#settings-modal-content"),collection:t}),this.receiptListView.SetSelected(this.options.selectedReport),document.getElementById("settings-modal-title").innerHTML=t.at(0).attributes.SubCategory},InitializeUserMaintenanceList:function(t){this.maintainUserView||(this.maintainUserView=new P({el:e("#settings-modal-content"),model:t}),this.maintainUserView.HasChanges=!1,this.maintainUserView.Show(),document.getElementById("settings-modal-title").innerHTML="Maintain User Account")},InitializeUserAddView:function(t){this.addUserView?this.addUserView.render():this.addUserView=new S({el:e("#settings-modal-content"),model:t}),document.getElementById("settings-modal-title").innerHTML="Add User Account"},InitializePrinterSettings:function(t){this.printSettings=new f({el:e("#settings-modal-content"),model:t}),document.getElementById("settings-modal-title").innerHTML="Printer Settings"},InitializeDejavooConnectionProtocol:function(t){s.Preference.DejavooConnectionProtocol=t.get("DejavooConnectionProtocol"),this.protocolView=new z({el:e("#settings-modal-content"),model:t}),this.protocolView.dejavoo=this.options.dejavoo,document.getElementById("settings-modal-title").innerHTML="Dejavoo Connection Protocol"},InitializePrinterList:function(t){this.printerListView=new I({el:e("#settings-modal-content"),collection:t}),this.printerListView.SetSelected(this.options.defaultPrinter)},close:function(){e("#settings-blockoverlay").hide(),this.$el.find("#settings-modal").remove(),this.trigger("ModalClose",this),this.undelegateEvents(),this.unbind()}});return L});