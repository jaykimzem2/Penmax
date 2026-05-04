<?php
header('Content-Type: application/json');
require_once 'config.php';

// Get the posted data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['amount']) || !isset($data['phone'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields (amount, phone)']);
    exit;
}

$amount = $data['amount'];
$phone = $data['phone'];
$reference = isset($data['reference']) ? $data['reference'] : 'Penmax Payment';
$description = isset($data['description']) ? $data['description'] : 'Payment for Penmax Herbal services';

// Prepare the payload for PayHero
$payload = [
    'amount' => $amount,
    'phone_number' => $phone,
    'channel_id' => 1, // MPESA STK PUSH
    'account_id' => PAYHERO_ACCOUNT_ID,
    'external_reference' => $reference,
    'callback_url' => 'https://yourdomain.com/api/callback.php', // Replace with actual callback URL
];

// Initialize cURL
$ch = curl_init(PAYHERO_API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: ' . PAYHERO_BASIC_AUTH
]);

// Execute cURL
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 || $httpCode === 201) {
    echo $response;
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Failed to initiate payment', 
        'error' => json_decode($response, true) ?: $response,
        'status_code' => $httpCode
    ]);
}
?>
