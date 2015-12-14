/****
* Javascript file for purchase frontend
*
****/
var DEBUG_TRACE = true;
var BASE_URL = "api/";
var TABLE_HEADERS = [
		"po_id",
		"p_id",
		"p_date",
		"vendor",
		"total",
		"currency",
		"conversion",
		"cost",
		"delivery",
		"retail",
		"edit"
	];

function create_table(q){
	var class_table = "full-width mdl-data-table mdl-js-data-table";
	var class_th = "mdl-data-table__cell--non-numeric";
	var class_td = "mdl-data-table__cell--non-numeric";
	
	var m = "";
	
	//Input data
	for(var i=0; i<q.length; i++){
		var po = q[i];
		m+= "<tr row=\""+po["po_id"]+"\">";
		for(var j=0; j<TABLE_HEADERS.length; j++){
			var header = TABLE_HEADERS[j];
			if(header == "po_id"){
				m += "<td row=\""+po["po_id"]+"\">"+po["po_id"]+"</td>";
			} else if(header == "p_id"){
				m += "<td row=\""+po["po_id"]+"\">"+po["p_id"]+"</td>";
			} else if(header == "edit"){
				m += "<td row=\""+po["po_id"]+"\"><a href=\"#\" class=\"edit_row\" row=\""+po["po_id"]+"\" param=\"edit\">Edit</a></td>";
			} else if(po[header] != null){
				m += "<td class=\""+class_td+"\" row=\""+po["po_id"]+"\" id=\""+header+"_"+po["po_id"]+"\">"+po[header]+"</td>";
			} else {
				m+= "<td row=\""+po["po_id"]+"\" id=\""+header+"_"+po["po_id"]+"\"></td>";
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
					case "no":
					case "edit":
					case "cost":
					case "delivery":
					case "retail":
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
			
			// var edit_extra = document.createElement("td");
			// var edit_extra_form = document.createElement("form");
			// edit_extra.className = class_td+" edit";
			// edit_extra.colSpan = TABLE_HEADERS.length;
			// edit_extra_form.method = "post";
			// edit_extra_form.enctype = "multipart/form-data";
			// edit_extra_form.innerHTML = "<p>Add file: <input width='200px' type='file' name='file'/> \
										 // <input type='hidden' name='name' value='"+row+"' /> </p> \
										 // <p><input width='100px' type='submit' value='Upload'/></p>";
			// edit_extra.appendChild(edit_extra_form);
			// $("tr[row='"+row+"']").after(edit_extra);
			// $(edit_extra_form).submit(function(e){
				// e.preventDefault();
				// var data = new FormData();
				// data.append("file", $("form")[0].file.files[0]);
				// data.append("name", $("form")[0].name.value);
				// console.log(data);
				// $.ajax({
					// url: BASE_URL+"po/upload/"+row, 
					// data: data,
					// headers: {
						// "x-access-token": localStorage.getItem("token") || "",
						// "x-key": localStorage.getItem("user") || ""
					// },
					// cache: false,
					// contentType: false,
					// processData: false,
					// method: "POST",
					// success: function (rslt){
						// console.log(rslt);
						// PurchaseAjaxRequest({});
					// },
					// error: function (rslt){
						// console.log(rslt);
					// }
				// }, false);
				// return false;
			// });
			
			//Undo button
			var undo = document.createElement("a");
			undo.innerHTML = "<br/> Undo";
			undo.href = "#";
			$(this).after(undo);
			$(undo).click(function(){
				PurchaseAjaxRequest({});
			});
		} else {
			var add_items = {};
			for(var i=0; i<TABLE_HEADERS.length; i++){
				var header = TABLE_HEADERS[i];
				switch(header){
					case "no":
					case "date":
					case "quotation_number":
					case "file":
					case "edit":
						break;
					default:
						var value = $("#"+header+"_"+row+" > :input").val();
							$("#"+header+"_"+row).text(value);
							add_items[header] = value;
						break;
				}
			}
			
			$("td[row='"+row+"']").removeClass("edit");
			$(this).text("Edit");
			$(this).attr("param", "edit");
			
			new MyAjaxRequest(BASE_URL+"po/edit/"+row, {
				data: add_items,
				method: "POST",
				onSuccess: function (rslt){
					console.log(rslt);
					if(rslt.ok){
						PurchaseAjaxRequest({});
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

function PurchaseAjaxRequest(data){
	new MyAjaxRequest(BASE_URL+"po/", {
			data: data,
			method: "POST",
			onSuccess: function (rslt){
				console.log(rslt);
				if(rslt.ok){
					if(rslt.pos)
						create_table(rslt.pos);
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
	PurchaseAjaxRequest({});
	
	$("#content_add").hide();
	$("#button_add").click(function(){
		$("#content_add").toggle(400);
	});
	$("#search_clear").click(function(){
		$(".search").val("");
		PurchaseAjaxRequest({});
	});
	
		
	$(".search").keyup(function(){
		var search_boxes = document.getElementsByClassName("search");
		var search = {};
		for(var i=0; i<search_boxes.length; i++){
			if(search_boxes[i].value.length > 0){
				search[search_boxes[i].getAttribute("params")] = search_boxes[i].value;
			}
		}
		PurchaseAjaxRequest(search);
	});
	
	$("#button_save").click(function(){
		var add_items = {};
		for(var i=0; i<TABLE_HEADERS.length; i++){
			var header = TABLE_HEADERS[i];
			if(document.getElementById("add_"+header) != null){
				add_items[header] = document.getElementById("add_"+header).value;
			}
		}
		console.log(add_items);

		new MyAjaxRequest(BASE_URL+"po/add/", {
			data: add_items,
			method: "POST",
			onSuccess: function (rslt){
				console.log(rslt);
				if(rslt.ok){
					$("#content_add").hide(400);
					PurchaseAjaxRequest({});
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