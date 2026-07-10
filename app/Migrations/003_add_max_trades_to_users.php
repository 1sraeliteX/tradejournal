<?php

namespace App\Migrations;

use App\Core\Database;

class AddMaxTradesToUsers
{
    public static function up(): void
    {
        $db = Database::getInstance();
        $db->exec("ALTER TABLE users ADD COLUMN max_trades_per_day INTEGER DEFAULT NULL");
        echo "Added max_trades_per_day to users table.\n";
    }

    public static function down(): void
    {
        $db = Database::getInstance();
        $db->exec("ALTER TABLE users DROP COLUMN max_trades_per_day");
        echo "Dropped max_trades_per_day from users table.\n";
    }
}
