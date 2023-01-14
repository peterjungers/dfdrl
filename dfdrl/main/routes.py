from flask import Blueprint, render_template
from sqlalchemy import func, select

from dfdrl import db
from dfdrl.models import (Team, Vehicle, Season, EventType, Event,
                          ChampionsLeagueResult)


main = Blueprint("main", __name__)


@main.route("/")
@main.route("/index")
@main.route("/leaderboards")
def index():
    title = "Leaderboards"

    team_leaderboard = get_team_leaderboard()
    podium_results = get_podium_results()
    vehicle_leaderboard = get_vehicle_leaderboard()
    event_tallies = get_event_tallies()
    affiliates = get_affiliates()

    return render_template("index.html",
                           title=title,
                           team_leaderboard=team_leaderboard,
                           podium_results=podium_results,
                           vehicle_leaderboard=vehicle_leaderboard,
                           event_tallies=event_tallies,
                           affiliates=affiliates)


@main.route("/season/<season_num>")
def season(season_num):
    title = f"Season {season_num}"

    season_duration = get_season_duration(season_num)
    regular_season, champions_league = get_season(season_num)
    # cl stands for Champions League:
    cl_results, champion = get_cl_results(season_num)

    return render_template("season.html",
                           title=title,
                           season_num=season_num,
                           season_duration=season_duration,
                           regular_season=regular_season,
                           champions_league=champions_league,
                           cl_results=cl_results,
                           champion=champion)


@main.route("/vehicles")
def vehicles():
    title = "Vehicles"
    # Count of all Champions League Appearances (CLA):
    cla = func.count(ChampionsLeagueResult.vehicle).label("cla")


    league_vehicles = db.session.execute(
                      select(Vehicle, cla)
                      .outerjoin(ChampionsLeagueResult)
                      .group_by(Vehicle.id)
                      .order_by(Vehicle.name)
                      )

    return render_template("vehicles.html",
                           title=title,
                           league_vehicles=league_vehicles)


@main.route("/about")
def about():
    title = "About"

    affiliates = get_affiliates()

    return render_template("about.html", title=title,
                           affiliates=affiliates)


def get_team_leaderboard():
    points = func.sum((Vehicle.champion * 3)
                      + (Vehicle.second * 2)
                      + Vehicle.third).label("points")
    total_cups = func.sum(Vehicle.champion
                          + Vehicle.second
                          + Vehicle.third).label("total_cups")
    team_champion = func.sum(Vehicle.champion).label("team_champion")
    team_second = func.sum(Vehicle.second).label("team_second")
    team_third = func.sum(Vehicle.third).label("team_third")

    team_leaderboard = db.session.execute(
                       select(Team, Vehicle, points, total_cups,
                              team_champion, team_second, team_third)
                       .filter(Team.id == Vehicle.team_id)
                       .group_by(Team.name)
                       .order_by(points.desc())
                       )

    return team_leaderboard


def get_podium_results():
    seasons = db.session.execute(select(Season))
    podium_results = []

    def query(place):
        q = db.session.execute(
            select(ChampionsLeagueResult, Vehicle)
            .filter(ChampionsLeagueResult.season_num
                        == season.Season.season_num,
                    ChampionsLeagueResult.place == place,
                    Vehicle.id == ChampionsLeagueResult.vehicle)
            ).first()
        return q

    for season in seasons:
        champion = query(1)
        second = query(2)
        third = query(3)

        # Ordered most recent season to oldest
        podium_results.insert(0, {
            "season": season.Season.season_num,
            "champion": {"vehicle": champion.Vehicle.name,
                         "team": champion.Vehicle.team.name},
            "second": {"vehicle": second.Vehicle.name,
                       "team": second.Vehicle.team.name},
            "third": {"vehicle": third.Vehicle.name,
                      "team": third.Vehicle.team.name}
        })

    return podium_results


def get_vehicle_leaderboard():
    # Count of all Champions League Appearances (CLA):
    cla = func.count(ChampionsLeagueResult.vehicle).label("cla")

    # Points earned for podium finish:
    points = (func.sum(Vehicle.champion * 3
                       + Vehicle.second * 2
                       + Vehicle.third)
                       / cla).label("points")

    # Calculates Ratio of Racing Excellence (RRE)
    # (points / event appearances):
    rre = (func.sum(Vehicle.champion * 3.0
                    + Vehicle.second * 2.0
                    + Vehicle.third)
                    / cla
                    / Vehicle.event_appearances
                    * 2).label("rre")

    vehicle_leaderboard = db.session.execute(
                          select(Vehicle, cla, points, rre)
                          .filter(Vehicle.id == ChampionsLeagueResult.vehicle)
                          .group_by(Vehicle.id)
                          .order_by(points.desc(),
                                    rre.desc(),
                                    cla,
                                    Vehicle.name)
                          )

    return vehicle_leaderboard


def get_event_tallies():
    event_sum = func.count(Event.type).label("event_sum")

    event_tally = db.session.execute(
                  select(EventType, event_sum)
                  .filter(EventType.id == Event.type)
                  .group_by(EventType.id)
                  .order_by(EventType.name)
                  )

    return event_tally


def get_affiliates():
    affiliates = db.session.execute(select(Team))
    return affiliates


def get_season_duration(season_num):
    # Gets both Regular Season and Champions League events:
    racing_season = db.session.execute(
                    select(Event)
                    .filter(Event.season_num == season_num)
                    )
    dates = []
    for row in racing_season:
        dates.append(row.Event.date)

    def get_season_name(year):
        if (year.month, year.day) < (3, 20):
            season_name = "Winter"
        elif (year.month, year.day) < (6, 17):
            season_name = "Spring"
        elif (year.month, year.day) < (9, 21):
            season_name = "Summer"
        elif (year.month, year.day) < (12, 21):
            season_name = "Fall"
        return season_name

    date_start = min(dates)
    season_name_start = get_season_name(date_start)
    date_end = max(dates)
    season_name_end = get_season_name(date_end)

    if (date_start.year == date_end.year
        and season_name_start == season_name_end):
        # eg, Summer 2020:
        season_duration = f"{season_name_start} {date_start.year}"
    elif date_start.year == date_end.year:
        # eg, Summer–Fall 2020
        season_duration = (f"{season_name_start}–"
                           f"{season_name_end} {date_start.year}")
    elif date_start.year != date_end.year:
        # eg, Fall 2020–Winter 2021:
        season_duration = (f"{season_name_start} {date_start.year}–"
                           f"{season_name_end} {date_end.year}")

    return season_duration


def get_season(season_num):
    def query(boolean):
        q = db.session.execute(
            select(Event, Vehicle)
                .filter(Event.season_num == season_num,
                        Event.winner == Vehicle.id,
                        Event.champions_league == boolean)
        )
        return q

    regular_season = query(False)
    champions_league = query(True)

    return regular_season, champions_league


def get_cl_results(season_num):
    cl_results = db.session.execute(
                 select(ChampionsLeagueResult, Vehicle)
                 .filter(ChampionsLeagueResult.season_num == season_num,
                         ChampionsLeagueResult.vehicle == Vehicle.id)
                 )

    champion = db.session.execute(
               select(ChampionsLeagueResult, Vehicle)
               .filter(ChampionsLeagueResult.season_num == season_num,
                      ChampionsLeagueResult.vehicle == Vehicle.id,
                      ChampionsLeagueResult.place == 1)
               ).all()

    return cl_results, champion
