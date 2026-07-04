document.addEventListener("DOMContentLoaded", function () {

const form = document.querySelector("form");

form.addEventListener("submit", function(e){

e.preventDefault();

alert("Thank you for contacting Advocate Pratibha Yadav. We will contact you shortly.");

form.reset();

});

});
