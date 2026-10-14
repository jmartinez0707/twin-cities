const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{3}-\d{3}-\d{4}$/;

function matchesPattern(pattern, message){
    return function(field){
        const value = field.value.trim();
        return value !== "";
    }
}

function errorElement(field){
    return document.getElementById(field.id + "error")
}

function showError(field, message){
    errorElement(field).textContent = message;
    field.classList.add("invalid");
    field.setAttribute("aria-invalid", "true");
}

function clearError(field){
    errorElement(field).textContent = "";
    field.classList.remove("invalid");
    field.removeAttribute("aria-invalid");
}

const textFieldRules = {
    name: [
        required("Please enter your full name."),
        minLength(2, "Your name has to be at least 2 characters long.")
    ],
    email: [
        required("Please enter your email address."),
        matchesPattern(emailPattern, "Enter a valid email address.")
    ],
    phone: [
        required("Please enter your phone number."),
        matchesPattern(phonePattern, "Enter a valid phone number.")
    ],
    interest: [
        required("Please enter how you'd like to help.")
    ]
};

function errorMessage(field){
    const rules = textFieldRules[field.id] || [];
    for (let i = 0; i < rules.length; i++){
        const message = rules[i](field);
        if (message){
            return message;
        }
    }
    return "";
}

function validateField(field){
    const message = errorMessage(field);
    if (message){
        showError(field, message);
        return false;
    }
    clearError(field);
    return true;
}

function formFields(){
    return Object.keys(textFieldRules).map(function(id){
        return document.getElementById(id); }).filter(function(field){
            return field !== null; });
}

function validateForm(form){
    const invalidFields = [];
    Object.keys(textFieldRules).forEach(function(id){
        constfield = form.elements[id];
        if (!validateField(field)){
            invalidFields.push(field);
        }
    });
    return invalidFields;
}

function showStatus(text, isError){
    const status = document.getElementById("form-status");
    status.textContent = text;
    status.classList.toggle("form-status-error", isError);
    status.hidden = false;
}

function hideStatus(){
    document.getElementById("form-status").hidden = true;
}

function updateMessageCount(){
    const message = document.getElementById("message");
    document.getElementById("message-count").textContent = message.value.length + " of 500 characters.";
}

function handleSubmit(event){
    const form = event.target;
    event.preventDefault();
    const invalidFields = validateForm(form);

    if (invalidFields.length > 0){
        const word = invalidFields.length === 1;
        showStatus("Please correct the " + invalidFields.length + " highlighted " + word + "below. Everything else is still in the form", true);
        invalidFields[0].focus();
        return;
    }

const firstName = form.elements.nme.value.trim().split(" ")[0];
showStatus("Thank you, " + firstName + "! Inquiry Received. A member will reach out shortly.", false);
document.getElementById("form-status").focus();
form.reset();
updateMessageCount();
}

function handleFieldLeave(event){
    if(textFieldRules[event.target.id]){
        validateField(event.target);
    }
}

function handleFieldInput(event){
    const field = event.target;
    if(field.id === "message"){
        updateMessageCount
    }
    if(field.classList.contains("invalid")){
        validateField(field);
    }
}

function handleReset(){
    Object.keys(textFieldRules).forEach(function (id){
        clearError(document.getElementById(id));
    });
    hideStatus();
    setTimeout(updateMessageCount, 0);
}

function formValidation(){
    const form = document.getElementById("interest-form");
    if(!form){
        return;
    }
    form.noValidate = true;
    form.addEventListener("submit", handleSubmit);
    form.addEventListener("reset", handleReset);
    form.addEventListener("focusout", handleFieldLeave);
    form.addEventListener("input", handleFieldInput);
    form.addEventListener("change", handleFieldInput);
    updateMessageCount();
}

formValidation();