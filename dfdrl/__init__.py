from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

from dfdrl.config import Config


db = SQLAlchemy()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)

    from dfdrl.errors.handlers import errors
    from dfdrl.main.routes import main
    app.register_blueprint(errors)
    app.register_blueprint(main)

    return app
