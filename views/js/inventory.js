/****
* Javascript file for inventory frontend
*
****/
var DEBUG_TRACE = true;
var BASE_URL = "api/";
var TABLE_HEADERS = [
	"i_id",
	"p_id",
	"p_date",
	"brand",
	"name",
	"serial",
	"landed_cost",
	"retail",
	"status",
	"notes",
	"edit"
];
var save_table = [
	"p_id",
	"p_date",
	"brand",
	"name",
	"branch",
	"serial",
	"unit_cost",
	"delivery",
	"tax_cost",
	"markup",
	"status",
	"notes"
];

function create_table(q){
	var class_table = "full-width mdl-data-table mdl-js-data-table";
	var class_th = "mdl-data-table__cell--non-numeric";
	var class_td = "mdl-data-table__cell--non-numeric";
	
	var m = "";
	
	//Input data
	for(var i=0; i<q.length; i++){
		var item = q[i];
		m+= "<tr row=\""+item["i_id"]+"\">";
		for(var j=0; j<TABLE_HEADERS.length; j++){
			var header = TABLE_HEADERS[j];
			if(header == "i_id"){
				m += "<td row=\""+item["i_id"]+"\">"+item["i_id"]+"</td>";
			} else if(header == "edit"){
				m += "<td row=\""+item["i_id"]+"\"><a href=\"#\" class=\"edit_row\" row=\""+item["i_id"]+"\" param=\"edit\">Edit</a>";
				m += "<input id=\""+item["i_id"]+"_unit_cost\" hidden value=\""+item["unit_cost"]+"\" />";
				m += "<input id=\""+item["i_id"]+"_delivery\" hidden value=\""+item["delivery"]+"\" />";
				m += "<input id=\""+item["i_id"]+"_tax_cost\" hidden value=\""+item["tax_cost"]+"\" />";
				m += "<input id=\""+item["i_id"]+"_markup\" hidden value=\""+item["markup"]+"\" />";
				m += "</td>";
			} else if(header == "landed_cost"){
				var total = parseFloat(item["unit_cost"])+parseFloat(item["delivery"])+parseFloat(item["tax_cost"]);
				m += "<td row=\""+item["i_id"]+"\" id=\""+header+"_"+item["i_id"]+"\">"+total+"</td>";
			} else if (header == "retail"){
				var cost = parseFloat(item["unit_cost"])+parseFloat(item["delivery"])+parseFloat(item["tax_cost"]);
				var retail = ((parseFloat(item["markup"])/100)+1) * cost;
				m += "<td row=\""+item["i_id"]+"\" id=\""+header+"_"+item["i_id"]+"\">"+retail+"</td>";
			} else if(item[header] != null){
				m += "<td class=\""+class_td+"\" row=\""+item["i_id"]+"\" id=\""+header+"_"+item["i_id"]+"\">"+item[header]+"</td>";
			} else {
				m+= "<td row=\""+item["i_id"]+"\" id=\""+header+"_"+item["i_id"]+"\"></td>";
			}
		}
		m+= "</tr>";
	}
	document.getElementById("content_table").getElementsByTagName('tbody')[0].innerHTML = m;
	
	//Edit button listener
	$(".edit_row").click(function (){
		var row = $(this).attr("row");
		if($(this).attr("param") == "edit"){
			for(var i=0; i<TABLE_HEADERS.length; i++){
				var header = TABLE_HEADERS[i];
				switch(header){
					case "landed_cost":
					case "retail":
					case "edit":
						break;
					default:
						var input = document.createElement("input");
							input.value = $("#"+header+"_"+row).text();
							input.setAttribute("row", row);
							input.setAttribute("col", header);
							$("#"+header+"_"+row).html(input);
						break;
				}
			}
			$("td[row='"+row+"']").addClass("edit");
			$(this).text("Save");
			$(this).attr("param", "save");
			
			var unit_cost = $("#"+row+"_unit_cost").val();
			var delivery = $("#"+row+"_delivery").val();
			var tax_cost = $("#"+row+"_tax_cost").val();
			var markup = $("#"+row+"_markup").val();
			var edit_extra = document.createElement("td");
			// var edit_extra_form = document.createElement("form");
			edit_extra.className = class_td+" edit";
			edit_extra.colSpan = TABLE_HEADERS.length;
			// edit_extra_form.method = "post";
			// edit_extra_form.enctype = "multipart/form-data";
			edit_extra.innerHTML = "<table><tr><td>Unit Cost: </td><td><input style='width:200px' type='text' id='edit_"+row+"_unit_cost' value='"+unit_cost+"'/></td></tr> \
									<tr><td>Delivery: </td><td><input style='width:200px' type='text' id='edit_"+row+"_delivery' value='"+delivery+"'/></td></tr> \
									<tr><td>Tax Cost: </td><td><input style='width:200px' type='text' id='edit_"+row+"_tax_cost' value='"+tax_cost+"'/></td></tr> \
									<tr><td>Markup %: </td><td><input style='width:200px' type='text' id='edit_"+row+"_markup' value='"+markup+"'/></td></tr>";
			// edit_extra.appendChild(edit_extra_form);
			$("tr[row='"+row+"']").after(edit_extra);
			
			//Undo button
			var undo = document.createElement("a");
			undo.innerHTML = "<br/> Undo";
			undo.href = "#";
			$(this).after(undo);
			$(undo).click(function(){
				InventoryAjaxRequest({});
			});
		} else {
			var add_items = {};
			for(var i=0; i<save_table.length; i++){
				var header = save_table[i];
				switch(header){
					case "edit":
						break;
					case "unit_cost":
					case "delivery":
					case "tax_cost":
					case "markup":
						add_items[header] = $("#edit_"+row+"_"+header).val();
						break;
					default:
						var value = $("#"+header+"_"+row+" > :input").val();
							$("#"+header+"_"+row).text(value);
							add_items[header] = value;
						break;
				}
			}
			console.log(add_items);
			$("td[row='"+row+"']").removeClass("edit");
			$(this).text("Edit");
			$(this).attr("param", "edit");
			
			new MyAjaxRequest(BASE_URL+"inventory/edit/"+row, {
				data: add_items,
				method: "POST",
				onSuccess: function (rslt){
					console.log(rslt);
					if(rslt.ok){
						InventoryAjaxRequest({});
					} else {
						//Display error
						if(DEBUG_TRACE) console.log(rslt.errMsg);
					}
				},
				onFailure: function (rslt){
					console.log(rslt);
				},
				beforeSend: function (xhr){
					document.getElementById("content_table").getElementsByTagName('tbody')[0].innerHTML = "<tr><td colspan="+TABLE_HEADERS.length+"><center><div class=\"mdl-spinner mdl-js-spinner is-active\"></div></center></td></tr>";
				}
			}, false);
		}
	});
}

