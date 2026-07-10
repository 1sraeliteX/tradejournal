<?php

namespace App\Core;

class Router
{
    private array $routes = [];

    public function get(string $path, array $handler): void
    {
        $this->routes['GET'][] = ['path' => $path, 'handler' => $handler];
    }

    public function post(string $path, array $handler): void
    {
        $this->routes['POST'][] = ['path' => $path, 'handler' => $handler];
    }

    public function put(string $path, array $handler): void
    {
        $this->routes['PUT'][] = ['path' => $path, 'handler' => $handler];
    }

    public function delete(string $path, array $handler): void
    {
        $this->routes['DELETE'][] = ['path' => $path, 'handler' => $handler];
    }

    public function dispatch(string $method, string $uri): void
    {
        $uri = parse_url($uri, PHP_URL_PATH);
        $uri = rtrim($uri, '/') ?: '/';

        $routes = $this->routes[$method] ?? [];

        foreach ($routes as $route) {
            $params = $this->matchRoute($route['path'], $uri);
            if ($params !== null) {
                [$class, $action] = $route['handler'];
                $controller = new $class();
                $controller->$action(...$params);
                return;
            }
        }

        http_response_code(404);
        echo json_encode(['error' => 'Route not found']);
    }

    private function matchRoute(string $pattern, string $uri): ?array
    {
        $pattern = preg_replace('/\{(\w+)\}/', '(?P<$1>[^/]+)', $pattern);
        $pattern = '#^' . $pattern . '$#';

        if (preg_match($pattern, $uri, $matches)) {
            return array_values(array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY));
        }

        return null;
    }
}
