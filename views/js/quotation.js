/****
* Javascript file for quotation frontend
*
****/
var DEBUG_TRACE = true;
var BASE_URL = "api/";
var TABLE_HEADERS = [
		["No", "no"],
		["Date", "date"],
		["Quotation No", "quotation_number"],
		["By", "by"],
		["Customer", "customer"],
		["Manufacturer", "manufacturer"],
		["Item", "item"],
		["Amount (RM)", "total"],
		["File", "file"],
		["", "edit"]
	];

function create_table(q){
	var class_table = "full-width mdl-data-table mdl-js-data-table";
	var class_th = "mdl-data-table__cell--non-numeric";
	var class_td = "mdl-data-table__cell--non-numeric";
	
	var m = "";
	
	//Input data
	for(var i=0; i<q.length; i++){
		var quotation = q[i];
		m+= "<tr row=\""+quotation["q_id"]+"\">";
		for(var j=0; j<TABLE_HEADERS.length; j++){
			var header = TABLE_HEADERS[j][1];
			if(header == "no"){
				m += "<td row=\""+quotation["q_id"]+"\">"+(i+1)+"</td>";
			} else if(header == "edit"){
				m += "<td row=\""+quotation["q_id"]+"\"><a href=\"#\" class=\"edit_row\" row=\""+quotation["q_id"]+"\" param=\"edit\">Edit</a></td>";
			} else if(quotation[header] != null){
				if(header == "total"){
					m += "<td row=\""+quotation["q_id"]+"\" id=\""+header+"_"+quotation["q_id"]+"\">"+quotation[header]+"</td>";
				} else if(header == "file"){
					var total_files = quotation.file.length;
					if(total_files < 1){
						m += "<td row=\""+quotation["q_id"]+"\" id=\""+header+"_"+quotation["q_id"]+"\"></td>";
					} else {
						m += "<td row=\""+quotation["q_id"]+"\" id=\""+header+"_"+quotation["q_id"]+"\"><a href=\""+BASE_URL+quotation[header][total_files-1].url+"\" >"+quotation["q_id"]+quotation[header][total_files-1].ext+"</a></td>";
					}
				} else {
					m += "<td class=\""+class_td+"\" row=\""+quotation["q_id"]+"\" id=\""+header+"_"+quotation["q_id"]+"\">"+quotation[header]+"</td>";
				}
			} else {
				m+= "<td row=\""+quotation["q_id"]+"\" id=\""+header+"_"+quotation["q_id"]+"\"></td>";
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
				var header = TABLE_HEADERS[i][1];
				switch(header){
					case "no":
					case "date":
					case "quotation_number":
					case "file":
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
			
			var edit_extra = document.createElement("td");
			var edit_extra_form = document.createElement("form");
			edit_extra.className = class_td+" edit";
			edit_extra.colSpan = TABLE_HEADERS.length;
			edit_extra_form.method = "post";
			edit_extra_form.enctype = "multipart/form-data";
			edit_extra_form.innerHTML = "<p>Add file: <input width='200px' type='file' name='file'/> \
										 <input type='hidden' name='name' value='"+row+"' /> </p> \
										 <p><input width='100px' type='submit' value='Upload'/></p>";
			edit_extra.appendChild(edit_extra_form);
			$("tr[row='"+row+"']").after(edit_extra);
			$(edit_extra_form).submit(function(e){
				e.preventDefault();
				var data = new FormData();
				data.append("file", $("form")[0].file.files[0]);
				data.append("name", $("form")[0].name.value);
				console.log(data);
				$.ajax({
					url: BASE_URL+"quotation/upload/"+row, 
					data: data,
					headers: {
						"x-access-token": localStorage.getItem("token") || "",
						"x-key": localStorage.getItem("user") || ""
					},
					cache: false,
					contentType: false,
					processData: false,
					method: "POST",
					success: function (rslt){
						console.log(rslt);
						QuotationAjaxRequest({});
					},
					error: function (rslt){
						console.log(rslt);
					}
				}, false);
				return false;
			});
			
			//Undo button
			var undo = document.createElement("a");
			undo.innerHTML = "<br/> Undo";
			undo.href = "#";
			$(this).after(undo);
			$(undo).click(function(){
				QuotationAjaxRequest({});
			});
		} else {
			var add_items = {};
			for(var i=0; i<TABLE_HEADERS.length; i++){
				var header = TABLE_HEADERS[i][1];
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
			
			new MyAjaxRequest(BASE_URL+"quotation/edit/"+row, {
				data: add_items,
				method: "POST",
				onSuccess: function (rslt){
					console.log(rslt);
					if(rslt.ok){
						QuotationAjaxRequest({});
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

function QuotationAjaxRequest(data){
	new MyAjaxRequest(BASE_URL+"quotation/", {
			data: data,
			method: "POST",
			onSuccess: function (rslt){
				console.log(rslt);
				if(rslt.ok){
					if(rslt.quotations)
						create_table(rslt.quotations);
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
	new MyAjaxRequest(BASE_URL+"quotation/", {
		data: {},
		method: "POST",
		onSuccess: function (rslt){
			console.log(rslt);
			if(rslt.ok){
				if(rslt.quotations)
					create_table(rslt.quotations);
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
	
	$("#content_add").hide();
	$("#button_add").click(function(){
		$("#content_add").toggle(400);
	});
	$("#search_clear").click(function(){
		$(".search").val("");
		QuotationAjaxRequest({});
	});
	$("#add_by").val(localStorage.getItem("initials"));
	
		
	$(".search").keyup(function(){
		var search_boxes = document.getElementsByClassName("search");
		var search = {};
		for(var i=0; i<search_boxes.length; i++){
			if(search_boxes[i].value.length > 0){
				search[search_boxes[i].getAttribute("params")] = search_boxes[i].value;
			}
		}
		QuotationAjaxRequest(search);
	});
	
	$("#button_save").click(function(){
		var add_items = {};
		for(var i=0; i<TABLE_HEADERS.length; i++){
			var header = TABLE_HEADERS[i][1];
			if(document.getElementById("add_"+header) != null){
				add_items[header] = document.getElementById("add_"+header).value;
			}
		}
		//Insert current date
		add_items.date = Date.today().toString("yyyy-M-d");
		console.log(add_items);

		new MyAjaxRequest(BASE_URL+"quotation/add/", {
			data: add_items,
			method: "POST",
			onSuccess: function (rslt){
				console.log(rslt);
				if(rslt.ok){
					$("#content_add").hide(400);
					QuotationAjaxRequest({});
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