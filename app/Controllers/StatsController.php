<?php

namespace App\Controllers;

use App\Core\Middleware;
use App\Core\Request;
use App\Models\Trade;

class StatsController
{
    public function index(): void
    {
        try {
            $user = Middleware::authenticate();
            $allTime = Request::query('all_time');
            $month = $allTime ? null : Request::query('month', date('Y-m'));
            $accountId = Request::query('account_id');

            if (!$allTime && !preg_match('/^\d{4}-\d{2}$/', $month)) {
                http_response_code(422);
                echo json_encode(['error' => 'Invalid month format. Use YYYY-MM']);
                return;
            }

            $aid = $accountId !== null ? (int) $accountId : null;

            $stats = Trade::statsByMonth($user['sub'], $month, $aid);
            $totalTrades = (int) ($stats['total_trades'] ?? 0);
            $totalPnl = (float) ($stats['total_pnl'] ?? 0);
            $wins = (int) ($stats['wins'] ?? 0);
            $losses = (int) ($stats['losses'] ?? 0);

            $bestDay = Trade::bestDayByMonth($user['sub'], $month, $aid);
            $worstDay = Trade::worstDayByMonth($user['sub'], $month, $aid);

            echo json_encode([
                'total_trades' => $totalTrades,
                'total_pnl' => $totalPnl,
                'best_day' => $bestDay ? ['date' => $bestDay['trade_date'], 'pnl' => (float) $bestDay['day_pnl']] : null,
                'worst_day' => $worstDay ? ['date' => $worstDay['trade_date'], 'pnl' => (float) $worstDay['day_pnl']] : null,
                'win_rate' => $totalTrades > 0 ? round(($wins / $totalTrades) * 100, 1) : 0,
            ]);
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch stats: ' . $e->getMessage()]);
        }
    }
}
