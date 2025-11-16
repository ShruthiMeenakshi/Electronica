<?php
// test_mail.php
$to = "shruthimeena542@gmail.com"; // Replace with your actual email
$subject = "PHP Mail Test - OTP Scenario";
$message = "This is a test email for OTP resend functionality.";
$headers = "From: no-reply@yourwebsite.com\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

if (mail($to, $subject, $message, $headers)) {
    echo "Test email sent successfully to " . $to . ". Check your inbox (and spam folder!).";
} else {
    echo "Test email failed to send. Check server logs for details.";
}
?>