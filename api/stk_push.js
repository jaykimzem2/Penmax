// PayHero STK Push — Vercel Serverless Function (CommonJS)

module.exports = async function handler(req, res) {
    // Allow POST only
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const { amount, phone, reference } = req.body;

        if (!amount || !phone) {
            return res.status(400).json({ success: false, message: 'Missing required fields: amount or phone' });
        }

        const PAYHERO_BASIC_AUTH = 'Basic RGtTaUlXM0FtaTJ2ZkkydnBHYmc6Tzhxa2tKSFc0YmNTNXdvM2dBb09SWGlJMXV4QUoxcWVQcGc0UHF0Zg==';
        const PAYHERO_API_URL = 'https://backend.payhero.co.ke/api/v2/payments';

        const payload = {
            amount: Number(amount),           // must be a number
            phone_number: String(phone),      // 07XXXXXXXX format
            channel_id: 7848,                 // your registered channel
            provider: 'm-pesa',               // required field per PayHero docs
            account_id: 8206,                 // must be an integer, not a string
            account_number: '0727856464',     // your paybill account number
            external_reference: reference || ('PENMAX-' + Date.now()),
            callback_url: 'https://penmax.vercel.app/api/callback',
        };

        const response = await fetch(PAYHERO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': PAYHERO_BASIC_AUTH
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text(); // read as text first to avoid JSON parse crash on empty body
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { raw: text };
        }

        if (response.ok) {
            return res.status(200).json({ success: true, ...data });
        } else {
            return res.status(response.status).json({
                success: false,
                message: 'PayHero API error',
                error: data
            });
        }
    } catch (error) {
        console.error('STK Push Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