function InventoryAjaxRequest(data){
	new MyAjaxRequest(BASE_URL+"inventory/", {
			data: data,
			method: "POST",
			onSuccess: function (rslt){
				console.log(rslt);
				if(rslt.ok){
					if(rslt.items)
						create_table(rslt.items);
				} else {
					//Display error
					if(DEBUG_TRACE) console.log(rslt.errMsg);
				}
			},
			onFailure: function (rslt){
				console.log(rslt);
			},
			beforeSend: function (xhr){
				document.getElementById("content_table").getElementsByTagName('tbody')[0].innerHTML = "<tr><td colspan="+TABLE_HEADERS.length+"><center><div class=\"mdl-spinner mdl-js-spinner is-active\"></div></center></td></tr>";
			}
		}, false);
}

//Draw table
	InventoryAjaxRequest({});
	
	$("#content_add").hide();
	$("#button_add").click(function(){
		$("#content_add").toggle(400);
	});
	$("#search_clear").click(function(){
		$(".search").val("");
		InventoryAjaxRequest({});
	});
	
		
	$(".search").keyup(function(){
		var search_boxes = document.getElementsByClassName("search");
		var search = {};
		for(var i=0; i<search_boxes.length; i++){
			if(search_boxes[i].value.length > 0){
				search[search_boxes[i].getAttribute("params")] = search_boxes[i].value;
			}
		}
		InventoryAjaxRequest(search);
	});
	
	//TODO - update landed cost and retail
	
	$("#button_save").click(function(){
		var add_items = {};
		for(var i=0; i<save_table.length; i++){
			var header = save_table[i];
			if(document.getElementById("add_"+header) != null){
				add_items[header] = document.getElementById("add_"+header).value;
			}
		}
		console.log(add_items);

		new MyAjaxRequest(BASE_URL+"inventory/add/", {
			data: add_items,
			method: "POST",
			onSuccess: function (rslt){
				console.log(rslt);
				if(rslt.ok){
					$("#content_add").hide(400);
					new MyAjaxRequest(BASE_URL+"po/update", {
						data: {
							p_id: add_items["p_id"]
						},
						method: "POST",
						onSuccess: function (rslt){
							console.log(rslt);
							InventoryAjaxRequest({});
						},
						onFailure: function (rslt){
							console.log(rslt);
						}
					});
				} else {
					//Display error
					if(DEBUG_TRACE) console.log(rslt.errMsg);
				}
			},
			onFailure: function (rslt){
				console.log(rslt);
			},
			beforeSend: function (xhr){
				document.getElementById("content_table").getElementsByTagName('tbody')[0].innerHTML = "<tr><td colspan="+TABLE_HEADERS.length+"><center><div class=\"mdl-spinner mdl-js-spinner is-active\"></div></center></td></tr>";
			}
		}, false);
	});