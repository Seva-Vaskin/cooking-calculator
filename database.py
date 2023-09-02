from __future__ import annotations

from configparser import ConfigParser
from typing import List, Tuple
from dataclasses import dataclass
import psycopg2


class Database:
    @dataclass
    class Row:
        name: str
        proteins: float
        fats: float
        carbohydrates: float

        @classmethod
        def from_tuple(cls, tpl: Tuple[str, float, float, float]) -> Database.Row:
            return Database.Row(*tpl)

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
        self._connection = self.__connect()

    @classmethod
    def __connect(cls):
        kwargs = cls.__get_connection_kwargs()
        return psycopg2.connect(**kwargs)

    def get_connection(self):
        if self._connection.closed:
            self._connection = self.__connect()
        return self._connection

    def search_by_substring(self, substr: str, limit: int) -> List[str]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT name "
            "FROM foodstuff "
            f"WHERE UPPER(name) LIKE UPPER('%{substr}%') "
            f"LIMIT {limit};")
        rows = cursor.fetchall()
        return list(map(lambda x: x[0], rows))

    def get_by_name(self, name: str) -> Self.Row:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            f"SELECT * FROM foodstuff WHERE name = '{name}' LIMIT 1;"
        )
        row = cursor.fetchone()
        return Database.Row.from_tuple(row)
