$(document).ready(function() {
    $.get("/todos", function(res) {
        $.each(res.todos, function(index, todo) {
            var todoLink = $("<a/>", {
                href : "/todos/" + todo.id,
                text : "delete",
                class: "Delete"
            });

            $("#todos").append($("<li>").text(todo.todos + " ").append(todoLink));
        });
    });

    $("#save_todo").click(function(event) {
        $.post("/todos", $("form").serialize(), function(res) {
            $("form input").val('');

            var todoLink = $("<a/>", {
                href : "/todos/" + res.id,
                text : "delete",
                class: "Delete"
            });

            $("#todos").append($("<li>").text(res.todo + " ").append(todoLink));
        });

        event.preventDefault();
    });
});

$(document).on("click", "a.Delete", function(event) {
    $.post($(this).attr('href'), function(res) {
        $('a[href="/todos/' + res.id + '"]').parent("li").remove();
    });

    event.preventDefault();
});
