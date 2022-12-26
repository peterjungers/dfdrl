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

    team_headings, team_leaderboard = get_team_leaderboard()
    podium_headings, podium_results = get_podium_results()
    vehicle_headings, vehicle_leaderboard = get_vehicle_leaderboard()
    event_headings, event_tallies = get_event_tallies()
    affiliate_headings, affiliates = get_affiliates()

    return render_template("index.html",
                           title=title,
                           team_headings=team_headings,
                           team_leaderboard=team_leaderboard,
                           podium_headings=podium_headings,
                           podium_results=podium_results,
                           vehicle_headings=vehicle_headings,
                           vehicle_leaderboard=vehicle_leaderboard,
                           event_headings=event_headings,
                           event_tallies=event_tallies,
                           affiliate_headings=affiliate_headings,
                           affiliates=affiliates)


@main.route("/season/<season_num>")
def season(season_num):
    title = f"Season {season_num}"

    season_headings, regular_season, champions_league = get_season(season_num)
    # cl stands for Champions League:
    cl_results_headings, cl_results = get_cl_results(season_num)

    return render_template("season.html",
                           title=title,
                           season_num=season_num,
                           season_headings=season_headings,
                           regular_season=regular_season,
                           champions_league=champions_league,
                           cl_results_headings=cl_results_headings,
                           cl_results=cl_results)


@main.route("/vehicles")
def vehicles():
    title = "Vehicles"

    # Remember to add Count
    headings = ("Vehicle", "Team", "Weight(g)", "First Season",
                "Events", "Champion", "Second", "Third")

    league_vehicles = db.session.execute(
                      select(Vehicle).order_by(Vehicle.name)
                      )

    return render_template("vehicles.html",
                           title=title,
                           headings=headings,
                           league_vehicles=league_vehicles)


def get_team_leaderboard():
    team_headings = ("Team", "Points", "Total Cups",
                     "Champion", "Second", "Third")

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

    return team_headings, team_leaderboard


def get_podium_results():
    podium_headings = ("Season", "Champion", "Second", "Third")

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

    return podium_headings, podium_results


def get_vehicle_leaderboard():
    vehicle_headings = ("Vehicle", "Team", "Events", "CLA",
                        "RRE", "Points", "Cups")

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

    return vehicle_headings, vehicle_leaderboard


def get_event_tallies():
    event_headings = ("Event", "Amount")

    event_sum = func.count(Event.type).label("event_sum")

    event_tally = db.session.execute(
                  select(EventType, event_sum)
                  .filter(EventType.id == Event.type)
                  .group_by(EventType.id)
                  .order_by(EventType.name)
                  )

    return event_headings, event_tally


def get_affiliates():
    affiliate_headings = ("Team", "Affiliate")
    affiliates = db.session.execute(select(Team))
    return affiliate_headings, affiliates


def get_season(season_num):
    season_headings = ("No.", "Event", "Date", "Winner", "Team")

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

    return season_headings, regular_season, champions_league


def get_cl_results(season_num):
    cl_results_headings = ("Place", "Vehicle", "Team", "Points")

    cl_results = db.session.execute(
                select(ChampionsLeagueResult, Vehicle)
                .filter(ChampionsLeagueResult.season_num == season_num,
                        ChampionsLeagueResult.vehicle == Vehicle.id)
                )

    return cl_results_headings, cl_results
