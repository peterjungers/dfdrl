/*
JavaScript functions for DFDRL website
Author: Peter Jungers
Date: December 2022/January 2023
 */


// One function specific to index (leaderboard) page:


// Adds (R) to retired vehicles on vehicle leaderboard:
function setRetiredVehicles() {
    const tableRows = document.querySelector("#vehicle-leaderboard").rows;
    const retiredVehicles = ["Jeepster"];

    for (i = 0; i < tableRows.length; i++) {
        for (j = 0; j < retiredVehicles.length; j++) {
            if (tableRows[i].cells[0].innerHTML === retiredVehicles[j]) {
                tableRows[i].cells[0].innerHTML +=
                    "<span class='fw-normal fst-italic retired-font-size'> (R)</span>";
            }
        }
    }
}


// One function specific to season pages:


// Adds team CSS class to season links of respective team;
// active_page_season and team variables sent from seasons.html:
function setTeamClass() {
    const seasons = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    seasons.forEach(season_num => {
        instances = document.querySelectorAll(".team-active-" + season_num);

        /* Adding index number (i.e., team[0]) is a workaround in Jinja2;
        see seasons.html for more info. */
        instances.forEach(instance => {
            if ("season/" + season_num === active_page_season) {
                if (team[0] === "damon") {
                    instance.classList.add("damon");
                } else if (team[0] === "felix") {
                    instance.classList.add("felix");
                } else if (team[0] === "ian") {
                    instance.classList.add("ian");
                } else if (team[0] === "benny") {
                    instance.classList.add("benny");
                } else if (team[0] === "peter") {
                    instance.classList.add("peter");
                }
            }
        });
    });
}


// One sitewide function, but relies on setTeamClass() for season links:


function setAriaCurrent() {
    /* Sets aria-current for active navbar link. Active
    dropdown toggle link in navbar should not be aria-current,
    rather, active link within the dropdown should be (as set below): */
    a = document.querySelector(".nav-link.active");
    if (!a.classList.contains("dropdown-toggle")) {
        a.setAttribute("aria-current", "page");
    }

    /* Season links within navbar dropdown menu and sidebar: */
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


// The remaining functions are specific to vehicles.html:


// Adds count of vehicle row beneath "No." header in table at vehicles.html:
function addCountColumn() {
    const visibleRows = document.querySelectorAll(
        "#vehicle-table tbody tr:not(.hidden)");
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



// Set all table rows to selected team using "Select Team" button dropdown:
function getTeamRows() {
    const teamSelectDropdown = document.querySelectorAll(".team-select");
    let teamCSS;
    let team;

    teamSelectDropdown.forEach(teamOption => {
        teamOption.addEventListener("click", () => {
            if (teamOption.innerText === "All teams") {
                resetAllRows();
                teamCSS = "btn-other"; // Default, non-team, button styles
            } else {
                // The selected teamOption to lowercase equals team CSS class:
                teamCSS = teamOption.innerText.toLowerCase();
                resetTeamRows(teamCSS);
            }

            team = teamOption.innerText;
            setSelectedTeam(teamCSS, team);
            addCountColumn();
        });
    });
}



// Search for vehicle specified in text input field:
function findVehicle() {
    const selectedTeamBtn = document.querySelector("#selected-team-btn");
    const findVehicleBtn = document.querySelector("#find-vehicle-btn");
    const findVehicleInput = document.querySelector("#find-vehicle");
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
                        if (!cell.innerText.toLowerCase().includes(
                                findVehicleInput.value.toLowerCase())) {
                            cell.parentElement.classList.toggle("hidden");
                        }
                    }
                });
            } else {
                resetAllRows();
                // "All teams" search:
                vehicleNames.forEach(cell => {
                    if (!cell.innerText.toLowerCase().includes(
                            findVehicleInput.value.toLowerCase())) {
                        cell.parentElement.classList.toggle("hidden");
                    }
                });
            }
            addCountColumn();
        }
    });
}


/*
Finds all vehicles, or all specified team vehicles,
whose first season is the season specified in "First Season" dropdown:
 */
function firstSeason() {
    const seasonSelectDropdown = document.querySelectorAll(".season-select");
    const selectedTeamBtn = document.querySelector("#selected-team-btn");
    const firstSeason = document.querySelectorAll(".first-season");
    let teamCSS;

    seasonSelectDropdown.forEach(seasonOption => {
        seasonOption.addEventListener("click", () => {
            let seasonNum = seasonOption.innerText;
            teamCSS = getTeamCSS(selectedTeamBtn);

            if (selectedTeamBtn.classList.contains(teamCSS)) {
                resetTeamRows(teamCSS);
                // Individual team search:
                firstSeason.forEach(season => {
                    if (season.parentElement.classList.contains(teamCSS)) {
                        if (season.innerText !== seasonNum) {
                            season.parentElement.classList.toggle("hidden");
                        }
                    }
                });
            } else {
                resetAllRows();
                // "All teams" search:
                firstSeason.forEach(season => {
                    if (season.innerText !== seasonNum) {
                        season.parentElement.classList.toggle("hidden");
                    }
                });
            }
            addCountColumn();
        });
    });
}


/*
Used for four buttons: "Champions League Vehicles", champion "C",
second place "C", and third place "C"; for all teams
or specified individual team searches:
 */
