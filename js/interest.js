const storedKeys = "savedRoles";

let savedRoleIds = [];

function loadSavedRoleIds(){
    try{
        const stored = JSON.parse(localStorage.getItem(storedKeys));
        if (!Array.isArray(store)){
            return[];
        }
        return stored.filter(function(id){
            return volunteer_roles.some(function(role){
                return role.id === id;
            });
        });
    } catch(error){
        return[];
    }
}

function storeSavedRoleIds(){
    try{
        localStorage.setItem(storedKeys, JSON.stringify(savedRoleIds));
    } catch(error){}
}

function findRole(id){
    return volunteer_roles.find(function(role){
        return role.id === id;
    });
}

function isSaved(id){
    return savedRoleIds.includes(id);
}

function getSavedRoles(){
    return savedRoleIds.map(findRole);
}

function toggleRole(id){
    if (isSaved(id)){
        savedRoleIds = savedRoleIds.filter(function(savedId){
            return savedId !== id;
        });
    } else{
        savedRoleIds.push(id);
    }
    storeSavedRoleIds();
}

function clearRoles(){
    savedRoleIds = [];
    storeSavedRoleIds();
}

function formatRoleNames(roles){
    const names = roles.map(function(role){
        return role.title;
    });
    if (names.length <= 1){
        return names.join("");
    }
    return names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}

function findVolunteerSection(){
    const headings = document.querySelectorAll("h2");
    for (let i = 0; i < headings.length; i++){
        if (headings[i].textContent.toLowerCase().includes("volunteer")){
            return headings[i].closest("selection") || headings[i].parentElement;
        }
    }
    return null;
}

function findRoleHeading(section, role){
    const headings = section.querySelectorAll("h3");
    for (let i = 0; i < headings.length; i++){
        if (headings[i].textContent.toLowerCase().includes(role.match)){
            return headings[i];
        }
    }
    return null
}

function createSaveButton(role){
    const button = document.createElement("button");
    button.type = "button";
    button.className = "save-role";
    button.dataset.roleId = role.id;
    button.setAttribute("aria-pressed", "false");
    button.textContent = "Save the role";
    return button;
}

function addSaveButtons(section){
    let added = 0
    volunteer_roles.foreach(function(role){
        const heading = findRoleHeading(section, role);
        if (!heading){
            return;
        }
        added++;
        let anchor = heading.nextElementSibling;
        if (!anchor || anchor.tagName !== "P"){
            anchor = heading;
        }
        anchor.insertAdjacentElement("afterend", createSaveButton(role));
    });
    return added
}

function createSavedPanel(selection){
    const panel = document.createElement("div");
    panel.className = "save-panel";
    panel.id = "save-panel";
    panel.innerHTML =
    '<h3 id="saved-heading">Saved Volunteer Role</h3>' +
    '<p id="saved-summary" aria-live="polite></p>' +
    'ul id="saved-list"></ul>' +
    '<p class="form-actions">' +
    '<a class="button" href="contact.html">Continue to Interest Form</a>' +
    '<button type="button" id="clear-roles">Clear all</button>' +
    "</p>";
    const applyLink = section.querySelectorAll('a[href$="contact.html"]');
    if (applyLink){
        (applyLink.closest("p") || applyLink).insertAdjacentElement("beforebegin", panel);
    } else{
        section.appendChild(panel);
    }
}

function updateRoleButtons(){
    document.querySelectorAll(".save-role").forEach(function(button){
        const saved = isSaved(button.dataset.roleId);
        button.setAttribute("aria-pressed", String(saved));
        button.textContent = saved 
    })
}

function renderSavedList(){
    const list = document.getElementById("saved-list");
    const summary = document.getElementById("save-summary");
    const clearButton = document.getElementById("clear-roles");
    const roles = getSavedRoles();
    list.innerHTML = "";

    if (roles.length === 0){
        summary.textContent = "There are no saved roles.";
        clearButton.hidden = true;
        return;
    }
    const word = roles.length === 1 ? "role" : "roles";
}