"use strict";

const serverUrl = "http://127.0.0.1:5000"; // Change this to the correct endpoint if hosted remotely

async function getRecommendations() {
    const cuisine = document.getElementById("cuisine").value;
    const priceRange = document.getElementById("price-range").value;

    const response = await fetch(`${serverUrl}/getRecommendations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            cuisine: cuisine,
            priceRange: priceRange
        })
    });

    if (!response.ok) {
        console.error('Failed to fetch data:', response.statusText);
        return;
    }

    const recommendations = await response.json();
    if (recommendations && Array.isArray(recommendations)) {

        displayRecommendations(recommendations);
    } else {
        console.error('Invalid data format');
    };
}

function displayRecommendations(recommendations) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    recommendations.forEach(rec => {
        const recDiv = document.createElement("div");
        recDiv.classList.add("recommendation");

        let services = 'No services available';

        if (Array.isArray(rec.Services)) {
            services = rec.Services.join(', ');
        } else if (typeof rec.Services === 'string') {
            try {
                const cleanedServices = rec.Services
                    .replace(/'/g, '"')
                    .replace(/^\[|\]$/g, '');
        
                const serviceArray = cleanedServices.split(',').map(item => item.trim());
                services = serviceArray.join(', ');
            } catch (e) {
                services = 'Invalid services data';
            }
        }

        let price = rec.Price || 'No price information available';

        // Handle Star Rating
        const stars = Math.round(rec.Star); 
        const halfStar = rec.Star % 1 !== 0;

        let starRating = '';
        for (let i = 0; i < 5; i++) {
            if (i < stars) {
                starRating += '⭐'; 
            } else if (i === stars && halfStar) {
                starRating += '🌟'; 
            } else {
                starRating += '☆';
            }
        }

        recDiv.innerHTML = `
            <h3>${rec.Name}</h3>
            <p><strong>Services:</strong> ${services}</p>
            <p><strong>Price:</strong> ${price}</p> <!-- Price displayed correctly -->
            <p><strong>Rating:</strong> ${starRating}</p>
            <button onclick="sendFeedback('${rec.id}', 1)">👍 Like</button>
            <button onclick="sendFeedback('${rec.id}', -1)">👎 Dislike</button>
        `;
        resultsDiv.appendChild(recDiv);
    });
}


async function sendFeedback(restaurantId, rating) {
    const response = await fetch(`${serverUrl}/sendFeedback`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            restaurantId: restaurantId,
            rating: rating
        })
    });

    const data = await response.json();
    alert(data.message);  
}


document.querySelector("button").addEventListener("click", getRecommendations);
