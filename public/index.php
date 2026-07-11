<?php

require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../config');
$dotenv->safeLoad();

$config = require __DIR__ . '/../config/config.php';
$isDev = ($config['app']['env'] ?? 'production') === 'development';

error_reporting($isDev ? E_ALL : 0);
ini_set('display_errors', $isDev ? '1' : '0');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

use App\Core\Router;
use App\Core\Request;
use App\Controllers\AuthController;
use App\Controllers\TradeController;
use App\Controllers\StatsController;
use App\Controllers\SettingsController;
use App\Controllers\AccountController;

$router = new Router();

$router->post('/api/auth/register', [AuthController::class, 'register']);
$router->post('/api/auth/login', [AuthController::class, 'login']);
$router->post('/api/auth/logout', [AuthController::class, 'logout']);

$router->get('/api/trades', [TradeController::class, 'index']);
$router->post('/api/trades', [TradeController::class, 'store']);
$router->put('/api/trades/{id}', [TradeController::class, 'update']);
$router->delete('/api/trades/{id}', [TradeController::class, 'destroy']);

$router->get('/api/stats', [StatsController::class, 'index']);

$router->get('/api/settings', [SettingsController::class, 'show']);
$router->put('/api/settings', [SettingsController::class, 'update']);

$router->get('/api/accounts', [AccountController::class, 'index']);
$router->post('/api/accounts', [AccountController::class, 'store']);
$router->put('/api/accounts/{id}', [AccountController::class, 'update']);
$router->delete('/api/accounts/{id}', [AccountController::class, 'destroy']);

$router->dispatch(Request::method(), Request::uri());
