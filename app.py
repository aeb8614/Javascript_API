#dependancies
from flask import Flask, jsonify, render_template
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, desc

app = Flask(__name__)

engine = create_engine("sqlite:///DataSets/belly_button_biodiversity.sqlite")

Base = automap_base()
Base.prepare(engine, reflect=True)

Otu = Base.classes.otu
Samples = Base.classes.samples
Samples_metadata = Base.classes.samples_metadata

session = Session(engine)

#home route
@app.route("/")
def home():
    return render_template("index.html")

#names route
@app.route("/names")
def names():
    samples = Samples.__table__.columns
    samples_list = [sample.key for sample in samples]
    samples_list.remove("otu_id")
    return jsonify(samples_list)

#otu descriptions route
@app.route("/otu_descriptions")
def otu_disc():
    otu_descriptions = session.query(Otu.otu_id, \
    Otu.lowest_taxonomic_unit_found).all()
    otu_dict = {}
    for row in otu_descriptions:
        otu_dict[row[0]] = row[1]
    return jsonify(otu_dict)

#metadata route for selected sample
@app.route("/metadata/<sample>")
def sample_query(sample):
    sample_name = sample.replace("BB_", "")
    result = session.query(Samples_metadata.AGE, \
    Samples_metadata.BBTYPE, Samples_metadata.ETHNICITY, \
    Samples_metadata.GENDER, Samples_metadata.LOCATION, \
    Samples_metadata.SAMPLEID).filter_by(SAMPLEID = sample_name).all()
    record = result[0]
    record_dict = {
        "AGE": record[0],
        "BBTYPE": record[1],
        "ETHNICITY": record[2],
        "GENDER": record[3],
        "LOCATION": record[4],
        "SAMPLEID": record[5]
    }
    return jsonify(record_dict)

#samples route for selected sample
@app.route('/samples/<sample>')
def otu_data(sample):
    sample_query = "Samples." + sample
    result = session.query(Samples.otu_id, sample_query).\
    order_by(desc(sample_query)).all()
    otu_ids = [result[x][0] for x in range(len(result))]
    sample_values = [result[x][1] for x in range(len(result))]
    dict_list = [{"otu_ids": otu_ids}, {"sample_values": sample_values}]
    return jsonify(dict_list)


if __name__ == '__main__':
    app.run(debug=True)
