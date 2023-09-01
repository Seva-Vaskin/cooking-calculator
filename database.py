from configparser import ConfigParser
from typing import List, Generator

import psycopg2


class Database:

    @staticmethod
    def __get_connection_kwargs():
        config = ConfigParser()
        config.read('auth.ini')
        section = 'postgres'
        assert config.has_section(section)

        options = ['database', 'user', 'host', 'password', 'port']
        option_types = [str, str, str, str, int]
        for option in options:
            assert config.has_option(section, option)

        kwargs = dict(
            (option, option_type(config.get(section, option))) for option, option_type in zip(options, option_types)
        )
        return kwargs

    def __init__(self):
        kwargs = self.__get_connection_kwargs()
        self._connection = psycopg2.connect(**kwargs)

    def search_by_substring(self, substr: str, limit: int) -> List[str]:
        cursor = self._connection.cursor()
        cursor.execute(
            "SELECT name "
            "FROM foodstuff "
            f"WHERE UPPER(name) LIKE UPPER('%{substr}%') "
            f"LIMIT {limit};")
        rows = cursor.fetchall()
        cursor.close()
        return list(map(lambda x: x[0], rows))

    def get_by_name(self, name: str) -> tuple:
        cursor = self._connection.cursor()
        cursor.execute(
            f"SELECT * FROM foodstuff WHERE name = '{name}' LIMIT 1;"
        )
        row = cursor.fetchone()
        cursor.close()
        return row

    def __del__(self):
        self._connection.close()
