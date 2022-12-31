function set_team_class(active_page_season, team) {
    const seasons = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    seasons.forEach(number => {
        instances = document.querySelectorAll(".team-active-" + number);

        instances.forEach(instance => {
            if ("season/" + number === active_page_season
                && team[0] === "damon") {
                instance.classList.add("damon");
                instance.setAttribute("aria-current", "page")
            } else if ("season/" + number === active_page_season
                && team[0] === "felix") {
                instance.classList.add("felix");
                instance.setAttribute("aria-current", "page")
            } else if ("season/" + number === active_page_season
                && team[0] === "ian") {
                instance.classList.add("ian");
                instance.setAttribute("aria-current", "page")
            } else if ("season/" + number === active_page_season
                && team[0] === "benny") {
                instance.classList.add("benny");
                instance.setAttribute("aria-current", "page")
            } else if ("season/" + number === active_page_season
                && team[0] === "peter") {
                instance.classList.add("peter");
                instance.setAttribute("aria-current", "page")
            }
        });
    });
}

// Can you have set_team_class use this for setting aria?
// You have both Season active and aria-current and season[num] active as well—need to make Seasons active (highlighted) but not aria-current
function set_aria_current() {
    a = document.querySelector(".active");

    if (a.classList.contains("active")) {
        a.setAttribute("aria-current", "page")
    }
}

window.addEventListener("load",
    set_team_class(active_page_season, team),
    set_aria_current());







