function setTeamClass(active_page_season, team) {
    const seasons = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    seasons.forEach(season_num => {
        instances = document.querySelectorAll(".team-active-" + season_num);

        /* Adding index number (i.e., team[0]) is a workaround in Jinja2;
        see seasons.html for more info. */
        instances.forEach(instance => {
            if ("season/" + season_num === active_page_season
                && team[0] === "damon") {
                instance.classList.add("damon");
            } else if ("season/" + season_num === active_page_season
                && team[0] === "felix") {
                instance.classList.add("felix");
            } else if ("season/" + season_num === active_page_season
                && team[0] === "ian") {
                instance.classList.add("ian");
            } else if ("season/" + season_num === active_page_season
                && team[0] === "benny") {
                instance.classList.add("benny");
            } else if ("season/" + season_num === active_page_season
                && team[0] === "peter") {
                instance.classList.add("peter");
            }
        });
    });
}


function setAriaCurrent() {
    /* Sets aria-current for active navbar link. Active dropdown link
    in navbar should not be aria-current, rather, active link within
    the dropdown should be (as set below). */
    a = document.querySelector(".nav-link.active");
    if (!a.classList.contains("dropdown-toggle")) {
        a.setAttribute("aria-current", "page");
    }

    /* Season links within dropdown menu and sidebar */
    instances = document.querySelectorAll("a.btn");
    instances.forEach(instance => {
        if (instance.classList.contains("damon")
            || instance.classList.contains("felix")
            || instance.classList.contains("ian")
            || instance.classList.contains("benny")
            || instance.classList.contains("peter")) {
            instance.setAttribute("aria-current", "page");
        }
    });
}


function getTeamRows() {
    const teamSelect = document.querySelector("#team-select");

    teamSelect.addEventListener("change", () => {
        let rows = document.querySelectorAll("#vehicle-table tbody tr");

        if (teamSelect.options.selectedIndex === 0) { // "All teams"
            rows.forEach(row => {
                if (row.classList.contains("hidden")) {
                    row.classList.remove("hidden");
                }
            });
        } else {
            // The selected value to lowercase equals team CSS class:
            const team = teamSelect.value.toLowerCase();

            rows.forEach(row => {
                // Reset rows for all teams as to be visible:
                if (row.classList.contains("hidden")) {
                    row.classList.toggle("hidden");
                }
                // Hide all rows not containing selected team CSS class:
                if (!row.classList.contains(`${team}`)) {
                    row.classList.toggle("hidden");
                }
            });
        }
        addCountColumn();
    });
}


// Adds count of vehicle row beneath "No." header in table at vehicles.html:
function addCountColumn() {
    const visibleRows = document.querySelectorAll("#vehicle-table tbody tr:not(.hidden)");
    let count;

    if (visibleRows.length === 0) {
        count = 0;
    } else {
        const columnAmount = visibleRows[0].cells.length;

        if (columnAmount === 9) {
            visibleRows.forEach(row => {
                row.deleteCell(0);
            });
        }

        count = visibleRows.length;
        for (let c = 0; c < count; c += 1) {
            visibleRows[c].insertCell(0).innerText = c + 1;
        }
    }

    showCount(count);
}


function showCount(count) {
    const vehicleCount = document.querySelector("#vehicle-count");

    if (count === 0) {
        vehicleCount.innerText = "No results";
    } else {
        vehicleCount.innerText = count;
    }
}


function findVehicle() {
    const findVehicleInput = document.querySelector("#find-vehicle");
    const findVehicleBtn = document.querySelector("#find-vehicle-btn");

    findVehicleBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Enter key causes page to reload
        visibleVehicles = document.querySelectorAll(".vehicle-name");

        visibleVehicles.forEach(cell => {
            if (cell.parentElement.classList.contains("hidden")) {
                cell.parentElement.classList.toggle("hidden");
            }

            if (findVehicleInput.value !== "") {
                if (cell.innerText.toLowerCase() !== (findVehicleInput.value.toLowerCase())) {
                    cell.parentElement.classList.toggle("hidden");
                }
            }
        });

        addCountColumn();
        setTeamSelect();
    });
}


function clearFindVehicleInput() {
    const findVehicleInput = document.querySelector("#find-vehicle");
    const teamSelect = document.querySelector("#t");

    teamSelect.addEventListener("change", () => {
        findVehicleInput.value = "";
    });
}


function setTeamSelect() {
    const teamSelect = document.querySelector("#team-select");
    const teamName = document.querySelector("#vehicle-table tbody tr:not(.hidden) td.team-name");

    if (teamName) {
        teamSelect.value = teamName.innerText;
    }
}



if (typeof active_page_season !== "undefined") {
    window.addEventListener("DOMContentLoaded", setTeamClass(active_page_season, team));
}
window.addEventListener("DOMContentLoaded", setAriaCurrent());

if (document.URL.includes("vehicles")) {
    window.addEventListener("DOMContentLoaded", addCountColumn());
    window.addEventListener("DOMContentLoaded", getTeamRows());
    window.addEventListener("DOMContentLoaded", findVehicle());
    window.addEventListener("DOMContentLoaded", clearFindVehicleInput());
}




// const teams = document.querySelector("#team-btn")
// teams.addEventListener("click", () => {
//     getTeamRows()
// });