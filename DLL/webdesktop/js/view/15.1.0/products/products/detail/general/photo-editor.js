define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","text!template/15.1.0/products/products/detail/general/photo-editor.tpl.html"],function(t,e,a,o,i,n,s){var r={OSrcW:0,OSrcH:0,ZoomFactor:1,X:0,Y:0,StageH:0,StageW:0},l=o.View.extend({_photoEditorTemplate:a.template(s),initialize:function(){this.$el.show(),this.ImageB64=null},render:function(){return this},Show:function(){this.LoadPhotoEditor(),i.isBrowserMode||(t("#global-modal #zoom").css("display","none"),t("#global-modal #zoom-out").css("display","none"))},Close:function(){this.tmpImage=null,t("#global-modal").fadeOut()},InitializeChildViews:function(){},GetResultImage:function(){var e;this.tmpImage=null,this.tmpImage=new Image,e=this.tmpImage;var a=this;e.onload=function(){var o=parseFloat(r.X/r.ZoomFactor),i=parseFloat(r.Y/r.ZoomFactor),s=r.OSrcW,l=r.OSrcH,g=250,h=250,m=0,c=0,d=parseFloat(r.StageW/r.ZoomFactor),u=parseFloat(r.StageH/r.ZoomFactor);s=d,l=u,o=o>0?0:Math.abs(o),i=i>0?0:Math.abs(i);var v=document.createElement("canvas"),f=v.getContext("2d");v.height=h,v.width=g,o+s>this.width&&(s=this.width-o),i+l>this.height&&(l=this.height-i),f.drawImage(e,o,i,s,l,m,c,g,h);var p=v.toDataURL();a.ImageB64=n.Products.Base64Only(p),t("#item-image").html("<img />"),t("#item-image img").attr("src",p).css("display","block"),t("#item-image img").css("height","100%"),t("#item-image img").css("width","100%"),v=null,f=null,p=null,a.trigger("done",this)},e.src="data:image/png;base64,"+this.ImageB64,this.Close()},Rotate:function(t){if(!this.PreventRotate){this.PreventRotate=!0,n.Products.Overlay.Show();var e,a=this;this.tmpImage=null,this.tmpImage=new Image,e=this.tmpImage,e.src="data:image/png;base64,"+this.ImageB64,e.onerror=function(){navigator.notification.alert("An error was encountered when trying to load image.",null,"Loading Error","OK"),n.Products.Overlay.Hide(),a.PreventRotate=!1},e.onload=function(){var o,i,s=document.createElement("canvas"),l=s.getContext("2d"),g=90;s.height=r.OSrcW,s.width=r.OSrcH,t?(g=3*g,o=0,i=s.height):(o=s.width,i=0),l.translate(o,i),l.rotate(Math.PI/180*g),l.drawImage(e,0,0),l.restore();var h=s.toDataURL();a.ImageB64=n.Products.Base64Only(h),a.LoadPhotoEditor(!0),s=null,l=null,h=null}}},Zoom:function(t){var e=this,a=function(){e.DoZoom(t,10)};a(),clearInterval(this.zoomTimeOut),this.zoomTimeOut=setInterval(a,100)},DoZoom:function(e,a){var o=!0,i=t("#imgCanvas").height();t("#imgCanvas").width()<t("#imgCanvas").height()&&(i=t("#imgCanvas").width(),o=!1),a||(a=5),e?i-=a:i+=a,o?(i<r.StageH&&(i=r.StageH),r.ZoomFactor=parseFloat(i/r.OSrcH),t("#imgCanvas").css("height",i),t("#imgCanvas").css("width","auto")):(i<r.StageW&&(i=r.StageW),r.ZoomFactor=parseFloat(i/r.OSrcW),t("#imgCanvas").css("height","auto"),t("#imgCanvas").css("width",i)),this.ResetPosition(),this.DrawCropPosition(!0)},ResetPosition:function(){var e={h:t("#stage").height(),w:t("#stage").width()},a={h:t("#imgCanvas").height(),w:t("#imgCanvas").width()},o={x:t("#stage").offset().left,y:t("#stage").offset().top},i={x:t("#imgCanvas").offset().left,y:t("#imgCanvas").offset().top};i.x>o.x&&t("#imgCanvas").offset({left:o.x+1}),i.y>o.y&&t("#imgCanvas").offset({top:o.y+1}),o={x:t("#stage").offset().left,y:t("#stage").offset().top},i={x:t("#imgCanvas").offset().left,y:t("#imgCanvas").offset().top},i.x+a.w<o.x+e.w&&t("#imgCanvas").offset({left:o.x+e.w+1-a.w}),i.y+a.h<o.y+e.h&&t("#imgCanvas").offset({top:o.y+e.h+1-a.h}),r.X=t("#imgCanvas").position().left,r.Y=t("#imgCanvas").position().top},DrawCropPosition:function(e){var a="",o="",i={h:t("#imgCanvas").height(),w:t("#imgCanvas").width()},n=0,s=1;e||(i.w>i.h?(s=200/i.w,n=s*i.h,o='height="'+n+'px" width="200px"  style="margin-top:'+(200-n)/2+'px;background: white;"'):(s=200/i.h,n=s*i.w,o='width="'+n+'px" height="200px"  style="margin-top:0px;background: white;"'),a='<center><canvas id="crop-map" '+o+"></canvas></center>",t("#crop-location").html(a));var l=t("#crop-map"),g=document.getElementById("crop-map").getContext("2d");g.clearRect(0,0,l.width(),l.height()),g.drawImage(document.getElementById("imgCanvas"),0,0,l.width(),l.height()),g.strokeStyle="#f00",g.lineWidth=2;var h=Math.abs(r.X*(l.width()/i.w)),m=Math.abs(r.Y*(l.height()/i.h)),c=l.width()/i.w*r.StageW,d=l.height()/i.h*r.StageH;g.strokeRect(h,m,c,d),g=null},LoadPhotoEditor:function(e){r={OSrcW:0,OSrcH:0,ZoomFactor:1,X:0,Y:0,StageH:0,StageW:0};var a=this;e||(t("#global-modal").css("display","block"),t("#global-modal").html(""),t("#global-modal").html(this._photoEditorTemplate()),t("#global-modal #close").on("tap",function(t){t.preventDefault(),a.Close()}),t("#global-modal #done").on("tap",function(t){t.preventDefault(),a.GetResultImage()}),t("#global-modal #rotate").on("tap",function(t){t.preventDefault(),a.Rotate()}),t("#global-modal #rotate-left").on("tap",function(t){t.preventDefault(),a.Rotate(!0)}),t("#global-modal #zoom").on("mousedown",function(t){a.Zoom()}),t("#global-modal #zoom-out").on("mousedown",function(t){a.Zoom(!0)}),t("#global-modal #zoom").on("mouseup",function(t){clearInterval(a.zoomTimeOut)}),t("#global-modal #zoom-out").on("mouseup",function(t){clearInterval(a.zoomTimeOut)}),t("#global-modal #zoom").on("mouseleave",function(t){clearInterval(a.zoomTimeOut)}),t("#global-modal #zoom-out").on("mouseleave",function(t){clearInterval(a.zoomTimeOut)}));var o,s=document.getElementById("imgCanvas");document.getElementById("stage");if(this.tmpImage=null,this.tmpImage=new Image,o=this.tmpImage,r.StageH=t("#stage").height(),r.StageW=t("#stage").width(),o.src="data:image/png;base64,"+this.ImageB64,console.log("IMG-B64-LENGTH: "+this.ImageB64.length),o.onerror=function(){navigator.notification.alert("An error was encountered when trying to load image.",null,"Loading Error","OK"),n.Products.Overlay.Hide(),a.PreventRotate=!1,o=null},o.onload=function(){r.OSrcW=o.width,r.OSrcH=o.height,console.log(r.OSrcH+"x"+r.OSrcW),r.ZoomFactor=1,t("#imgCanvas").height(o.height),t("#imgCanvas").width(o.width),t("#imgCanvas").css("top","0"),t("#imgCanvas").css("left","0"),t("#imgCanvas").height()<t("#imgCanvas").width()?(r.ZoomFactor=parseFloat(t("#stage").height()/t("#imgCanvas").height()),t("#imgCanvas").height(t("#stage").height()),t("#imgCanvas").width(parseFloat(t("#stage").height()/o.height)*o.width)):(r.ZoomFactor=parseFloat(t("#stage").width()/t("#imgCanvas").width()),t("#imgCanvas").width(t("#stage").width()),t("#imgCanvas").height(parseFloat(t("#stage").width()/o.width)*o.height)),s.onload=function(){console.log("image ready to be rendered for crop positioning..."),a.DrawCropPosition()},t("#imgCanvas").attr("src",o.src),console.log("image loaded"),n.Products.Overlay.Hide(),a.PreventRotate=!1,o=null},!e){var l=null,g={x1:0,y1:0,t1:"",x2:0,y2:0,t2:""},h=function(t){if(t.preventDefault(),!l){var e,a;e=i.isBrowserMode?t:t.originalEvent.touches[0],l={x:e.clientX-s.offsetLeft,y:e.clientY-s.offsetTop}}i.isBrowserMode&&v(),t.originalEvent&&t.originalEvent.touches&&t.originalEvent.touches.length>1&&(e=t.originalEvent.touches[0],a=t.originalEvent.touches[1],g={x1:e.clientX,y1:e.clientY,t1:e.identifier,x2:a.clientX,y2:a.clientY,t2:a.identifier})},m=function(t){if(t.preventDefault(),l){var e,a;if(e=i.isBrowserMode?t:t.originalEvent.touches[0],g&&t.originalEvent&&t.originalEvent.changedTouches&&t.originalEvent.changedTouches.length>1){for(var o=0;o<t.originalEvent.changedTouches.length;o++){var n=t.originalEvent.changedTouches[o].identifier;n==g.t1&&(e=t.originalEvent.changedTouches[o]),n==g.t2&&(a=t.originalEvent.changedTouches[o])}if(e&&a)return void u(e,a)}d(e)}},c=function(t){if(t.preventDefault(),l){var e;e=i.isBrowserMode?t:t.originalEvent.touches[0]||t.originalEvent.changedTouches[0],l=null}i.isBrowserMode&&v(!0),a.DrawCropPosition(!0)},d=function(t,e){t.clientX-l.x,t.clientY-l.y;s.style.left=t.clientX-l.x+"px",r.X=t.clientX-l.x,s.style.top=t.clientY-l.y+"px",r.Y=t.clientY-l.y,a.ResetPosition(),a.DrawCropPosition(!0)},u=function(e,o){var i,n,s,r,l={x1:e.clientX,y1:e.clientY,t1:e.identifier,x2:o.clientX,y2:o.clientY,t2:o.identifier},h=Math.abs(l.x1-l.x2),m=Math.abs(l.y1-l.y2),c=Math.abs(g.x1-g.x2),d=Math.abs(g.y1-g.y2),u=h-c,v=m-d,f=!1;if(i=t("#imgCanvas").width(),n=t("#imgCanvas").height(),s=t("#imgCanvas").width(),r=t("#imgCanvas").height(),0!=u||0!=uxy){Math.abs(u)>=Math.abs(v)&&(f=!0);var p=u+v;a.DoZoom(!1,p),g=l}},v=function(e){e?t("#stage").css("border","1px solid gray"):t("#stage").css("border","1px solid orange")};t("#imgCanvas").on("touchstart",h),t("#imgCanvas").on("touchmove",m),t("#imgCanvas").on("touchend",c),t("#imgCanvas").on("mousedown",h),t("#imgCanvas").on("mousemove",m),t("#imgCanvas").on("mouseup",c);var f=function(){t("#imgCanvas").trigger("mouseup")};i.isBrowserMode&&t("#imgCanvas").on("mouseleave",f)}}});return l});