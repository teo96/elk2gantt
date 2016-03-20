DoTheJob();
function DoTheJob( ) {

    "use strict";    
    var client = new elasticsearch.Client( {host: 'vtdsncfg1:9200'});

		//init des var from & to avec now & now-7j
		//var from = Date.now()-(10*24*3600*1000); 
		//var to = Date.now(); 
		
		var from = new Date('2016-03-16T12:00:00');
		var to = new Date('2016-03-16T19:00:59');
		//récupération des infos from & to dans l'url 
		var query = getQueryParams(document.location.search);		
		if (query.from != null) {from = new Date(parseInt(query.from))};
		if (query.to != null) {to = new Date(parseInt(query.to))};
		
    client.search({
        index: 'sbadmin2',
        size: 300,
        body: {
            // Begin query.
            "query": {"match_all": {}},
			 "filter": {
				"bool": {
				 "must": [
						{
							 "range": {
									"timestamp": {
										 "gte": from,
										 "lte": to
									}
							 }
						}
				 ]
			}
			 },
			 "fields": ["Brique","jobId", "jobName", "jobStatus", "jobStartTime", "jobEndTime"]
										// End query.
        }
    }).then(function (reponse) {
        console.log(reponse);
        var jobs=reponse.hits.hits;
		// D3 code goes here.
		var tasks = [];
		var taskStatus = {"COMPLETED" : "bar-succeeded","FAILED" : "bar-failed", "ABANDONED" :"bar-killed"};
		var taskNames = [];

		for ( var i = 0; i < jobs.length; i++) {
			taskNames.push( jobs[i].fields.jobName);
			tasks.push({
				"startDate" :  new Date(jobs[i].fields.jobStartTime),
				"endDate" :  new Date(jobs[i].fields.jobEndTime),
				"taskName" : jobs[i].fields.jobName,
				"status" : jobs[i].fields.jobStatus
			})
		}
		var format = "%d/%m/%y %H:%M:%S";
		
		var gantt = d3.gantt().taskTypes(taskNames).taskStatus(taskStatus).tickFormat(format);
		gantt(tasks);
    });
}

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}
//var query = getQueryParams(document.location.search);
//alert(query.foo);