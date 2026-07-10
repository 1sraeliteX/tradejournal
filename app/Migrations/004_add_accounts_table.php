<?php

namespace App\Migrations;

use App\Core\Database;

class AddAccountsTable
{
    public static function up(): void
    {
        $db = Database::getInstance();
        $db->exec("CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            capital REAL NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");
        $db->exec("ALTER TABLE trades ADD COLUMN account_id INTEGER DEFAULT NULL");
        echo "Added accounts table and account_id to trades.\n";
    }

    public static function down(): void
    {
        $db = Database::getInstance();
        $db->exec("DROP TABLE IF EXISTS accounts");
        try {
            $db->exec("ALTER TABLE trades DROP COLUMN account_id");
        } catch (\Exception $e) {
            echo "Note: Could not drop account_id column (SQLite limitation). Manually recreate trades table.\n";
        }
        echo "Dropped accounts table.\n";
    }
}
