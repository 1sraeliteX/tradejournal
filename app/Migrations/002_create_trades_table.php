<?php

namespace App\Migrations;

use App\Core\Database;

class CreateTradesTable
{
    public static function up(): void
    {
        $db = Database::getInstance();
        $db->exec("
            CREATE TABLE IF NOT EXISTS trades (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                trade_date TEXT NOT NULL,
                market_type TEXT NOT NULL CHECK(market_type IN ('forex', 'crypto', 'commodities')),
                pair TEXT NOT NULL,
                lot_size REAL NOT NULL,
                risk_type TEXT NOT NULL CHECK(risk_type IN ('amount', 'percentage')),
                risk_value REAL NOT NULL,
                result TEXT NOT NULL CHECK(result IN ('win', 'loss')),
                pnl_amount REAL NOT NULL,
                risk_reward TEXT NOT NULL,
                notes TEXT DEFAULT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ");
        echo "Created trades table.\n";
    }

    public static function down(): void
    {
        $db = Database::getInstance();
        $db->exec("DROP TABLE IF EXISTS trades");
        echo "Dropped trades table.\n";
    }
}
