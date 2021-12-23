define(["jquery","mobile","underscore","shared/global","backbone","text!template/20.1.0/pos/signature/signature.tpl.html","view/spinner","js/libs/jSignature.min.js"],function(t,i,e,n,s,a,r){var h=s.View.extend({_template:e.template(a),events:{"tap .btn-Cancel":"btnCancel_tap","tap .btn-Done":"btnDone_tap","tap .btn-clear-signature":"btnClear_tap","tap #btn-ask-to-sign":"btn_AskToSign","tap #btn-stop-asking":"btnCancel_Retrieval"},initialize:function(){o=!1,this.render()},render:function(){console.log("render sig"),this.$el.html(""),this.$el.html(this._template),this.$("#signature").jSignature({height:"120px",width:"480px"}),this.$("#signature").bind("change",this.SignatureChanged),this.$("#signatureBody").trigger("create"),t("#main-transaction-blockoverlay").show()},SignatureChanged:function(t){o=!0},Close:function(){this.sketchView=!1,this.Hide()},Show:function(i){switch(null!=i){case!0:this.ViewOnly=!0,this.LoadSignature(i);break;case!1:this.ViewOnly=!1,o=!1}this.ToggleDisplay(),n.OnRechargeProcess&&this.$(".btn-Cancel").hide(),this.$el.show(),t("#main-transaction-blockoverlay").show()},ToggleDisplay:function(){if("POS"==this.viewType){switch(this.ViewOnly){case!0:this.$(".signatureDisplay").show(),this.$(".btn-Cancel").show(),this.$(".btn-clear-signature").show(),this.$(".btn-ask-to-sign").show(),this.$("#signature").hide();break;case!1:this.$(".signatureDisplay").hide(),this.$(".btn-Cancel").show(),this.$(".btn-clear-signature").show(),this.$(".btn-ask-to-sign").show(),this.$("#signature").show()}this.ReadOnly&&(this.$(".btn-clear-signature").hide(),this.$(".btn-ask-to-sign").hide())}else this.$(".signatureDisplay").hide(),this.$(".btn-ask-to-sign").hide(),this.$(".btn-clear-signature").removeClass("left-btn"),this.$(".btn-clear-signature").show(),"SecondaryDisplay"==this.viewType?this.$(".btn-Cancel").hide():this.$(".btn-Cancel").show()},SketchSignature:function(t){o=!0,this.ViewOnly=!0,this.render(),this.ToggleDisplay(),this.LoadSignature(t),this.sketchView=!0},Hide:function(){this.ResetSignature(),this.$el.hide(),this.trigger("formClosed",this)},ResetSignature:function(){this.$("#signature").jSignature("reset"),o=!1},GetSignature:function(){if(!this.sketchView){var t=this.$("#signature").jSignature("getData","svgbase64");return t?(n.Signature=t[1],t[1]):(n.Signature=null,null)}},LoadSignature:function(i){if(null!=i){var e=new Image;e.src="data:image/svg+xml;base64,"+i,this.$(".signatureDisplay").html(t(e))}},ValidateSignature:function(){return o!==!1||(console.log("A signature from the customer is required."),navigator.notification.alert("A signature from the customer is required.",null,"Signature is Required","OK"),!1)},btnClear_tap:function(t){t.preventDefault(),this.sketchView?(this.ToggleDisplay(),this.trigger("deleteSavedSignature",n.Signature,this)):this.ResetSignature(),this.sketchView=!1},btn_AskToSign:function(t){t.preventDefault(),console.log("btn_AskToSign"),this.$(".btn-ask-to-sign").attr("id","btn-stop-asking"),l(),this.trigger("allowUserToAttachSign",this)},btnCancel_Retrieval:function(t){t.preventDefault(),this.$(".btn-ask-to-sign").attr("id","btn-ask-to-sign"),u(),this.trigger("cancelSignRetrieval",this)},btnCancel_tap:function(i){i.preventDefault(),this.IsWaiting()||(this.trigger("deleteSavedSignature",n.Signature,this),this.ResetSignature(),this.trigger("CancelSignature"),this.Close(),t("#main-transaction-blockoverlay").hide())},btnDone_tap:function(i){if(i.preventDefault(),!this.IsWaiting()){switch(this.ViewOnly){case!0:this.Close(),t("#main-transaction-blockoverlay").hide();break;case!1:this.ValidateSignature()&&(this.GetSignature(),this.trigger("SignatureAdded",this),this.Close())}this.sketchView=!1}},IsWaiting:function(){var t=this.$("#signature").hasClass("ui-disabled");return t&&navigator.notification.alert("Waiting for customer's signature",null,"Invalid Action","OK"),t}}),o=!1,l=function(){var i=document.getElementById("btn-stop-asking");_spinner=r,_spinner.opts.left=10,_spinner.opts.radius=3,_spinner.opts.lines=9,_spinner.opts.length=4,_spinner.opts.width=3,_spinner.opts.color="#000",_spinner.spin(i,"Cancel"),t("#btn-stop-asking .ui-btn-text").text("Cancel"),t("#signature").addClass("ui-disabled")},g=function(){_spinner=r,_spinner.stop()},u=function(){t(".btn-ask-to-sign .ui-btn-text").text("Allow User To Sign"),t(".btn-ask-to-sign").css("text-align","center"),g(),t("#signature").removeClass("ui-disabled")};return h});