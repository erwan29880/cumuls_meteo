from flask import Flask, render_template, jsonify
from meteo import *
from flask_cors import CORS

app = Flask(__name__)
CORS(app)



@app.route('/')
def meteo_front():
    # data = cum_meteo_js()
    my_dict = index_dates()
    idx = list(my_dict.keys())
    val = list(my_dict.values())
    return render_template('meteo_page.html', var2=zip(idx, val))


@app.route('/1431766f-b5ce-4603-9e17-1de15d0e6c81', methods=['GET'])
def meteoapi():
    try:
        data2 = cum_meteo_js()
        return jsonify(data2)
    except:
        return 'null'


if __name__=='__main__':
    app.run(port=5001, debug=True)    

