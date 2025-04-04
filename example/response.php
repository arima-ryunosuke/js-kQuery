<?php

function nomalizeFiles($files)
{
    $result = [];
    foreach (($files) as $name => $file) {
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
}

header('Content-Type: application/json');
echo json_encode([
    'method' => $_SERVER['REQUEST_METHOD'],
    'get'    => (object) $_GET,
    'post'   => (object) $_POST,
    'files'  => (object) array_column(nomalizeFiles($_FILES), 'type', 'name'),
    'body'   => file_get_contents('php://input'),
]);
