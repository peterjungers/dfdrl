from flask import current_app

from dfdrl import db


class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20))
    affiliate = db.Column(db.String(50))

    vehicles = db.relationship("Vehicle", back_populates="team")

    def __repr__(self):
        return (f"<id = {self.id}, "
                f"name = {self.name}, "
                f"affiliate = {self.affiliate}>")


class Vehicle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    team_id = db.Column(db.Integer, db.ForeignKey("team.id"))
    weight = db.Column(db.Integer)
    first_season = db.Column(db.Integer)
    # event_appearances includes all Regular Season and
    # Champions League events:
    event_appearances = db.Column(db.Integer)
    # champion, second, and third variables are tallies for each occurrence,
    # not the points earned for those occurrences:
    champion = db.Column(db.Integer)
    second = db.Column(db.Integer)
    third = db.Column(db.Integer)

    team = db.relationship("Team", back_populates="vehicles")

    def __repr__(self):
        return (f"<id = {self.id}, "
                f"name = {self.name}, "
                f"team_id = {self.team_id}, "
                f"weight = {self.weight}, "
                f"first_season = {self.first_season} ,"
                f"event_appearances = {self.event_appearances}, "
                f"champion = {self.champion}, "
                f"second = {self.second}, "
                f"third = {self.third}>")


class Season(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    season_num = db.Column(db.Integer)

    def __repr__(self):
        return f"<id = {self.id}, season_num = {self.season_num}>"


class EventType(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))

    def __repr__(self):
        return f"<id = {self.id}, name = {self.name}>"


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    season_num = db.Column(db.Integer, db.ForeignKey("season.id"))
    event_num = db.Column(db.Integer)
    type = db.Column(db.Integer, db.ForeignKey("event_type.id"))
    name = db.Column(db.String(100))
    date = db.Column(db.Date)
    winner = db.Column(db.Integer, db.ForeignKey("vehicle.id"))
    team = db.Column(db.Integer, db.ForeignKey("team.id"))
    # If champions_league = True, then Champions League event;
    # if champions_league = False, then Regular Season event:
    champions_league = db.Column(db.Boolean)

    def __repr__(self):
        return (f"<id = {self.id}, "
                f"season_num = {self.season_num}, "
                f"event_num = {self.event_num}, "
                f"type = {self.type}"
                f"name = {self.name}, "
                f"date = {self.date}, "
                f"winner = {self.winner}, "
                f"team = {self.team}, "
                f"champions_league = {self.champions_league}>")


class ChampionsLeagueResult(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    season_num = db.Column(db.Integer, db.ForeignKey("season.id"))
    place = db.Column(db.Integer)
    vehicle = db.Column(db.Integer, db.ForeignKey("vehicle.id"))
    team = db.Column(db.Integer, db.ForeignKey("team.id"))
    points = db.Column(db.Integer)

    def __repr__(self):
        return (f"<id = {self.id}, "
                f"season_num = {self.season_num}, "
                f"place = {self.place}, "
                f"vehicle = {self.vehicle}, "
                f"team = {self.team}, "
                f"points = {self.points}>")
