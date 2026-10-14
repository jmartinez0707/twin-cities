const storedKeys = {
    preference: "twinCitiesPreference",
    contact: "twinCitiesContact"
};

const preferenceLabel = {
    both: "Cats and Dogs",
    cats: "Cats",
    dogs: "Dogs"
};

const volunteerRoles = [
    {
        title: "Dog Walker | Canine Socializer",
        description: "Walks dogs, runs playgroups, and provides on leash exercise and mental stimulation.",
        animals: ["dogs"] 
    },
    {
        title: "Cat Socializer | Feline Friend",
        description: "Spends time petting, grooming and playing with cats to reduce stress and improve adoptability.",
        animals: ["cats"]
    },
    {
        title: "Animal Caregiver",
        description: "Cleans enclosures.",
        animals: ["cats", "dogs"]
    },
    {
        title: "Animal Transport",
        description: "Take in house animals to veterinary appointments and adoption events.",
        animals: ["cats", "dogs"]
    }
];

function saveToStorage(key, value){
    try{
        localStorage.setItem(key, JSON.stringify(value));
    } catch(error){
        console.warn("Could not save to localStorage", error);
    }
}

function loadFromStorage(key, fallback){
    try{
        const raw = localStorage.getItem(key);
        if (raw){
            return JSON.parse(raw);
        } else{
            return fallback
        }
    } catch(error){
        return fallback;
    }
}

function getSavedPreference(){
    const saved = loadFromStorage(storedKeys.preference, "all");
    if (preferenceLabel[saved]){
        return saved;
    } else{
        return "all";
    }
}

function filterRoles(preference){
    if (preference === "all"){
        return volunteerRoles;
    }
    return volunteerRoles.filter(function(role){
        return role.animals.includes(preference);
    });
}










function createRoleElement(role){
    const wrapper = document.createElement("div");
    const heading = document.createElement("h3");
    const description = document.createElement("p");

    heading.textContent = role.title;
    description.textContent = role.description

    wrapper.append(heading, description);
    return wrapper;
}

function renderRoles(preference){
    const container = document.getElementById("volunteer-roles");
    const status = document.getElementById("roles-status");
    if (!container) return;

    const matches = filterRoles(preference);
    container.replaceChildren(...matches.map(createRoleElement));

    if (status){
        status.textContent = "Showing " + matches.length + " of " + volunteerRoles.length + 
        " volunteer roles for: " + preferenceLabel[preference] + ".";
    }
}


function handleRoleFilterChange(event){
    const preference = event.target.value;
    saveToStorage(storedKeys.preference, preference);
    renderRoles(preference);
}

function initRoleFilter(){
    const select = document.getElementById("role-filter");
    if (!select) return;

    const preference = getSavedPreference();
    select.value = preference;
    renderRoles(preference);
    select.addEventListener("change", handleRoleFilterChange);
}





const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^\d{3}-\d{3}-\d{4}$/;


const fieldValidators = {
    name: function(value){
        if (value.trim() === "") return "Please enter your full name.";
        if (value.trim().length < 2) return "Your name should be at least 2 characters.";
        if (value.length > 100) return "Your name must be 100 characters or less.";
        return "";
    },
    phone: function(value){
        if (value.trim() === "") return "";
        if (!this.phonePattern.test(value.trim())) return "Use the format XXX-XXX-XXXX.";
        return "";
    },
    email: function(value){
        if (value.trim() === "") return "Please enter your email address.";
        if (!emailPattern.test(value.trim())) return "Enter a valid email address.";
        return "";
    },
    interest: function(value){
        if (value === "") return "Let us know how you would like to help.";
        return "";
    }
};

function getErrorElement(field){
    const errorId = field.id + "-error";
    let error = document.getElementById(errorId);

    if (!error){
        error = document.createElement("span");
        error.id = errorId;
        error.className = "error-message";
        field.insertAdjacentElement("afterend", error);
    }
    return error;
}

function showError(field, message){
    const error = getErrorElement(field);
    error.textContent = message;
    field.classList.add("invalid");
    field.setAttribute("aria-invalid", "true");
    field.setAttribute("aria-describedby", error.id);
}

function clearError(field){
    const error = getErrorElement(field);
    error.textContent = "";
    field.classList.remove("invalid");
    field.removeAttribute("aria-invalid");
}

function validateField(field){
    const validator = fieldValidators[field.id];
    if (!validator) return true;

    const message = validator(field.value);
    if (message){
        showError(field, message);
        return false;
    }
    clearError(field);
    return true;
}

function validateForm(form){
    let firstInvalid = null;

    Object.keys(fieldValidators).forEach(function (id){
        const field = form.querySelector("#" + id);
        if (field && !validateField(field) && !firstInvalid){
            firstInvalid = field;
        }
    });

    if (firstInvalid) firstInvalid.focus();
    return firstInvalid === null;
}



function saveContactInfo(form){
    saveToStorage(storedKeys.contact, {
        name: form.querySelector("#name").value.trim(),
        phone: form.querySelector("#phone").value.trim(),
        email: form.querySelector("#email").value.trim()
    });
}

function prefillContactInfo(form){
    const saved = loadFromStorage(storedKeys.contact, null);
    if (!saved) return;

    ["name", "phone", "email"].forEach(function (id){
        const field = form.querySelector("#" + id);
        if (field && saved[id]) field.value = saved[id];
    });
}

function getStatusElement(form){
    let status = document.getElementById("form-status");
    if (!status) {
        status = document.createElement("p");
        status.id = "form-status";
        status.setAttribute("role", "status");
        form.insertAdjacentElement("afterend", status);
    }
    return status;
}

function handleSubmit(event){
    event.preventDefault();
    const form = event.target;
    const status = getStatusElement(form);

    if (!validateForm(form)){
        status.textContent = "Please fix highlighed fields.";
        status.className = "form-status error";
        return;
    }

    saveContactInfo(form);
    const name = form.querySelector("#name").value.trim();
    status.textContent = "Thank you " + name + "! We will reach out shortly.";
    status.className = "form-status success";
}


function handleReset(event){
    const form = event.target;
    form.querySelectorAll(".invalid").forEach(clearError);
    getStatusElement(form).textContent = "";
}

function initContactForm(){
    const form = document.querySelector("form");
    const animalPreference = document.getElementById("animal-preference");
    if (!form) return;

    form.setAttribute("novalidate", "");

    prefillContactInfo(form);


    if (animalPreference){
        animalPreference.value = getSavedPreference();
        animalPreference.addEventListener("change", function (){
            saveToStorage(storedKeys.preference, animalPreference.value);
        });
    }


    Object.keys(fieldValidators).forEach(function (id){
        const field = form.querySelector("#" + id);
        if (!field) return;

        field.addEventListener("blur", function (){ validateField(field); });
        field.addEventListener("input", function (){
            if (field.classList.contains("invalid")) validateField(field);
        });
        field.addEventListener("change", function (){
            if (field.classList.contains("invalid")) validateField(field);
        });
    });

    form.addEventListener("submit", handleSubmit);
    form.addEventListener("reset", handleReset);
}

document.addEventListener("DOMContentLoaded", function (){
    initRoleFilter();
    initContactForm();
});