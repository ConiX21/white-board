if(localStorage.length != 0)
{
    extractPerson();
}

$(".modal-body input[type='text']").keyup(function () {
    console.info($(this).val());

    setTimeout(loadDatasFromJsonDB, 500, $(this).val());
});

$("table").click(function (evt) {

    $(evt.target.parentNode).css(
        {
            "background-color": "red",
            "color": "white"
        }
    );

    $(evt.target.parentNode).siblings(evt.target.parentNode).css(
        {
            "background-color": "transparent",
            "color": "black"
        }
    );

    var objectPerson = "{";
    var cpt = 65;

    for (var key in evt.target.parentNode.childNodes)
    {
        var cur_child = evt.target.parentNode.childNodes[key];

        if (cur_child.nodeName == "#text" && $(cur_child.previousSibling).text() != "")
        {            
            objectPerson += "\"" + String.fromCharCode(cpt) + "\" : \"" + $(cur_child.previousSibling).text() + "\", ";
            cpt++;
        }
    }

    objectPerson = objectPerson.replace(/,\s*$/, "") + "}";
    var e = JSON.parse(objectPerson);


    localStorage.setItem("actualPerson" , objectPerson);

    // localStorage.getItem("");
    // localStorage.removeItem("");
    // localStorage.clear();

    // for(var i = 0; i < localStorage.length; i++)
    // {
    //     console.log(localStorage[i])
    // }


    console.log(e);

})

$(".modal-footer .btn.btn-primary").click(function(){
    extractPerson();

    $('#myModal').modal('hide');
})


$("#myModal").on("show.bs.modal", function(){
    $("table tbody").removeClass("wobble");
    $("table tbody").empty();
    $(".modal-body input[type='text']").val("");
});

function loadDatasFromJsonDB(value) {
    $.ajax({
        url: "http://localhost:4000/api/persons/search/" + value,
        method: "GET",
        async: true,
        cache: false,
        dataType: "json",
        success: function () {
            console.info("Query done !");
        },
        error: function () {
            console.error("Query failed !");
        },
        statusCode: {
            404: function () {
                console.warn("page not found");
            },
            505: function () {
                console.warn("page not found");
            }
        }
    }).done(function (datas) {
        var template = $("#templateRow").html();
        var render = Mustache.render(template, { "allRowsForPersonsDatas": datas });
        $(".none").html(render);
        $("table tbody").addClass("wobble");
    });
}


function extractPerson()
{
    var person = JSON.parse(localStorage.getItem("actualPerson"));

   if(person !== null)
        $("form input[type='text']:disabled").val(person.C);
}