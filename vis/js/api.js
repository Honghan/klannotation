if (typeof qbb == "undefined"){
	var qbb = {};
}

(function($) {
	if(typeof qbb.inf == "undefined") {

		qbb.inf = {
			service_url: "/api",

			getDocList: function(searchCB, passphrase){
				var sendObject= ["docs"];
				qbb.inf.callAPI(sendObject, searchCB, passphrase);
			},

			needPassphrase: function(searchCB, passphrase){
				var sendObject= ["need_passphrase"];
				qbb.inf.callAPI(sendObject, searchCB, passphrase);
			},

			checkPhrase: function(phrase, searchCB, passphrase){
				var sendObject= ["check_phrase", phrase];
				qbb.inf.callAPI(sendObject, searchCB, passphrase);
			},

			getDocDetail: function(docId, searchCB, passphrase){
				var sendObject= ["doc_detail", docId];
				qbb.inf.callAPI(sendObject, searchCB, passphrase);
			},

			getDocDetailMapping: function(docId, mapping, searchCB, passphrase){
				var sendObject= ["doc_content_mapping", docId, mapping];
				qbb.inf.callAPI(sendObject, searchCB, passphrase);
			},

			getMappings: function(searchCB, passphrase){
				var sendObject= ["mappings"];
				qbb.inf.callAPI(sendObject, searchCB, passphrase);
			},

			callAPI: function(sendObject, cb, passphrase){
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
				}, passphrase);
			},

			ajax: {
					doGet:function(sendData,success,error, passphrase){
						var url = qbb.inf.service_url;
						for (var i=0;i<sendData.length;i++)
							url += "/" + sendData[i];
						if (sendData.length > 0)
							url += "/";
						if (passphrase)
							url += "?passphrase=" + passphrase;
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