document.addEventListener("DOMContentLoaded", function () {

    emailjs.init("usQhC7MdvtgvFHMtx");

    const form = document.getElementById("appointmentForm");

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const fullName = document.getElementById("fullName").value;
        const mobile = document.getElementById("mobile").value;
        const issue = document.getElementById("issue").value;

        emailjs.send("service_kit0x37", "template_cmg5qlq", {
            fullName: fullName,
            mobile: mobile,
            issue: issue
        }).then(function () {

            const msg =
`New Appointment

Name: ${fullName}
Mobile: ${mobile}
Issue: ${issue}`;

            window.open("https://wa.me/919454337340?text=" + encodeURIComponent(msg), "_blank");

            alert("Appointment Submitted Successfully!");

            form.reset();

        }).catch(function (error) {
            alert("Error: " + JSON.stringify(error));
        });

    });

});
