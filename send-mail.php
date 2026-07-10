<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$to = 'info@sacarabia.com';
$subject = 'New Quotation Request - SAC Arabia';

$name = isset($_POST['fullName']) ? strip_tags($_POST['fullName']) : '';
$company = isset($_POST['companyName']) ? strip_tags($_POST['companyName']) : '';
$email = isset($_POST['email']) ? filter_var($_POST['email'], FILTER_SANITIZE_EMAIL) : '';
$phone = isset($_POST['phone']) ? strip_tags($_POST['phone']) : '';
$location = isset($_POST['location']) ? strip_tags($_POST['location']) : '';
$targetDate = isset($_POST['targetDate']) ? strip_tags($_POST['targetDate']) : '';
$description = isset($_POST['description']) ? strip_tags($_POST['description']) : '';
$services = isset($_POST['services']) ? (is_array($_POST['services']) ? implode(', ', array_map('strip_tags', $_POST['services'])) : strip_tags($_POST['services'])) : '';

$email = str_replace(array("\r", "\n"), '', $email);

if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid or missing required fields.']);
    exit;
}

// Generate a random boundary
$boundary = md5(time());

$headers = "From: $email\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

// Email Body
$message = "--$boundary\r\n";
$message .= "Content-Type: text/html; charset=UTF-8\r\n";
$message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";

$message .= "
<html>
<body style='font-family:Arial,sans-serif;padding:20px;color:#333'>
<h2 style='color:#D07517;border-bottom:2px solid #D07517;padding-bottom:10px'>New Quotation Request</h2>
<table style='width:100%;border-collapse:collapse'>
<tr><td style='padding:8px;font-weight:700;width:140px;color:#0A2A4A'>Full Name:</td><td style='padding:8px'>$name</td></tr>
<tr><td style='padding:8px;font-weight:700;color:#0A2A4A'>Company:</td><td style='padding:8px'>$company</td></tr>
<tr><td style='padding:8px;font-weight:700;color:#0A2A4A'>Email:</td><td style='padding:8px'>$email</td></tr>
<tr><td style='padding:8px;font-weight:700;color:#0A2A4A'>Phone:</td><td style='padding:8px'>$phone</td></tr>
<tr><td style='padding:8px;font-weight:700;color:#0A2A4A'>Location:</td><td style='padding:8px'>$location</td></tr>
<tr><td style='padding:8px;font-weight:700;color:#0A2A4A'>Target Date:</td><td style='padding:8px'>$targetDate</td></tr>
<tr><td style='padding:8px;font-weight:700;color:#0A2A4A'>Services:</td><td style='padding:8px'>$services</td></tr>
</table>
<h3 style='color:#0A2A4A;margin-top:20px'>Project Description</h3>
<p style='background:#f5f5f5;padding:15px;border-radius:8px'>$description</p>
</body></html>\r\n";

// Handle attachments
if (isset($_FILES['attachments'])) {
    $files = $_FILES['attachments'];
    $file_count = is_array($files['name']) ? count($files['name']) : 1;
    
    for ($i = 0; $i < $file_count; $i++) {
        $file_name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
        $file_tmp  = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
        $file_type = is_array($files['type']) ? $files['type'][$i] : $files['type'];
        $file_error = is_array($files['error']) ? $files['error'][$i] : $files['error'];

        // Only attach if upload was successful
        if ($file_error === UPLOAD_ERR_OK && is_uploaded_file($file_tmp)) {
            $content = file_get_contents($file_tmp);
            $content = chunk_split(base64_encode($content));

            $message .= "--$boundary\r\n";
            $message .= "Content-Type: $file_type; name=\"$file_name\"\r\n";
            $message .= "Content-Disposition: attachment; filename=\"$file_name\"\r\n";
            $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
            $message .= $content . "\r\n";
        }
    }
}

$message .= "--$boundary--\r\n";

$mailSent = mail($to, $subject, $message, $headers);

if ($mailSent) {
    echo json_encode(['success' => true, 'message' => 'Email sent successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to send email']);
}
?>