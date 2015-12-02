/****
* Javascript file for brand frontend
*
****/
var DEBUG_TRACE = true;
var BASE_URL = "api/";
var TABLE_HEADERS = [
		["No", "no"],
		["ID", "m_id"],
		["Logo", "logo"],
		["Full Name", "full_name"],
		["Short Name", "short_name"],
		["Company Name", "company_name"],
		["Items", "items"],
		["", "edit"]
	];

function create_table(q){
	var class_table = "full-width mdl-data-table mdl-js-data-table";
	var class_th = "mdl-data-table__cell--non-numeric";
	var class_td = "mdl-data-table__cell--non-numeric";
	
	var m = "";
	
	//Input data
	for(var i=0; i<q.length; i++){
		var brand = q[i];
		m+= "<tr row=\""+brand["m_id"]+"\">";
		for(var j=0; j<TABLE_HEADERS.length; j++){
			var header = TABLE_HEADERS[j][1];
			if(header == "no"){
				m += "<td row=\""+brand["m_id"]+"\">"+(i+1)+"</td>";
			} else if(header == "edit"){
				m += "<td row=\""+brand["m_id"]+"\"><a href=\"#\" class=\"edit_row\" row=\""+brand["m_id"]+"\" param=\"edit\">Edit</a></td>";
			} else if(brand[header] != null){
				if(header == "items"){
					m += "<td row=\""+brand["m_id"]+"\" id=\""+header+"_"+brand["m_id"]+"\">"+brand[header]+"</td>";
				} else if(header == "logo"){
					m += "<td row=\""+brand["m_id"]+"\" id=\""+header+"_"+brand["m_id"]+"\" style='padding-top:5px;padding-bottom:5px'><img style='max-width:80px;max-height:60px' src=\""+BASE_URL+brand[header].url+"\" /></td>";
				} else {
					m += "<td class=\""+class_td+"\" row=\""+brand["m_id"]+"\" id=\""+header+"_"+brand["m_id"]+"\">"+brand[header]+"</td>";
				}
			} else {
				m+= "<td row=\""+brand["m_id"]+"\" id=\""+header+"_"+brand["m_id"]+"\"></td>";
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
					case "full_name":
					case "short_name":
					case "company_name":
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
			
			var edit_extra = document.createElement("td");
			var edit_extra_form = document.createElement("form");
			edit_extra.className = class_td+" edit";
			edit_extra.colSpan = TABLE_HEADERS.length;
			edit_extra_form.id = "form_"+row;
			edit_extra_form.method = "post";
			edit_extra_form.enctype = "multipart/form-data";
			edit_extra_form.innerHTML = "<p>New Logo: <input style='max-width:200px' type='file' name='logo'/> \
										 <input type='hidden' name='name' value='"+row+"' /> </p> \
										 <p><input style='max-width:200px' type='submit' value='Upload'/></p>";
			edit_extra.appendChild(edit_extra_form);
			$("tr[row='"+row+"']").after(edit_extra);
			$(edit_extra_form).submit(function(e){
				e.preventDefault();
				var data = new FormData();
				data.append("logo", $("form#form_"+row)[0].logo.files[0]);
				data.append("name", $("form#form_"+row)[0].name.value);
				$.ajax({
					url: BASE_URL+"brand/upload/"+row, 
					data: data,
					cache: false,
					contentType: false,
					processData: false,
					method: "POST",
					success: function (rslt){
						console.log(rslt);
						BrandAjaxRequest({});
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
				BrandAjaxRequest({});
			});
		} else {
			var add_items = {};
			for(var i=0; i<TABLE_HEADERS.length; i++){
				var header = TABLE_HEADERS[i][1];
				switch(header){
					case "full_name":
					case "short_name":
					case "company_name":
						var value = $("#"+header+"_"+row+" > :input").val();
						$("#"+header+"_"+row).text(value);
						add_items[header] = value;
						break;
					default:
						break;
				}
			}
			
			$("td[row='"+row+"']").removeClass("edit");
			$(this).text("Edit");
			$(this).attr("param", "edit");
			
			new MyAjaxRequest(BASE_URL+"brand/edit/"+row, {
				data: add_items,
				method: "POST",
				onSuccess: function (rslt){
					console.log(rslt);
					if(rslt.ok){
						BrandAjaxRequest({});
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

function BrandAjaxRequest(data){
	new MyAjaxRequest(BASE_URL+"brand/", {
		data: data,
		method: "POST",
		onSuccess: function (rslt){
			console.log(rslt);
			if(rslt.ok){
				if(rslt.brands)
					create_table(rslt.brands);
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

function MyAjaxRequest (url, opts, noRetry){
	if (DEBUG_TRACE) logit ("myAjaxRequest: "+ url +"\n" + opts);
	console.log(opts);
	var wasSuccess = opts.onSuccess;
	var wasFailure = opts.onFailure;
	var beforeSend = opts.beforeSend;
	var retry = 0;
	var delay = 5;
	var show = true;
	var noRetry = noRetry===true?true:false;
	var silentTimer;

	myRetry();
	return;

	function myRetry(){
		++retry;
		$.ajax({
			url: url,
			data: opts.data,
			dataType: "json",
			beforeSend: beforeSend,
			method: opts.method==null?"POST":opts.method,
			success: mySuccess, 
			error: myFailure
		});
		//delay = delay * 1.25;
	}
	function myFailure(xhr, text, err){
		console.log(text, err);
		var o = {};
		o.ok = false;
		o.errMsg = "AJAX Communication Failure";
		wasFailure (o);
	}
	function mySuccess (rslt){
		if (rslt.ok){
			logit(rslt);
			wasSuccess (rslt);
		}
	}

	function silentRetry() {
		clearTimeout(silentTimer);
		myRetry();
	}
}

function logit (msg){
	var now = new Date();
	console.log (now.toTimeString().substring (0,8) +'.' + now.getMilliseconds() +': '+  msg);
}

//Draw table
	new MyAjaxRequest(BASE_URL+"brand/", {
		data: {},
		method: "GET",
		onSuccess: function (rslt){
			console.log(rslt);
			if(rslt.ok){
				if(rslt.brands)
					create_table(rslt.brands);
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
		BrandAjaxRequest({});
	});
	
		
	$(".search").keyup(function(){
		var search_boxes = document.getElementsByClassName("search");
		var search = {};
		for(var i=0; i<search_boxes.length; i++){
			if(search_boxes[i].value.length > 0){
				search[search_boxes[i].getAttribute("params")] = search_boxes[i].value;
			}
		}
		BrandAjaxRequest(search);
	});
	
//Save button
$("#add_form").submit(function(e){
	e.preventDefault();
	var add_items = new FormData();
	for(var i=0; i<TABLE_HEADERS.length; i++){
		var header = TABLE_HEADERS[i][1];
		if(document.getElementById("add_"+header) != null){
			if(header == "logo"){
				add_items.append(header, $("form#add_form")[0].add_logo.files[0]);
			} else {
				add_items.append(header, $("form#add_form")[0]["add_"+header].value);
			}
		}
	}
	console.log(add_items);
	$.ajax({
		url: BASE_URL+"brand/add/", 
		data: add_items,
		cache: false,
		contentType: false,
		processData: false,
		method: "POST",
		success: function (rslt){
			console.log(rslt);
			if(rslt.ok){
				$("#content_add").hide(400);
				BrandAjaxRequest({});
			} else {
				//Display error
				if(DEBUG_TRACE) console.log(rslt.errMsg);
			}
		},
		error: function (rslt){
			console.log(rslt);
		},
		beforeSend: function (xhr){
			document.getElementById("content_table").getElementsByTagName('tbody')[0].innerHTML = "<tr><td colspan="+TABLE_HEADERS.length+"><center><div class=\"mdl-spinner mdl-js-spinner is-active\"></div></center></td></tr>";
		}
	}, false);
});