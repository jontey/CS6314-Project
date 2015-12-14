$().ready(function(){
	$("#logout").click(function(e){
		localStorage.setItem("token", null);
		localStorage.setItem("user", null);
		window.location = "/";
	});
	
	$("#user_info").html("<b>"+localStorage.getItem("name")+"</b><br/>"+localStorage.getItem("group"));
});

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
			headers: {
				"x-access-token": localStorage.getItem("token") || "",
				"x-key": localStorage.getItem("user") || ""
			},
			dataType: "json",
			beforeSend: beforeSend,
			method: opts.method==null?"POST":opts.method,
			success: mySuccess, 
			error: myFailure
		});
		//delay = delay * 1.25;
	}
	function myFailure(xhr, text, err){
		console.log(xhr, text, err);
		if(xhr.status>=400 && xhr.status<500){
			window.location = "login?status="+xhr.status+"&message="+xhr.responseJSON.message;
		}
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