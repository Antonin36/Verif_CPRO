<?php
// Obtenez l'URL à partir de la requête GET
$url = $_GET['url'];
$origin = $_GET['origin'];

if (filter_var($url, FILTER_VALIDATE_URL)) {
    // Initialise une session cURL
    $ch = curl_init($url);
    
    // Définissez les options cURL
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    
    // Définir l'header Origin si besoin
    if ($origin) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            "Origin: $origin"
        ));
    }
    
    // Exécutez la requête cURL
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    // Fermez la session cURL
    curl_close($ch);
    
    // Séparez les en-têtes et le corps de la réponse
    list($headers, $body) = explode("\r\n\r\n", $response, 2);

    // Envoyez les en-têtes HTTP de la réponse originale
    foreach (explode("\r\n", $headers) as $header) {
        if (!preg_match('/^Transfer-Encoding:|^Content-Length:|^Connection:/i', $header)) {
            header($header);
        }
    }
    
    // Affichez le corps de la réponse
    http_response_code($http_code);
    echo $body;
} else {
    http_response_code(400);
    echo "URL invalide.";
}
?>
