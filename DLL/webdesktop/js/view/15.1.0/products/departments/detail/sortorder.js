define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","model/department","collection/departments","view/15.1.0/products/departments/detail/sortorder/sortorderlist","text!template/15.1.0/products/departments/detail/sortorder.tpl.html"],function(e,t,i,r,a,n,l,o,s,d,p){var c=r.View.extend({_template:i.template(p),events:{},initialize:function(){this.render()},render:function(){this.$el.html(this._template),this.InitializeChildViews()},InitializeChildViews:function(){this.InitializeSortOrderView()},InitializeSortOrderView:function(){this.departmentLookUp=new o;var e=100,t=this;this.departmentLookUp.set({SortOrderCriteria:"ParentNode"}),this.departmentLookUp.url=a.ServiceUrl+n.PRODUCT+l.GETDEPARTMENTDETAILS+e,this.departmentLookUp.save(null,{success:function(e,i){t.DisplayParentNode(i.Departments),t.InitializeParentNode()}})},DisplayParentNode:function(t){this.departmentCollection=new s,this.departmentCollection.reset(t),this.departmentCollection.each(function(t){var i=t.get("ParentDepartment");i=i.replace(/[^a-z0-9\s]/gi,"").replace(/[_\s]/g,"-"),t.set({ParentID:i});new d({el:e("#sortOrderList"),model:t})})},InitializeParentNode:function(){this.departmentLookUp=new o;var e=100,t=this;this.departmentLookUp.set({SortOrderCriteria:"ChildNode"}),this.departmentLookUp.url=a.ServiceUrl+n.PRODUCT+l.GETDEPARTMENTDETAILS+e,this.departmentLookUp.save(null,{success:function(e,i){t.DisplayChildNode(i.Departments)}})},DisplayChildNode:function(t){this.parentDepartmentItemCollection=new s,this.parentDepartmentItemCollection.reset(t);this.parentDepartmentItemCollection.each(function(t){var i=t.get("ParentDepartment");i=i.replace(/[^a-z0-9\s]/gi,"").replace(/[_\s]/g,"-");var r=t.get("DepartmentCode").replace(/[^a-z0-9\s]/gi,"").replace(/[_\s]/g,"-");t.set({ParentID:i,ModelID:r}),e("#"+i).hasClass("childNode")?(e("#"+i).html(""),e("#"+i).append("<label>"+t.get("ParentDepartment")+"</label><input type='checkbox' checked='checked' /><ol><li class='file childNode' id ="+r+"><a>"+t.get("DepartmentCode")+"</a></li><ol>"),e("#"+i).removeClass("childNode"),e("#"+i).addClass("childNodeParent")):e("#"+i).hasClass("childNodeParent")?e("#"+i+" > ol").append("<li class='file childNode' id ="+r+"><a>"+t.get("DepartmentCode")+"</a></li>"):(e("#"+i+"> input").removeAttr("disabled"),e("#"+i+"> ol").append("<li class='file childNode' id ="+r+"><a>"+t.get("DepartmentCode")+"</a></li>"))})}});return c});