/****
* Javascript file for login frontend
*
****/
var DEBUG_TRACE = true;
var BASE_URL = "api/";

function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
	});
	return vars;
}

if(getUrlVars()["status"]){
	if(getUrlVars()["status"] != 420){
		$("#error").html(decodeURI(getUrlVars()["message"]));
	}
}

$("#form_submit").click(function(e){
	e.preventDefault();
	var add_items = {};
	add_items["username"] = $("#username").val();
	add_items["password"] = $("#password").val();
	new MyAjaxRequest(BASE_URL+"login", {
			data: add_items,
			method: "POST",
			onSuccess: function (rslt){
				console.log(rslt);
				if(rslt.ok){
					localStorage.setItem("token", rslt.token);
					localStorage.setItem("expires", rslt.expires);
					localStorage.setItem("user", rslt.user);
					localStorage.setItem("initials", rslt.initials);
					localStorage.setItem("group", rslt.group);
					localStorage.setItem("name", rslt.name);
					window.location = "/";
				} else {
					//Display error
					if(DEBUG_TRACE) console.log(rslt.errMsg);
				}
			},
			onFailure: function (rslt){
				console.log(rslt);
			},
		}, false);
	
	return false;
});
