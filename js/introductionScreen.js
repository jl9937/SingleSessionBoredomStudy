var fps = 20;
var now;
var then = Date.now();
var interval = 1000 / fps;
var delta;

function introductionScreen()
{
    $("#pid").focus();

    $("#copyToClipboard").click(function()
    {
        $("#linkBox")[0].select();
        document.execCommand("copy");
        $("#linkBox")[0].blur();
    });


    $("#pid").keyup(function()
    {
        var val = $(this)[0].value;
        if (val.length === 24)
        {
            $("#linkBox")[0].value = Main.URL + "/task.html?prolific_pid=" + val;
            $("#floatVal").css('visibility', 'hidden');
        }
        else if (val.length > 24)
        {
            $("#floatVal").css('visibility', 'visible');
            $("#linkBox")[0].value = "";
        }
        else if (val.length < 24)
        {
            $("#linkBox")[0].value = "";
        }
    });

    $("#submitProper").click(function()
    {
        if ($("#linkBox")[0].value !== "")
            window.location.href = $("#linkBox")[0].value;
    });
}