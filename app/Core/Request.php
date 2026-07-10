<?php

namespace App\Core;

class Request
{
    public static function body(): array
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        return $data;
    }

    public static function query(string $key, $default = null): ?string
    {
        return $_GET[$key] ?? $default;
    }

    public static function method(): string
    {
        return $_SERVER['REQUEST_METHOD'];
    }

    public static function uri(): string
    {
        return $_SERVER['REQUEST_URI'];
    }

    public static function bearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (preg_match('/Bearer\s+(.+)$/i', $header, $matches)) {
            return $matches[1];
        }
        return null;
    }
}
