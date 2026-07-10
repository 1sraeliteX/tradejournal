<?php

namespace App\Core;

use App\Helpers\JWT;

class Middleware
{
    public static function authenticate(): ?array
    {
        $token = Request::bearerToken();
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Authentication required']);
            exit;
        }

        $config = require __DIR__ . '/../../config/config.php';
        $payload = JWT::decode($token, $config['jwt']['secret']);

        if (!$payload) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid or expired token']);
            exit;
        }

        return $payload;
    }
}
