const express = require('express');
const axios = require('axios');
require('dotenv').config(); 

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const API_BASE_URL = 'http://20.244.56.144';


const numberWindows = {
    p: [], 
    f: [], 
    e: [], 
    r: []  
};

const AUTH_HEADER = {
    headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQzMTUzOTY4LCJpYXQiOjE3NDMxNTM2NjgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjkwODc2NmRkLWMzYTItNGM0MC04MGJiLWVkNDY4NDg3MjBiYyIsInN1YiI6InZhcnVuYm90Y2hhNzdAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoiQW5pbCBOZWVydWtvbmRhIEluc3RpdHV0ZSBvZiBUZWNobm9sb2d5IGFuZCBTY2llbmNlcyIsImNsaWVudElEIjoiOTA4NzY2ZGQtYzNhMi00YzQwLTgwYmItZWQ0Njg0ODcyMGJjIiwiY2xpZW50U2VjcmV0IjoiZ1NzdmhpRXVrQkdLcGdaSiIsIm93bmVyTmFtZSI6IkJvdGNoYSBWYXJ1biIsIm93bmVyRW1haWwiOiJ2YXJ1bmJvdGNoYTc3QGdtYWlsLmNvbSIsInJvbGxObyI6IkEyMjEyNjU1MjIwMSJ9.QvJezQHJn5xUP2-uaWz2_mR5d90_-8-y2sorlNQckzM`
    }
};


const fetchNumbers = async (type) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/test/${type}`, AUTH_HEADER);
        return response.data.numbers || [];
    } catch (error) {
        console.error(`Error fetching ${type} numbers:`, error.response?.data || error.message);
        return [];
    }
};


fetchNumbers('fibo').then(data => console.log('Fetched Numbers:', data));



const updateWindow = (type, numbers) => {
    const window = numberWindows[type];
    const uniqueNumbers = numbers.filter(num => !window.includes(num));
    
    window.push(...uniqueNumbers);
    
    while (window.length > WINDOW_SIZE) {
        window.shift();
    }
};

const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return parseFloat((sum / numbers.length).toFixed(2));
};

app.get('/test/:numberid', async (req, res) => {
    const { numberid } = req.params;
    if (!['primes', 'fibo'].includes(numberid)) {
        return res.status(400).json({ error: 'Invalid number type' });
    }

    const prevState = [...numberWindows[numberid]];
    const numbers = await fetchNumbers(numberid);
    updateWindow(numberid, numbers);
    const currState = [...numberWindows[numberid]];
    const avg = calculateAverage(currState);

    res.json({
        windowPrevState: prevState,
        windowCurrState: currState,
        numbers: numbers,
        avg: avg
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
