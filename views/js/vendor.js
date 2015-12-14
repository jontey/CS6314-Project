/****
* Javascript file for vendor frontend
*
****/
var DEBUG_TRACE = true;
var BASE_URL = "api/";
var TABLE_HEADERS = [
	"v_id",
	"name",
	"address",
	"contact",
	"phone",
	"email",
	"edit"
];

function create_table(q){
	var class_table = "full-width mdl-data-table mdl-js-data-table";
	var class_th = "mdl-data-table__cell--non-numeric";
	var class_td = "mdl-data-table__cell--non-numeric";
	
	var m = "";
	
	//Input data
	for(var i=0; i<q.length; i++){
		var vendor = q[i];
		m+= "<tr row=\""+vendor["v_id"]+"\">";
		for(var j=0; j<TABLE_HEADERS.length; j++){
			var header = TABLE_HEADERS[j];
			if(header == "edit"){
				m += "<td row=\""+vendor["v_id"]+"\"><a href=\"#\" class=\"edit_row\" row=\""+vendor["v_id"]+"\" param=\"edit\">Edit</a></td>";
			} else if(vendor[header] != null){
				if(header == "v_id"){
					m += "<td row=\""+vendor["v_id"]+"\" id=\""+header+"_"+vendor["v_id"]+"\">"+vendor[header]+"</td>";
				} else {
					m += "<td class=\""+class_td+"\" row=\""+vendor["v_id"]+"\" id=\""+header+"_"+vendor["v_id"]+"\">"+vendor[header]+"</td>";
				}
			} else {
				m+= "<td row=\""+vendor["v_id"]+"\" id=\""+header+"_"+vendor["v_id"]+"\"></td>";
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
					case "address":
						var input = document.createElement("textarea");
							input.value = $("#"+header+"_"+row).html().replace(/<br>/g, '\n');
							input.setAttribute("row", row);
							input.setAttribute("rows", 3);
							input.setAttribute("col", header);
							$("#"+header+"_"+row).html(input);
						break;
					case "name":
					case "phone":
					case "email":
						var input = document.createElement("input");
							input.value = $("#"+header+"_"+row).text();
							input.setAttribute("row", row);
							input.setAttribute("col", header);
							$("#"+header+"_"+row).html(input);
						break;
					default:
						break;
				}
			}
			$("td[row='"+row+"']").addClass("edit");
			$(this).text("Save");
			$(this).attr("param", "save");
			
			//Undo button
			var undo = document.createElement("a");
			undo.innerHTML = "<br/> Undo";
			undo.href = "#";
			$(this).after(undo);
			$(undo).click(function(){
				VendorAjaxRequest({});
			});
		} else {
			var add_items = {};
			for(var i=0; i<TABLE_HEADERS.length; i++){
				var header = TABLE_HEADERS[i];
				switch(header){
					case "name":
					case "address":
					case "phone":
					case "email":
						var value = $("#"+header+"_"+row+" > :input").val();
						$("#"+header+"_"+row).text(value);
						add_items[header] = value.replace(/\n/g, '<br/>');
						break;
					default:
						break;
				}
			}
			
			$("td[row='"+row+"']").removeClass("edit");
			$(this).text("Edit");
			$(this).attr("param", "edit");
			
			new MyAjaxRequest(BASE_URL+"vendor/edit/"+row, {
				data: add_items,
				method: "POST",
				onSuccess: function (rslt){
					console.log(rslt);
					if(rslt.ok){
						VendorAjaxRequest({});
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

function VendorAjaxRequest(data){
	new MyAjaxRequest(BASE_URL+"vendor/", {
		data: data,
		method: "POST",
		onSuccess: function (rslt){
			console.log(rslt);
			if(rslt.ok){
				if(rslt.vendors)
					create_table(rslt.vendors);
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
VendorAjaxRequest({});
	
$("#content_add").hide();
$("#button_add").click(function(){
	$("#content_add").toggle(400);
});
$("#search_clear").click(function(){
	$(".search").val("");
	VendorAjaxRequest({});
});
	
$(".search").keyup(function(){
	var search_boxes = document.getElementsByClassName("search");
	var search = {};
	for(var i=0; i<search_boxes.length; i++){
		if(search_boxes[i].value.length > 0){
			search[search_boxes[i].getAttribute("params")] = search_boxes[i].value;
		}
	}
	VendorAjaxRequest(search);
});
	
//Save button
$("#add_form").submit(function(e){
	e.preventDefault();
	var add_items = {};
	for(var i=0; i<TABLE_HEADERS.length; i++){
		var header = TABLE_HEADERS[i];
		if(document.getElementById("add_"+header) != null){
			add_items[header] = document.getElementById("add_"+header).value.replace(/\n/g, '<br/>');
		}
	}
	console.log(add_items);

	new MyAjaxRequest(BASE_URL+"vendor/add/", {
		data: add_items,
		method: "POST",
		onSuccess: function (rslt){
			console.log(rslt);
			if(rslt.ok){
				$("#content_add").hide(400);
				VendorAjaxRequest({});
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