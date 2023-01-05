function set_team_class(active_page_season, team) {
    const seasons = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    seasons.forEach(season_num => {
        instances = document.querySelectorAll(".team-active-" + season_num);

        /* Adding index number (i.e., team[0]) is a workaround in Jinja2;
        see seasons.html for more info. */
        instances.forEach(instance => {
            if ("season/" + number === active_page_season
                && team[0] === "damon") {
                instance.classList.add("damon");
            } else if ("season/" + number === active_page_season
                && team[0] === "felix") {
                instance.classList.add("felix");
            } else if ("season/" + number === active_page_season
                && team[0] === "ian") {
                instance.classList.add("ian");
            } else if ("season/" + number === active_page_season
                && team[0] === "benny") {
                instance.classList.add("benny");
            } else if ("season/" + number === active_page_season
                && team[0] === "peter") {
                instance.classList.add("peter");
            }
        });
    });
}


function set_aria_current() {
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
    })
}


if (typeof active_page_season !== "undefined") {
    window.addEventListener("DOMContentLoaded", set_team_class(active_page_season, team));
}
window.addEventListener("DOMContentLoaded", set_aria_current());

