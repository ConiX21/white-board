function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

onmessage = function (e) {
    var workerResult = JSON.parse(e.data);
    console.log(workerResult)
    
    for (var i = 1; i < workerResult.items.length; i++) {
        //console.log(workerResult.items[i].point.time - workerResult.items[i-1].point.time)

        sleep(workerResult.items[i].point.time - workerResult.items[i -1].point.time);
        //start = workerResult.items[i - 1].time - start;
        postMessage(workerResult.items[i].point);
    }
}



