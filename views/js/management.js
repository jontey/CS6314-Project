/****
* Javascript file for management frontend
*
****/
var DEBUG_TRACE = true;
var BASE_URL = "api/";
var TABLE__USER_HEADERS = [
		"no",
		"name",
		"user",
		"initials",
		"password",
		"group",
		"edit"
	];

function create_user_table(q){
	var class_table = "full-width mdl-data-table mdl-js-data-table";
	var class_th = "mdl-data-table__cell--non-numeric";
	var class_td = "mdl-data-table__cell--non-numeric";
	
	var m = "";
	
	//Input data
	for(var i=0; i<q.length; i++){
		var user = q[i];
		m+= "<tr row=\""+user["u_id"]+"\">";
		for(var j=0; j<TABLE__USER_HEADERS.length; j++){
			var header = TABLE__USER_HEADERS[j];
			if(header == "no"){
				m += "<td row=\""+user["u_id"]+"\">"+(i+1)+"</td>";
			} else if(header == "password"){
				m += "<td class=\""+class_td+"\" row=\""+user["u_id"]+"\" id=\""+header+"_"+user["u_id"]+"\">****</td>";
			} else if(header == "edit"){
				m += "<td row=\""+user["u_id"]+"\"><a href=\"#\" class=\"edit_row user\" row=\""+user["u_id"]+"\" param=\"edit\">Edit</a></td>";
			} else if(user[header] != null){
				m += "<td class=\""+class_td+"\" row=\""+user["u_id"]+"\" id=\""+header+"_"+user["u_id"]+"\">"+user[header]+"</td>";
			} else {
				m+= "<td row=\""+user["u_id"]+"\" id=\""+header+"_"+user["u_id"]+"\"></td>";
			}
		}
		m+= "</tr>";
	}
	document.getElementById("content_user_table").getElementsByTagName('tbody')[0].innerHTML = m;
	
	//Edit button listener
	$(".edit_row.user").click(function (){
		var row = $(this).attr("row");
		if($(this).attr("param") == "edit"){
			for(var i=0; i<TABLE__USER_HEADERS.length; i++){
				var header = TABLE__USER_HEADERS[i];
				switch(header){
					case "no":
					case "edit":
						break;
					case "password":
						var input = document.createElement("input");
							input.type = "password";
							input.setAttribute("row", row);
							input.setAttribute("col", header);
							$("#"+header+"_"+row).html(input);
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
			
			//Undo button
			var undo = document.createElement("a");
			undo.innerHTML = "<br/> Undo";
			undo.href = "#";
			$(this).after(undo);
			$(undo).click(function(){
				UserAjaxRequest({});
			});
		} else {
			var add_items = {};
			for(var i=0; i<TABLE__USER_HEADERS.length; i++){
				var header = TABLE__USER_HEADERS[i];
				switch(header){
					case "no":
					case "edit":
						break;
					case "password":
						var value = $("#"+header+"_"+row+" > :input").val();
						if(value != ""){
							$("#"+header+"_"+row).text(value);
							add_items[header] = value;
						}
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
			
			new MyAjaxRequest(BASE_URL+"user/edit/"+row, {
				data: add_items,
				method: "POST",
				onSuccess: function (rslt){
					console.log(rslt);
					if(rslt.ok){
						UserAjaxRequest({});
					} else {
						//Display error
						if(DEBUG_TRACE) console.log(rslt.errMsg);
					}
				},
				onFailure: function (rslt){
					console.log(rslt);
				},
				beforeSend: function (xhr){
					document.getElementById("content_user_table").getElementsByTagName('tbody')[0].innerHTML = "<tr><td colspan="+TABLE__USER_HEADERS.length+"><center><div class=\"mdl-spinner mdl-js-spinner is-active\"></div></center></td></tr>";
				}
			}, false);
		}
	});
}

function UserAjaxRequest(data){
	new MyAjaxRequest(BASE_URL+"user/", {
			data: data,
			method: "POST",
			onSuccess: function (rslt){
				console.log(rslt);
				if(rslt.ok){
					if(rslt.users)
						create_user_table(rslt.users);
				} else {
					//Display error
					if(DEBUG_TRACE) console.log(rslt.errMsg);
				}
			},
			onFailure: function (rslt){
				console.log(rslt);
			},
			beforeSend: function (xhr){
				document.getElementById("content_user_table").getElementsByTagName('tbody')[0].innerHTML = "<tr><td colspan="+TABLE__USER_HEADERS.length+"><center><div class=\"mdl-spinner mdl-js-spinner is-active\"></div></center></td></tr>";
			}
		}, false);
}


//Draw table
	new MyAjaxRequest(BASE_URL+"user/", {
		data: {},
		method: "POST",
		onSuccess: function (rslt){
			console.log(rslt);
			if(rslt.ok){
				if(rslt.users)
					create_user_table(rslt.users);
			} else {
				//Display error
				if(DEBUG_TRACE) console.log(rslt.errMsg);
			}
		},
		onFailure: function (rslt){
			console.log(rslt);
		},
		beforeSend: function (xhr){
			document.getElementById("content_user_table").getElementsByTagName('tbody')[0].innerHTML = "<tr><td colspan="+TABLE__USER_HEADERS.length+"><center><div class=\"mdl-spinner mdl-js-spinner is-active\"></div></center></td></tr>";
		}
	}, false);
	
	$("#content_user_add").hide();
	$("#button_user_add").click(function(){
		$("#content_user_add").toggle(400);
	});
	$("#search_user_clear").click(function(){
		$(".user_search").val("");
		UserAjaxRequest({});
	});
	
		
	$(".user_search").keyup(function(){
		var search_boxes = document.getElementsByClassName("user_search");
		var search = {};
		for(var i=0; i<search_boxes.length; i++){
			if(search_boxes[i].value.length > 0){
				search[search_boxes[i].getAttribute("params")] = search_boxes[i].value;
			}
		}
		UserAjaxRequest(search);
	});
	
	$("#button_user_save").click(function(){
		var add_items = {};
		for(var i=0; i<TABLE__USER_HEADERS.length; i++){
			var header = TABLE__USER_HEADERS[i];
			if(document.getElementById("add_user_"+header) != null){
				add_items[header] = document.getElementById("add_user_"+header).value;
			}
		}
		if(document.getElementById("add_user_password").value == ""){
			$("#add_user_password").parent().parent().addClass("has-error");
			return;
		}
		add_items.password = document.getElementById("add_user_password").value;
		console.log(add_items);

		new MyAjaxRequest(BASE_URL+"user/add/", {
			data: add_items,
			method: "POST",
			onSuccess: function (rslt){
				console.log(rslt);
				if(rslt.ok){
					$("#content_user_add").hide(400);
					UserAjaxRequest({});
				} else {
					//Display error
					if(DEBUG_TRACE) console.log(rslt.errMsg);
				}
			},
			onFailure: function (rslt){
				console.log(rslt);
			},
			beforeSend: function (xhr){
				document.getElementById("content_user_table").getElementsByTagName('tbody')[0].innerHTML = "<tr><td colspan="+TABLE__USER_HEADERS.length+"><center><div class=\"mdl-spinner mdl-js-spinner is-active\"></div></center></td></tr>";
			}
		}, false);
	});