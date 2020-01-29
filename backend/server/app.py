import os
import sys

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow_hub as hub
from hdbscan import HDBSCAN
import numpy as np

# Set loaded model directory
MODEL_DIR = os.environ["MODEL_DIR"]
model = hub.load(MODEL_DIR)

app = Flask(__name__)
CORS(app)


def embed(queries: list):
    return model(queries).numpy()


def obtain_clusters(labels):
    labels = np.array(labels)
    clusters = []
    for l in range(max(labels) + 1):
        inds = np.where(labels == l)[0]
        if len(inds) > 0:
            clusters.append(inds.tolist())

    return clusters


@app.route("/cluster", methods=["POST"])
def cluster():
    data = request.get_json().get("sentences")
    if not isinstance(data, list):
        return "Sentences should be a list", 400

    n_data = len(data)
    if n_data < 3:
        return {"clusters": list(range(n_data))}, 200

    try:
        embeddings = embed(data)
    except Exception as err:
        print(err)
        return "Bad Input", 400

    min_size, clusters = max(2, len(data) // 10), list(range(n_data))
    for min_samples in range(min_size, 1, -1):
        clusterer = HDBSCAN(min_cluster_size=min_size, min_samples=min_samples).fit(
            embeddings
        )
        if sum(clusterer.labels_) != -1 * n_data:
            clusters = obtain_clusters(clusterer.labels_)
            break

    return {"clusters": clusters}, 200


@app.route("/predict", methods=["POST"])
def predict():
    query = request.get_json().get("query")
    if query == None:
        return "Missing query parameter", 400
    try:
        embedding = embed([query]).tolist()
        return jsonify(prediction=embedding), 200
    except Exception as err:
        print(err)
        return "Oops, something went wrong! Try again", 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
