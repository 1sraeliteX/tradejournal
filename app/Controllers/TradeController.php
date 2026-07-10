<?php

namespace App\Controllers;

use App\Core\Middleware;
use App\Core\Request;
use App\Models\Trade;
use App\Models\User;

class TradeController
{
    public function index(): void
    {
        try {
            $user = Middleware::authenticate();
            $month = Request::query('month', date('Y-m'));
            $accountId = Request::query('account_id');

            if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
                http_response_code(422);
                echo json_encode(['error' => 'Invalid month format. Use YYYY-MM']);
                return;
            }

            $trades = Trade::findByUserAndMonth($user['sub'], $month, $accountId !== null ? (int) $accountId : null);
            echo json_encode(['trades' => $trades]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch trades: ' . $e->getMessage()]);
        }
    }

    public function store(): void
    {
        try {
            $user = Middleware::authenticate();
            $data = Request::body();

            $errors = $this->validate($data);
            if (!empty($errors)) {
                http_response_code(422);
                echo json_encode(['error' => 'Validation failed', 'fields' => $errors]);
                return;
            }

            $userRecord = User::findById($user['sub']);
            $maxPerDay = $userRecord['max_trades_per_day'] ?? null;
            if ($maxPerDay !== null) {
                $existingCount = Trade::countByUserAndDate($user['sub'], $data['trade_date']);
                if ($existingCount >= (int) $maxPerDay) {
                    http_response_code(422);
                    echo json_encode(['error' => "Daily trade limit reached ({$existingCount}/{$maxPerDay}). Adjust your limit in settings to add more."]);
                    return;
                }
            }

            $data['pnl_amount'] = (float) $data['pnl_amount'];
            $data['lot_size'] = (float) $data['lot_size'];
            $data['risk_value'] = (float) $data['risk_value'];

            if ($data['result'] === 'loss' && $data['pnl_amount'] > 0) {
                $data['pnl_amount'] = -$data['pnl_amount'];
            }
            if ($data['result'] === 'win' && $data['pnl_amount'] < 0) {
                $data['pnl_amount'] = abs($data['pnl_amount']);
            }

            $tradeId = Trade::create($user['sub'], $data);

            http_response_code(201);
            echo json_encode(['message' => 'Trade created', 'id' => $tradeId]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create trade: ' . $e->getMessage()]);
        }
    }

    public function update(int $id): void
    {
        try {
            $user = Middleware::authenticate();
            $existing = Trade::findById($id);

            if (!$existing || $existing['user_id'] !== $user['sub']) {
                http_response_code(404);
                echo json_encode(['error' => 'Trade not found']);
                return;
            }

            $data = Request::body();

            $errors = $this->validate($data);
            if (!empty($errors)) {
                http_response_code(422);
                echo json_encode(['error' => 'Validation failed', 'fields' => $errors]);
                return;
            }

            $data['pnl_amount'] = (float) $data['pnl_amount'];
            $data['lot_size'] = (float) $data['lot_size'];
            $data['risk_value'] = (float) $data['risk_value'];

            if ($data['result'] === 'loss' && $data['pnl_amount'] > 0) {
                $data['pnl_amount'] = -$data['pnl_amount'];
            }
            if ($data['result'] === 'win' && $data['pnl_amount'] < 0) {
                $data['pnl_amount'] = abs($data['pnl_amount']);
            }

            Trade::update($id, $data);
            echo json_encode(['message' => 'Trade updated']);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update trade: ' . $e->getMessage()]);
        }
    }

    public function destroy(int $id): void
    {
        try {
            $user = Middleware::authenticate();
            $existing = Trade::findById($id);

            if (!$existing || $existing['user_id'] !== $user['sub']) {
                http_response_code(404);
                echo json_encode(['error' => 'Trade not found']);
                return;
            }

            Trade::delete($id);
            echo json_encode(['message' => 'Trade deleted']);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete trade: ' . $e->getMessage()]);
        }
    }

    private function validate(array $data): array
    {
        $errors = [];

        if (empty($data['trade_date'])) $errors[] = 'trade_date is required';
        if (empty($data['market_type']) || !in_array($data['market_type'], ['forex', 'crypto', 'commodities'])) {
            $errors[] = 'market_type must be forex, crypto, or commodities';
        }
        if (empty($data['pair'])) $errors[] = 'pair is required';
        if (!isset($data['lot_size']) || (float)$data['lot_size'] <= 0) $errors[] = 'lot_size must be positive';
        if (empty($data['risk_type']) || !in_array($data['risk_type'], ['amount', 'percentage'])) {
            $errors[] = 'risk_type must be amount or percentage';
        }
        if (!isset($data['risk_value']) || (float)$data['risk_value'] <= 0) $errors[] = 'risk_value must be positive';
        if (empty($data['result']) || !in_array($data['result'], ['win', 'loss'])) {
            $errors[] = 'result must be win or loss';
        }
        if (!isset($data['pnl_amount'])) $errors[] = 'pnl_amount is required';
        if (!isset($data['target_amount'])) $errors[] = 'target_amount is required';

        return $errors;
    }
}
