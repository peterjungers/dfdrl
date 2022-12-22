from flask import Blueprint, render_template
from sqlalchemy import func, select
from sqlalchemy.orm import aliased

from dfdrl import db
from dfdrl.models import (Team, Vehicle, Season, EventType, Event,
                          ChampionsLeagueResult)


main = Blueprint("main", __name__)


@main.route("/")
@main.route("/index")
@main.route("/leaderboards")
def index():
    team_leaderboard = get_team_leaderboard()
    champions_leaderboard = get_champions_leaderboard()

    # for row in team_leaderboard:
    #     print(row.Team.name,
    #           row.points,
    #           row.total_cups,
    #           row.team_champion,
    #           row.team_second,
    #           row.team_third)
    # #
    for row in champions_leaderboard:
        print(row["season"], row["champion"]["vehicle"], row["second"]["vehicle"], row["third"]["vehicle"])

    return render_template("index.html",
                           team_leaderboard=team_leaderboard,
                           champions_leaderboard=champions_leaderboard)


@main.route("/vehicles")
def vehicles():
    table = db.session.execute(select(Vehicle).order_by(Vehicle.name))

    return render_template("vehicles.html", table=table)

    # for row in table:
    #     print(row.Vehicle.name,
    #           row.Vehicle.team.id,
    #           row.Vehicle.weight,
    #           row.Vehicle.first_season,
    #           row.Vehicle.event_appearances,
    #           row.Vehicle.champion,
    #           row.Vehicle.second,
    #           row.Vehicle.third)






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


def get_champions_leaderboard():
    seasons = db.session.execute(select(Season))
    champions_leaderboard = []

    def query(place):
        result = (db.session.execute(select
                 (ChampionsLeagueResult, Vehicle)
                 .filter(ChampionsLeagueResult.season_num
                         == season.Season.season_num,
                         ChampionsLeagueResult.place == place,
                         Vehicle.id == ChampionsLeagueResult.vehicle)
                 ).first())
        return result

    for season in seasons:
        champion = query(1)
        second = query(2)
        third = query(3)

        champions_leaderboard.append({
            "season": season.Season.season_num,
            "champion": {"vehicle": champion.Vehicle.name,
                         "team": champion.Vehicle.team.name},
            "second": {"vehicle": second.Vehicle.name,
                       "team": second.Vehicle.team.name},
            "third": {"vehicle": third.Vehicle.name,
                      "team": third.Vehicle.team.name}
        })

    return champions_leaderboard
