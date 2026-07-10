<?php

namespace App\Migrations;

use App\Core\Database;

class CreateUsersTable
{
    public static function up(): void
    {
        $db = Database::getInstance();
        $db->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        ");
        echo "Created users table.\n";
    }

    public static function down(): void
    {
        $db = Database::getInstance();
        $db->exec("DROP TABLE IF EXISTS users");
        echo "Dropped users table.\n";
    }
}
