<?php

if ($_GET['status'] ?? null) {
    http_response_code($_GET['status']);
    header('Retry-After: 2');
    exit;
}

if ($_GET['sleep'] ?? null) {
    sleep($_GET['sleep'] * 1000);
}

header('Content-Type: application/json');
usleep(rand(1, 500) * 1000);
echo json_encode([
    'method' => $_SERVER['REQUEST_METHOD'],
    'header' => (object) array_filter(getallheaders(), fn($k) => str_starts_with($k, 'X-'), ARRAY_FILTER_USE_KEY),
    'get'    => (object) $_GET,
    'post'   => (object) $_POST,
    'files'  => (object) (function ($files) {
        $result = [];
        foreach (($files) as $name => $file) {
            unset($file['tmp_name']);
            unset($file['full_path']);
            unset($file['error']);

            if (is_array($file['name'])) {
                $files = [];
                foreach ($file['name'] as $subkey => $dummy) {
                    $files[$subkey] = array_map(fn($f) => $f[$subkey], $file);
                }
                $file = $files;
            }

            $result[$name] = $file;
        }
        return $result;
    })($_FILES),
    'body'   => file_get_contents('php://input'),
]);
