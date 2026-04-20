//search for event to occur within document
document.addEventListener("DOMContentLoaded", function () {

    //const that selects all button elements with URLs
    const buttons = document.querySelectorAll("button[data-url]");


    //listen for click on each button
    buttons.forEach(button => {
        button.addEventListener("click", function () {

            //get URL attribute from the button clicked
            const targetUrl = button.getAttribute("data-url");

            //if there is a URL present, change webpage to the URL
            if(targetUrl) {
                window.location.href = targetUrl;
            }
        });
    });
});