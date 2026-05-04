// PayHero Callback Handler
export default async function handler(req, res) {
    if (req.method === 'POST') {
        console.log('Payment Callback Received:', req.body);
        // Process the payment status here (Success/Failed)
        return res.status(200).json({ success: true, message: 'Callback received' });
    }
    return res.status(200).json({ status: 'waiting' });
}
