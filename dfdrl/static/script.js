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


// Adds count of vehicle row beneath "No." header in table at vehicles.html:
function addCountColumn() {
    const visibleRows = document.querySelectorAll("#vehicle-table tbody tr:not(.hidden)");
    let count;

    if (visibleRows.length === 0) {
        count = 0;
    } else {
        const columnAmount = visibleRows[0].cells.length;

        if (columnAmount === 10) {
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


function getTeamRows() {
    const teamSelect = document.querySelectorAll(".team-select");
    const rows = document.querySelectorAll("#vehicle-table tbody tr");
    let team;
    let teamCSS;

    teamSelect.forEach(teamOption => {
        teamOption.addEventListener("click", () => {
            if (teamOption.innerText === "All teams") {
                rows.forEach(row => {
                    if (row.classList.contains("hidden")) {
                        row.classList.remove("hidden");
                    }
                });
                teamCSS = "btn-other"; // Default, non-team, button styles
            } else {
                // The selected teamOption to lowercase equals team CSS class:
                teamCSS = teamOption.innerText.toLowerCase();

                rows.forEach(row => {
                    // Reset rows for all teams as to be visible:
                    if (row.classList.contains("hidden")) {
                        row.classList.toggle("hidden");
                    }
                    // Hide all rows not containing selected team CSS class:
                    if (!row.classList.contains(`${teamCSS}`)) {
                        row.classList.toggle("hidden");
                    }
                });
            }
            team = teamOption.innerText;
            setSelectedTeam(teamCSS, team);
            addCountColumn();
        });
    });
}


function findVehicle() {
    const findVehicleBtn = document.querySelector("#find-vehicle-btn");
    const findVehicleInput = document.querySelector("#find-vehicle");
    const selectedTeamBtn = document.querySelector("#selected-team-btn");
    const vehicleNames = document.querySelectorAll(".vehicle-name");
    let teamCSS;

    findVehicleBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Without this, Enter key causes page to reload

        teamCSS = getTeamCSS(selectedTeamBtn);

        if (findVehicleInput.value !== "") {
            if (selectedTeamBtn.classList.contains(teamCSS)) {
                resetTeamRows(teamCSS);
                /* For vehicles belonging to selected team,
                hide row (the cell's parent element) if vehicle name
                in table row doesn't match search input field: */
                vehicleNames.forEach(cell => {
                    if (cell.parentElement.classList.contains(teamCSS)) {
                        if (!cell.innerText.toLowerCase().includes(findVehicleInput.value.toLowerCase())) {
                            cell.parentElement.classList.toggle("hidden");
                        }
                    }
                });
            } else {
                resetAllRows();
                // "All teams" search:
                vehicleNames.forEach(cell => {
                    if (!cell.innerText.toLowerCase().includes(findVehicleInput.value.toLowerCase())) {
                        cell.parentElement.classList.toggle("hidden");
                    }
                });
            }
            addCountColumn();
        }
    });
}


function orderByWeight() {
    const weightBtn = document.querySelector("#weight-btn");
    const vehicleTable = document.querySelector("#vehicle-table");
    let switching = true;

    weightBtn.addEventListener("click", () => {
        // Run loop until no switching is needed
        while (switching) {
            switching = false;
            var rows = vehicleTable.rows;

            // Loop to go through all rows
            for (i = 1; i < rows.length - 1; i++) {
                var Switch = false;
                let dontSwitch = false;

                // Fetch 2 elements that need to be compared
                x = rows[i].getElementsByTagName("td")[3];
                y = rows[i + 1].getElementsByTagName("td")[3];

                // Check if 2 rows need to be switched
                if (x.innerHTML !== "Unknown") {
                    if (x.innerHTML < y.innerHTML) {

                        // If yes, mark Switch as needed and break loop
                        Switch = true;
                        break;
                    }
                }

            }
            if (Switch) {
                // Function to switch rows and mark switch as completed
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            } else {
                rows[i].parentNode.insertBefore(rows[i], rows[i + 1]);
                switching = true;
            }
        }
        addCountColumn();
    });
}


// function championsLeagueVehicle() {
//     const clVehiclesBtn = document.querySelector("#cl-vehicles-btn");
//     const vehicleTableRows = document.querySelectorAll("#vehicle-table tbody tr");
//     const cla = document.querySelectorAll(".cla");
//
//     clVehiclesBtn.addEventListener("click", () => {
//         cla.forEach(cell => {
//             if (cell.innerText === "0") {
//                 cell.parentElement.classList.toggle("hidden");
//             }
//         });
//         addCountColumn();
//     });
// }


function getTeamCSS(button) {
    if (button.classList.contains("damon")) {
        teamCSS = "damon";
    } else if (button.classList.contains("felix")) {
        teamCSS = "felix";
    } else if (button.classList.contains("ian")) {
        teamCSS = "ian";
    } else if (button.classList.contains("benny")) {
        teamCSS = "benny";
    } else if (button.classList.contains("peter")) {
        teamCSS = "peter";
    } else {
        // For "All teams" search:
        teamCSS = "";
    }

    return teamCSS;
}


/*
For a selected team, reset all team rows to visible
in order to do new search of all vehicles of selected team:
*/
function resetTeamRows(teamCSS) {
    vehicleTableRows = document.querySelectorAll("#vehicle-table tbody tr");

    vehicleTableRows.forEach(row => {
        if (row.classList.contains(teamCSS)) {
            if (row.classList.contains("hidden")) {
                row.classList.toggle("hidden");
            }
        }
    });
}


function resetAllRows() {
    vehicleTableRows = document.querySelectorAll("#vehicle-table tbody tr");

    vehicleTableRows.forEach(row => {
        if (row.classList.contains("hidden")) {
            row.classList.toggle("hidden");
        }
    });
}


/*
Sets all button background colors to team CSS
and shows selected team text:
*/
function setSelectedTeam(teamCSS, team) {
    const selectedTeamBtn = document.querySelector("#selected-team-btn");
    const findVehicleBtn = document.querySelector("#find-vehicle-btn")
    const showSelectedTeam = document.querySelector("#show-selected-team");

    const teamCSSClasses = ["btn-other", "damon", "felix", "ian", "benny", "peter"];
    teamCSSClasses.forEach(teamClass => {
        if (selectedTeamBtn.classList.contains(teamClass)) {
            selectedTeamBtn.classList.remove(teamClass);
        }
        if (findVehicleBtn.classList.contains(teamClass)) {
            findVehicleBtn.classList.remove(teamClass);
        }
    });

    selectedTeamBtn.classList.add(`${teamCSS}`);
    findVehicleBtn.classList.add(`${teamCSS}`);

    showSelectedTeam.innerHTML = team;
}


// Sitewide
if (typeof active_page_season !== "undefined") {
    window.addEventListener("DOMContentLoaded", setTeamClass(active_page_season, team));
}
window.addEventListener("DOMContentLoaded", setAriaCurrent());

// vehicles.html
if (document.URL.includes("vehicles")) {
    window.addEventListener("DOMContentLoaded", addCountColumn());
    window.addEventListener("DOMContentLoaded", getTeamRows());
    window.addEventListener("DOMContentLoaded", findVehicle());
    window.addEventListener("DOMContentLoaded", orderByWeight());
    // window.addEventListener("DOMContentLoaded", championsLeagueVehicle());
}
