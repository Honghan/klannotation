if (typeof qbb == "undefined"){
	var qbb = {};
}

(function($) {
	if(typeof qbb.inf == "undefined") {

		qbb.inf = {
			service_url: "/api",

			getDocList: function(searchCB){
				var sendObject= ["docs"];
				qbb.inf.callAPI(sendObject, searchCB);
			},

			getDocDetail: function(docId, searchCB){
				var sendObject= ["doc_detail", docId];
				qbb.inf.callAPI(sendObject, searchCB);
			},

			getDocDetailMapping: function(docId, mapping, searchCB){
				var sendObject= ["doc_content_mapping", docId, mapping];
				qbb.inf.callAPI(sendObject, searchCB);
			},

			getMappings: function(searchCB){
				var sendObject= ["mappings"];
				qbb.inf.callAPI(sendObject, searchCB);
			},

			callAPI: function(sendObject, cb){
				qbb.inf.ajax.doGet(sendObject, function(s){
					var ret = s;
					if (ret)
					{
						if (typeof cb == 'function')
							cb(ret);
					}else
					{
						if (typeof cb == 'function')
							cb();
					}
				}, function(){
					alert("API call failed.");
				});
			},

			ajax: {
					doGet:function(sendData,success,error){
						var url = qbb.inf.service_url;
						for (var i=0;i<sendData.length;i++)
							url += "/" + sendData[i];
						if (sendData.length > 0)
							url += "/";
						qbb.inf.ajax.doSend("Get",url,sendData,success,error);
					},
					doPost:function(sendData,success,error){
						qbb.inf.ajax.doSend("Post",null,sendData,success,error);
					},
					doSend:function(method,url,sendData,success,error){
						dataSuccess = function(data){
							(success)(eval(data));
						};
						if (sendData) sendData.token = "";
						jQuery.ajax({
							   type: method || "Get",
							   url: url || qbb.inf.service_url,
							   data: sendData || [],
							   cache: false,
							   dataType: "jsonp", /* use "html" for HTML, use "json" for non-HTML */
							   success: dataSuccess /* (data, textStatus, jqXHR) */ || null,
							   error: error /* (jqXHR, textStatus, errorThrown) */ || null
						});
					}
			}
		};
	}
})(jQuery);