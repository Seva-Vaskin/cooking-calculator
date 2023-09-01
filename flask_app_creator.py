from flask import Flask
from configparser import ConfigParser


class FlaskAppCreator:
    @classmethod
    def create(cls):
        app = Flask(__name__)
        app.config['SECRET_KEY'] = cls.__get_secret_key()
        return app

    @staticmethod
    def __get_secret_key():
        config = ConfigParser()
        config.read('auth.ini')
        section = 'flask'
        option = 'SECRET_KEY'
        assert config.has_section(section)
        assert config.has_option(section, option)
        return config.get(section, option)
