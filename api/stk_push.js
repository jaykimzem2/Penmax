// PayHero STK Push Node.js API (Vercel Serverless Function)
const fetch = require('node-fetch');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const { amount, phone, reference, description } = req.body;

        if (!amount || !phone) {
            return res.status(400).json({ success: false, message: 'Missing amount or phone' });
        }

        const PAYHERO_ACCOUNT_ID = '8206';
        const PAYHERO_BASIC_AUTH = 'Basic RGtTaUlXM0FtaTJ2ZkkydnBHYmc6Tzhxa2tKSFc0YmNTNXdvM2dBb09SWGlJMXV4QUoxcWVQcGc0UHF0Zg==';
        const PAYHERO_API_URL = 'https://backend.payhero.co.ke/api/v2/payments';

        const payload = {
            amount: amount,
            phone_number: phone,
            channel_id: 1, // MPESA STK PUSH
            account_id: PAYHERO_ACCOUNT_ID,
            external_reference: reference || 'Penmax Payment',
            callback_url: 'https://penmax.vercel.app/api/callback', // Update if needed
        };

        const response = await fetch(PAYHERO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': PAYHERO_BASIC_AUTH
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (response.ok) {
            return res.status(200).json(data);
        } else {
            return res.status(response.status).json({
                success: false,
                message: 'Failed to initiate payment',
                error: data
            });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
}
