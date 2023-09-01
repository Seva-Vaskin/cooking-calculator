from wtforms import StringField, Form, SubmitField
from wtforms.validators import DataRequired


class SearchForm(Form):
    foodstuff = StringField('foodstuff', [DataRequired()])
    # submit = SubmitField('Search')
