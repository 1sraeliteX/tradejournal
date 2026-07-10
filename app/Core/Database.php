<?php

namespace App\Core;

class Database
{
    private static ?\PDO $instance = null;

    public static function getInstance(): \PDO
    {
        if (self::$instance === null) {
            $config = require __DIR__ . '/../../config/config.php';
            $db = $config['db'];

            if ($db['driver'] === 'sqlite') {
                $dsn = 'sqlite:' . $db['sqlite_path'];
                self::$instance = new \PDO($dsn, null, null, [
                    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                ]);
                self::$instance->exec('PRAGMA journal_mode=WAL');
                self::$instance->exec('PRAGMA foreign_keys=ON');
            } else {
                $dsn = "mysql:host={$db['host']};port={$db['port']};dbname={$db['name']};charset=utf8mb4";
                self::$instance = new \PDO($dsn, $db['user'], $db['pass'], [
                    \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                    \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
                    \PDO::ATTR_EMULATE_PREPARES => false,
                ]);
            }
        }

        return self::$instance;
    }
}
