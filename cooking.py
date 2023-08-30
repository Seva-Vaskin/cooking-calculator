from flask import Flask, render_template, request, flash
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TextAreaField, validators
from wtforms.validators import DataRequired

from database import Database

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your secret key'
foodstuffDB = Database()


class BasicForm(FlaskForm):
    ids = StringField("ID", validators=[DataRequired()])
    submit = SubmitField("Submit")


class SignupForm(FlaskForm):
    name = StringField('Username')


@app.route("/", methods=['GET', 'POST'])
def index():
    return render_template('index.html', form=SignupForm())


if __name__ == '__main__':
    app.run(debug=True)
