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
    team_headings = ("Team", "Points", "Total Cups",
                     "Champion", "Second", "Third")
    team_leaderboard = get_team_leaderboard()

    podium_headings = ("Season", "Champion", "Second", "Third")
    podium_results = get_podium_results()

    return render_template("index.html",
                           team_headings=team_headings,
                           team_leaderboard=team_leaderboard,
                           podium_headings=podium_headings,
                           podium_results=podium_results)


@main.route("/vehicles")
def vehicles():
    # Remember to add Count
    headings = ("Vehicle", "Team", "Weight(g)", "First Season",
                "Events", "Champion", "Second", "Third")
    table = db.session.execute(select(Vehicle).order_by(Vehicle.name))

    return render_template("vehicles.html", headings=headings, table=table)


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

    team_leaderboard = (db.session.execute(select
                       (Team, Vehicle, points, total_cups,
                        team_champion, team_second, team_third)
                       .filter(Team.id == Vehicle.team_id)
                       .group_by(Team.name)
                       .order_by(points.desc())
                       ))
    return team_leaderboard


def get_podium_results():
    seasons = db.session.execute(select(Season))
    podium_results = []

    def query(place):
        q = (db.session.execute(select
            (ChampionsLeagueResult, Vehicle)
            .filter(ChampionsLeagueResult.season_num
                        == season.Season.season_num,
                    ChampionsLeagueResult.place == place,
                    Vehicle.id == ChampionsLeagueResult.vehicle)
            ).first())
        return q

    for season in seasons:
        champion = query(1)
        second = query(2)
        third = query(3)

        podium_results.append({
            "season": season.Season.season_num,
            "champion": {"vehicle": champion.Vehicle.name,
                         "team": champion.Vehicle.team.name},
            "second": {"vehicle": second.Vehicle.name,
                       "team": second.Vehicle.team.name},
            "third": {"vehicle": third.Vehicle.name,
                      "team": third.Vehicle.team.name}
        })

    return podium_results