function championsLeagueOptions() {
    const selectedTeamBtn = document.querySelector("#selected-team-btn");
    const championsLeagueVehiclesBtn =
        document.querySelector("#cl-vehicles-btn");
    const championBtn = document.querySelector("#champion-btn");
    const secondBtn = document.querySelector("#second-btn");
    const thirdBtn = document.querySelector("#third-btn");
    const championsLeagueVehicles = document.querySelectorAll(".cla");
    const champion = document.querySelectorAll(".champion");
    const second = document.querySelectorAll(".second");
    const third = document.querySelectorAll(".third");

    championsLeagueVehiclesBtn.addEventListener(
        "click", () => getRows(championsLeagueVehicles));
    championBtn.addEventListener("click", () => getRows(champion));
    secondBtn.addEventListener("click", () => getRows(second));
    thirdBtn.addEventListener("click", () => getRows(third));

    function getRows(place) {
        teamCSS = getTeamCSS(selectedTeamBtn);

        if (selectedTeamBtn.classList.contains(teamCSS)) {
            resetTeamRows(teamCSS);
            // Individual team search:
            place.forEach(cell => {
                if (cell.parentElement.classList.contains(teamCSS)) {
                    if (cell.innerText === "0") {
                        cell.parentElement.classList.toggle("hidden");
                    }
                }
            });
        } else {
            resetAllRows();
            // "All teams" search:
            place.forEach(cell => {
                if (cell.innerText === "0") {
                    cell.parentElement.classList.toggle("hidden");
                }
            });
        }
        addCountColumn();
    }
}


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
in order to do new search of all vehicles of selected team;
hide all rows of other teams:
*/
function resetTeamRows(teamCSS) {
    vehicleTableRows = document.querySelectorAll("#vehicle-table tbody tr");

    vehicleTableRows.forEach(row => {
        if (row.classList.contains(teamCSS)) {
            if (row.classList.contains("hidden")) {
                row.classList.toggle("hidden");
            }
        } else if (!row.classList.contains(`${teamCSS}`)) {
            row.classList.add("hidden");
        }
    });
}

// Resets table to original table:
function resetAllRows() {
    vehicleTableRows = document.querySelectorAll("#vehicle-table tbody tr");

    vehicleTableRows.forEach(row => {
        if (row.classList.contains("hidden")) {
            row.classList.toggle("hidden");
        }
    });
}


/*
Sets all button and "First Season" dropdown background colors to team CSS
and shows selected team text:
*/
function setSelectedTeam(teamCSS, team) {
    const selectedTeamBtn = document.querySelector("#selected-team-btn");
    const findVehicleBtn = document.querySelector("#find-vehicle-btn")
    const firstSeasonBtn = document.querySelector("#first-season-btn");
    const championsLeagueVehiclesBtn =
        document.querySelector("#cl-vehicles-btn");
    const seasonSelectDropdown = document.querySelectorAll(".season-select");
    const showSelectedTeam = document.querySelector("#show-selected-team");

    // Remove any set class from buttons:
    const teamCSSClasses =
        ["btn-other", "damon", "felix", "ian", "benny", "peter"];
    teamCSSClasses.forEach(teamCSSClass => {
        if (selectedTeamBtn.classList.contains(teamCSSClass)) {
            selectedTeamBtn.classList.remove(teamCSSClass);
        }
        if (findVehicleBtn.classList.contains(teamCSSClass)) {
            findVehicleBtn.classList.remove(teamCSSClass);
        }
        if (championsLeagueVehiclesBtn.classList.contains(teamCSSClass)) {
            championsLeagueVehiclesBtn.classList.remove(teamCSSClass);
        }
        if (firstSeasonBtn.classList.contains(teamCSSClass)) {
            firstSeasonBtn.classList.remove(teamCSSClass);
        }
    });

    // Remove any set class from "First Season" dropdown items:
    let teamItemCSS = "item-" + teamCSS;
    const seasonOptionCSS =
        ["item-other", "item-damon", "item-felix",
            "item-ian", "item-benny", "item-peter"];
    seasonOptionCSS.forEach(CSSOption => {
        seasonSelectDropdown.forEach(seasonOption => {
            if (seasonOption.classList.contains(CSSOption)) {
                seasonOption.classList.remove(CSSOption);
            }
        });
    });

    // Set selected team class for all elements:
    selectedTeamBtn.classList.add(teamCSS);
    findVehicleBtn.classList.add(teamCSS);
    firstSeasonBtn.classList.add(teamCSS);
    championsLeagueVehiclesBtn.classList.add(teamCSS);
    seasonSelectDropdown.forEach(seasonOption => {
        seasonOption.classList.add(teamItemCSS);
    });

    // Set team text:
    showSelectedTeam.innerHTML = team;
}


// For index (leaderboards) page, specifically the vehicle leaderboard:
if (document.querySelector("#vehicle-leaderboard")) {
    window.addEventListener("DOMContentLoaded", setRetiredVehicles)
}

// For season pages:
if (typeof active_page_season !== "undefined") {
    window.addEventListener(
        "DOMContentLoaded", setTeamClass);
}

// For sitewide navbar links, but also reliant on setTeamClass():
window.addEventListener("DOMContentLoaded", setAriaCurrent);

// For vehicles.html:
if (document.querySelector("#vehicle-table")) {
    window.addEventListener("DOMContentLoaded", addCountColumn);
    window.addEventListener("DOMContentLoaded", getTeamRows);
    window.addEventListener("DOMContentLoaded", findVehicle);
    window.addEventListener("DOMContentLoaded", firstSeason);
    window.addEventListener("DOMContentLoaded", championsLeagueOptions);
}
