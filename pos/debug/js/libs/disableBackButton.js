function backButtonOverride() {
    setTimeout("disableHistory()", 1);
}

function disableHistory() {
    try {
        history.forward();
    } catch (e) {

    }
    setTimeout("disableHistory()", 100);
    window.onunload = function () { null };
}

function disableBackButton(e) {
    var charCode = (e.which) ? e.which : event.keyCode
    var isTextbox = false;

    var isAllow = ($(e.target).attr('contenteditable') !== undefined && $(e.target).attr('contenteditable') !== false);

    if ($('input').is(':focus') || $('textarea').is(':focus') || isAllow) {
        isTextbox = true;
    }
    if (charCode === 8 && !isTextbox) {
        return false;
    }
}