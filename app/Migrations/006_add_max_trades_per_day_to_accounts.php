<?php

namespace App\Migrations;

use App\Core\Database;

class AddMaxTradesPerDayToAccounts
{
    public static function up(): void
    {
        $db = Database::getInstance();
        $db->exec("ALTER TABLE accounts ADD COLUMN max_trades_per_day INTEGER DEFAULT NULL");
        echo "Added max_trades_per_day to accounts table.\n";
    }

    public static function down(): void
    {
        $db = Database::getInstance();
        $db->exec("ALTER TABLE accounts DROP COLUMN max_trades_per_day");
        echo "Dropped max_trades_per_day from accounts table.\n";
    }
}
