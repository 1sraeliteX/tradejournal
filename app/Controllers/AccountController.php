<?php

namespace App\Controllers;

use App\Core\Middleware;
use App\Core\Request;
use App\Models\Account;

class AccountController
{
    public function index(): void
    {
        try {
            $user = Middleware::authenticate();
            $accounts = Account::findByUserId($user['sub']);
            echo json_encode(['accounts' => $accounts]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch accounts: ' . $e->getMessage()]);
        }
    }

    public function store(): void
    {
        try {
            $user = Middleware::authenticate();
            $data = Request::body();

            if (empty($data['name'])) {
                http_response_code(422);
                echo json_encode(['error' => 'Account name is required']);
                return;
            }

            $accountId = Account::create($user['sub'], $data);

            http_response_code(201);
            echo json_encode(['message' => 'Account created', 'id' => $accountId]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create account: ' . $e->getMessage()]);
        }
    }

    public function update(int $id): void
    {
        try {
            $user = Middleware::authenticate();
            $existing = Account::findById($id);

            if (!$existing || $existing['user_id'] !== $user['sub']) {
                http_response_code(404);
                echo json_encode(['error' => 'Account not found']);
                return;
            }

            $data = Request::body();

            if (empty($data['name'])) {
                http_response_code(422);
                echo json_encode(['error' => 'Account name is required']);
                return;
            }

            Account::update($id, $data);
            echo json_encode(['message' => 'Account updated']);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update account: ' . $e->getMessage()]);
        }
    }

    public function destroy(int $id): void
    {
        try {
            $user = Middleware::authenticate();
            $existing = Account::findById($id);

            if (!$existing || $existing['user_id'] !== $user['sub']) {
                http_response_code(404);
                echo json_encode(['error' => 'Account not found']);
                return;
            }

            Account::delete($id);
            echo json_encode(['message' => 'Account deleted']);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete account: ' . $e->getMessage()]);
        }
    }
}
