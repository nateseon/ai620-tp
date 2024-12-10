import ast
import math
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)
df = pd.read_csv('../seattle_area_restaurants.csv')

restaurants = df.to_dict(orient='records')

feedback_data = []

import math

def sanitize_data(data):
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, float) and math.isnan(value):
            sanitized[key] = None
        elif value is None or value == "":
            sanitized[key] = None
        elif key == "Price" and value == "":
            sanitized[key] = "No price information available" 
        elif key == "Area" and value == "":
            sanitized[key] = "Area not available" 
        else:
            sanitized[key] = value  
    return sanitized

@app.route('/getRecommendations', methods=['POST'])
def get_recommendations():

    data = request.get_json()

    cuisine = data.get('cuisine', '').lower()
    price_range = data.get('priceRange', '').upper()
    min_rating = data.get('minRating', 0)

    filtered_recommendations = []


    for rec in restaurants:
        categories = ast.literal_eval(rec.get('Category', '[]'))
        
        if (cuisine in [cat.lower() for cat in categories] if cuisine else True) and \
        (price_range in str(rec.get('Price', '')).upper() if price_range else True) and \
        (rec.get('Star', 0) >= min_rating):
            filtered_recommendations.append(rec)

    sanitized_recommendations = [sanitize_data(rec) for rec in filtered_recommendations]
    return jsonify(sanitized_recommendations)

@app.route('/sendFeedback', methods=['POST'])
def send_feedback():
    """ Endpoint to handle feedback on food recommendations. """
    data = request.get_json()
    restaurant_id = data.get('restaurantId')
    rating = data.get('rating')

    feedback_data.append({"restaurantId": restaurant_id, "rating": rating})

    return jsonify({"message": "Feedback submitted successfully!"})

@app.route('/')
def index():
    """ Serve the main page (just for demonstration). """
    return "Welcome to the Seattle Food Recommendation Service API!"

if __name__ == '__main__':
    app.run(debug=True)
