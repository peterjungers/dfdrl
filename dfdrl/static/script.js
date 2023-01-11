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
                teamCSS = "";
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
    const findVehicleBtn = document.querySelector("#find-vehicle-btn");
    const findVehicleInput = document.querySelector("#find-vehicle");
    const selectedTeamBtn = document.querySelector("#selected-team-btn");
    const vehicleTableRows = document.querySelectorAll("#vehicle-table tbody tr");
    const vehicleNames = document.querySelectorAll(".vehicle-name");
    let teamCSS;



    findVehicleBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Enter key causes page to reload

        if (selectedTeamBtn.classList.contains("damon")) {
            teamCSS = "damon";
        } else if (selectedTeamBtn.classList.contains("felix")) {
            teamCSS = "felix";
        } else if (selectedTeamBtn.classList.contains("ian")) {
            teamCSS = "ian";
        } else if (selectedTeamBtn.classList.contains("benny")) {
            teamCSS = "benny";
        } else if (selectedTeamBtn.classList.contains("peter")) {
            teamCSS = "peter";
        } else {
            // For "All teams" search:
            teamCSS = "";
        }

        if (findVehicleInput.value !== "") {
            if (selectedTeamBtn.classList.contains(teamCSS)) {
                /* Reset team rows to visible in order to
                search all vehicles of selected team: */
                vehicleTableRows.forEach(row => {
                    if (row.classList.contains(teamCSS)) {
                        if (row.classList.contains("hidden")) {
                            row.classList.toggle("hidden");
                        }
                    }
                });

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
                // "All teams" search:
                vehicleTableRows.forEach(row => {
                    if (row.classList.contains("hidden")) {
                        row.classList.toggle("hidden");
                    }
                });

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


function clearFindVehicleInput() {
    const findVehicleInput = document.querySelector("#find-vehicle");
    const teamSelect = document.querySelectorAll(".team-select");

    teamSelect.forEach(item => {
        item.addEventListener("click", () => {
            findVehicleInput.value = "";
        });
    });
}


function setSelectedTeam(teamCSS, team) {
    const selectedTeamBtn = document.querySelector("#selected-team-btn");
    const findVehicleBtn = document.querySelector("#find-vehicle-btn")
    const showSelectedTeam = document.querySelector("#show-selected-team");

    // https://stackoverflow.com/questions/54190763/if-classlist-contains-more-than-one-specific-class
    // const teamCSSClasses = ["damon", "felix", "ian", "benny", "peter"];
    // if (teamCSSClasses.some(teamCSSClass => selectedTeamBtn.classList.contains(teamCSSClass))) {
    //     console.log(teamCSSClasses);
    //     selectedTeamBtn.classList.remove(`${teamCSSClass}`);
    // }


    if (selectedTeamBtn.classList.contains("damon")) {
        selectedTeamBtn.classList.remove("damon");
    } else if (selectedTeamBtn.classList.contains("felix")) {
        selectedTeamBtn.classList.remove("felix");
    } else if (selectedTeamBtn.classList.contains("ian")) {
        selectedTeamBtn.classList.remove("ian");
    } else if (selectedTeamBtn.classList.contains("benny")) {
        selectedTeamBtn.classList.remove("benny");
    } else if (selectedTeamBtn.classList.contains("peter")) {
        selectedTeamBtn.classList.remove("peter");
    }

    if (findVehicleBtn.classList.contains("damon")) {
        findVehicleBtn.classList.remove("damon");
    } else if (findVehicleBtn.classList.contains("felix")) {
        findVehicleBtn.classList.remove("felix");
    } else if (findVehicleBtn.classList.contains("ian")) {
        findVehicleBtn.classList.remove("ian");
    } else if (findVehicleBtn.classList.contains("benny")) {
        findVehicleBtn.classList.remove("benny");
    } else if (findVehicleBtn.classList.contains("peter")) {
        findVehicleBtn.classList.remove("peter");
    }

    if (teamCSS !== "") {
        selectedTeamBtn.classList.add(`${teamCSS}`);
        findVehicleBtn.classList.add(`${teamCSS}`);
    }

    showSelectedTeam.innerHTML = team;
}


if (typeof active_page_season !== "undefined") {
    window.addEventListener("DOMContentLoaded", setTeamClass(active_page_season, team));
}
window.addEventListener("DOMContentLoaded", setAriaCurrent());

if (document.URL.includes("vehicles")) {
    window.addEventListener("DOMContentLoaded", addCountColumn());
    window.addEventListener("DOMContentLoaded", getTeamRows());
    window.addEventListener("DOMContentLoaded", findVehicle());
    // window.addEventListener("DOMContentLoaded", clearFindVehicleInput());
}
