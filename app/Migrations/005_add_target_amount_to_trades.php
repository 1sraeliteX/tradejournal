<?php

namespace App\Migrations;

use App\Core\Database;

class AddTargetAmountToTrades
{
    public static function up(): void
    {
        $db = Database::getInstance();
        $db->exec("ALTER TABLE trades ADD COLUMN target_amount REAL DEFAULT NULL");
        echo "Added target_amount to trades.\n";
    }

    public static function down(): void
    {
        $db = Database::getInstance();
        try {
            $db->exec("ALTER TABLE trades DROP COLUMN target_amount");
        } catch (\Exception $e) {
            echo "Note: Could not drop target_amount column (SQLite limitation). Manually recreate trades table.\n";
        }
    }
}
