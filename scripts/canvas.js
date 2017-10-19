//var context = $("canvas")[0].getContext("webgl-experimental");
var canvas = $("canvas")[0];
var context = canvas.getContext("2d");
var w = $(".container").width();
var h = document.documentElement.clientHeight;
var dessin = false;
var start = null;
var progress = 0;
var myWorker = new Worker("scripts/myWorker.js");

var canvasItems = {
    "items": []
};

var clientServer = "emit";

$("input[type='radio']").change(function(){
    clientServer = $(this).val();
})

myWorker.postMessage(localStorage.getItem("canvas"));
context.moveTo(0, 0);
deserializeCanvasItems();

myWorker.onmessage = function (e) {
    moveLine(e.data.x, e.data.y, e.data.color, e.data.size);
}

$("canvas")[0].height = h;
$("canvas")[0].width = w;

$("input[type='color']").change(function () {
    context.strokeStyle = $(this).val();
})

$("input[type='range']").change(function () {
    var value = $(this).val();
    context.lineWidth = value;
    $("label").text(value);
})

$(canvas).mousemove(function (evt) {
    if (dessin)
        dessiner(evt.offsetX, evt.offsetY);
})

$(canvas).mousedown(function (evt) {
    dessin = true;
    context.beginPath();
    context.moveTo(evt.offsetX, evt.offsetY);
    requestAnimationFrame(repaint);
})

$(canvas).mouseup(function (evt) {
    dessin = false;
})

$(".btn[data-type='rect']").click(function () {
    createRect(
        Math.random() * w, Math.random() * h,
        Math.random() * 100,
        Math.random() * 100,
        "red", $(this).attr("data-color")
    );
})

$(".btn[data-type='line']").click(function () {
    createLine(
        Math.random() * w,
        Math.random() * h,
        Math.random() * w,
        Math.random() * h,
        $(this).attr("data-color")

    );
})

$(".btn.btn-default").click(function () {
    context.clearRect(0, 0, w, h);
    localStorage.removeItem("canvas");
})

/*****************Start socket********************* */
var client  = new WebSocket("ws://127.0.0.1:8080", 'echo-protocol');
 
client.onerror = function() {
    console.log('Connection Error');
};
 
client.onopen = function() {
    console.log('WebSocket Client Connected');
 
    // function sendNumber() {
    //     if (client.readyState === client.OPEN) {
    //         var number = Math.round(Math.random() * 0xFFFFFF);
    //         client.send(number.toString());
    //         setTimeout(sendNumber, 1000);
    //     }
    // }
    // sendNumber();
};
 
client.onmessage = function(e) {
    var obj = JSON.parse(e.data);
    console.log(obj)
        
    if(clientServer == "receive")
    {
        console.log("client")
        moveLine(obj.x, obj.y, obj.color, obj.size);
    }
};

 /***************End socket*************** */

function dessiner(x, y) {
    //debugger

    context.lineTo(x, y);
    context.stroke();
    var obj = {
        "point": {
            "x": x,
            "y": y,
            "time": progress,
            "color": context.strokeStyle,
            "size": context.lineWidth
        }
    }
    client.send(JSON.stringify(obj));
    serializeCanvasItems(obj);

}

function moveLine(x, y, color, size) {

    context.lineTo(x, y);
    context.strokeStyle = color;
    context.lineWidth = size;
    context.stroke();
}

function createRect(x, y, h, w, strokeColor, backgroundColor) {

    context.beginPath();
    var rect = {
        "rect": {
            "x": x,
            "y": y,
            "w": w,
            "h": h,
            "strokeColor": strokeColor,
            "backgroundColor": backgroundColor
        }
    };

    context.rect(x, y, h, w);
    context.fillStyle = backgroundColor;
    context.strokeStyle = strokeColor;
    context.lineWidth = "3";

    context.fill();
    context.stroke();

    serializeCanvasItems(rect);
}

function createLine(x1, y1, x2, y2, strokeColor) {

    context.beginPath();
    var line = {
        "line": {
            "x1": x1,
            "y1": y1,
            "x2": x2,
            "y2": y2,
            "strokeColor": strokeColor
        }
    };
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.strokeStyle = strokeColor;
    context.lineWidth = "3";
    context.stroke();

    serializeCanvasItems(line);
}

function serializeCanvasItems(obj) {
    canvasItems.items.push(obj);
    localStorage.setItem("canvas", JSON.stringify(canvasItems));
}

function deserializeCanvasItems() {
    if (localStorage.getItem("canvas") != null) {
        var items = JSON.parse(localStorage.getItem("canvas")).items;
        for (var key in items) {
            for (var keyTemp in items[key]) {
                var element = items[key][keyTemp];

                switch (keyTemp) {
                    case "rect":
                        createRect(element.x, element.y, element.h, element.w, element.strokeColor, element.backgroundColor);
                        break;
                    case "line":
                        createLine(element.x1, element.y1, element.x2, element.y2, element.strokeColor);
                        break;
                }
            }
        }
    }
}



function repaint(timestamp) {
    if (start === null) start = timestamp;
    progress = timestamp - start;

    if (dessin) {
        requestAnimationFrame(repaint);
    }
}

