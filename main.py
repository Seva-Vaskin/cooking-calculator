from flask import render_template, request, jsonify
from flask_app_creator import FlaskAppCreator
from database import Database
from forms import SearchForm

app = FlaskAppCreator.create()
foodstuffDB = Database()

saved_items = []


@app.route("/", methods=['GET', 'POST'])
def index():
    found_items = []

    if request.method == 'POST':
        search_str = request.form.get('foodstuff')
        found_items = foodstuffDB.search_by_substring(search_str, 10)

    form = SearchForm()
    return render_template('index.html', form=form, found_items=found_items, saved_items=saved_items)


@app.route("/search", methods=['POST'])
def search():
    search_str = request.json.get('search_str')
    found_items = foodstuffDB.search_by_substring(search_str, 10)
    return jsonify({'found_items': found_items})


@app.route("/get_info", methods=['POST'])
def get_foodstuff_info():
    foodstuff = request.json.get('foodstuff')
    found_tuple = foodstuffDB.get_by_name(foodstuff)
    return jsonify({'foodstuff_info': found_tuple})


if __name__ == '__main__':
    app.run(debug=True)
