define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","shared/enum","text!template/20.0.0/pos/notes/notescontrol.tpl.html","text!template/20.0.0/pos/notes/salesordernotes.tpl.html","text!template/20.0.0/pos/notes/lineitemnotes.tpl.html","text!template/20.0.0/pos/notes/customernotes/customernotes.tpl.html"],function(e,t,o,s,a,r,i,n,l,d,m){var c=s.View.extend({_mainControlTemplate:o.template(n),_orderNotesTemplate:o.template(l),_lineItemNoteTemplate:o.template(d),_customerNoteTemplate:o.template(m),events:{"tap #done-ordernotes":"closeOrderNotes_tap","tap #save-ordernotes":"saveOrderNotes_tap","tap #cancel-ordernotes":"clearOrderNotes_tap"},clearOrderNotes_tap:function(t){t.preventDefault(),e("#ordernotes-textarea").val("")},closeOrderNotes_tap:function(e){e.preventDefault(),this.CloseOrderNotes()},saveOrderNotes_tap:function(t){t.preventDefault();var o="",s=e("#ordernotes-textarea").val(),i=e("#ordernotes-input").val();switch(this.type){case a.NoteType.Customer:if(r.IsNullOrWhiteSpace(i)||r.IsNullOrWhiteSpace(s))return void navigator.notification.alert("Please fill up all required fields in order to complete the note.",null,"Missing Fields","OK");o={NoteText:s,Title:i,ContactCode:this.model.get("DefaultContact")||this.model.get("ContactCode"),EntityCode:this.model.get("CustomerCode")||this.model.get("EntityCode"),NoteCode:this.model.get("NoteCode")||""};break;case a.NoteType.LineItem:if(r.IsNullOrWhiteSpace(s))return void navigator.notification.alert("Please fill up all required fields in order to complete the note.",null,"Missing Fields","OK");o=s;break;default:o=s}this.ProcessSavingOfOrderNotes(this.type,o)},initialize:function(){this.type=this.options.type,this.note=this.options.note,this.maintenance=this.options.maintenanceType,this.render(),this.ToggleButtons(),this.ToggleOverlay()},render:function(){this.ProcessRenderNoteType(this.type,this.maintenance)},CloseOrderNotes:function(){this.remove(),this.unbind(),this.ToggleOverlay(!0)},ProcessRenderNoteType:function(e,t){var o="To be generated",s="";switch(t){case a.MaintenanceType.CREATE:s="Add";break;case a.MaintenanceType.UPDATE:s="Edit"}if(this.model)switch(e){case a.NoteType.Customer:o=this.customerName=this.model.get("CustomerName");break;case a.NoteType.LineItem:o=this.itemName=this.model.get("ItemName");break;case a.NoteType.OrderNotes:this.model.get("SalesOrderCode")&&(o=this.model.get("SalesOrderCode"))}this.RenderNoteType(e,o,s)},ProcessSavingOfOrderNotes:function(e,t){switch(e){case a.NoteType.Customer:this.trigger("customerNotesSaved",t,this.maintenance,this.model,this);break;default:this.trigger("orderNotesSaved",t,e,this.model,this)}},RenderNoteType:function(e,t,o){switch(this.$el.html(this._mainControlTemplate({FormHeader:o})),e){case a.NoteType.Customer:this.$("#ordernotes-inner").html(this._customerNoteTemplate({CustomerName:t,Title:this.model.get("Title"),NoteText:this.model.get("NoteText"),FormHeader:o,TransactionType:a.TransactionType}));break;case a.NoteType.LineItem:this.$("#ordernotes-inner").html(this._lineItemNoteTemplate({ItemName:t,Note:this.model.get("ItemDescription"),FormHeader:o,TransactionType:a.TransactionType}));break;case a.NoteType.OrderNotes:if(this.model)if(""!=this.note.PublicNotes)var s=this.note.PublicNotes;else var s=this.model.get("PublicNotes");else if(""!=this.note.PublicNotes)var s=this.note.PublicNotes;else var s="";this.$("#ordernotes-inner").html(this._orderNotesTemplate({InvoiceCode:t,Note:s,FormHeader:o,TransactionType:a.TransactionType}))}this.$el.trigger("create"),this.$("#ordernotes-input").attr("maxLength","100")},ShowHideBlockOverlay:function(e){r.ShowHideBlockOverlay(e)},ToggleButtons:function(){switch(a.TransactionType){case i.TransactionType.SalesPayment:e("#ordernotes-textarea").attr("readonly","readonly"),e("#save-ordernotes").addClass("ui-disabled"),e("#cancel-ordernotes").addClass("ui-disabled")}},ToggleOverlay:function(t){var o={OrderNotes:"#ordernotes",ItemDetail:"#itemDetail",NoteList:"#noteList",MainOverlay:"#main-transaction-blockoverlay"};switch(this.type){case a.NoteType.Customer:e(o.NoteList).is(":visible")?t?(e(o.OrderNotes).removeClass("z3000"),e(o.MainOverlay).removeClass("z2990")):(e(o.OrderNotes).addClass("z3000"),e(o.MainOverlay).addClass("z2990"),e(o.MainOverlay).show()):t&&e(o.MainOverlay).hide();break;case a.NoteType.LineItem:e(o.ItemDetail).is(":visible")?t?(e(o.OrderNotes).removeClass("z3000"),e(o.MainOverlay).removeClass("z2990")):(e(o.OrderNotes).addClass("z3000"),e(o.MainOverlay).addClass("z2990"),e(o.MainOverlay).show()):t&&e(o.MainOverlay).hide();break;case a.NoteType.OrderNotes:t?e(o.MainOverlay).hide():e(o.MainOverlay).show()}}});return c});