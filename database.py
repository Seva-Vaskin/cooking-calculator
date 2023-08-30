from configparser import ConfigParser
from typing import List, Generator

import psycopg2


class Database:
    def __init__(self):
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

    def __del__(self):
        self._connection.close()
