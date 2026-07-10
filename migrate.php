<?php

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/config');
$dotenv->safeLoad();

require_once __DIR__ . '/app/Migrations/001_create_users_table.php';
require_once __DIR__ . '/app/Migrations/002_create_trades_table.php';
require_once __DIR__ . '/app/Migrations/003_add_max_trades_to_users.php';
require_once __DIR__ . '/app/Migrations/004_add_accounts_table.php';
require_once __DIR__ . '/app/Migrations/005_add_target_amount_to_trades.php';

use App\Migrations\CreateUsersTable;
use App\Migrations\CreateTradesTable;
use App\Migrations\AddMaxTradesToUsers;
use App\Migrations\AddAccountsTable;
use App\Migrations\AddTargetAmountToTrades;

$action = $argv[1] ?? 'up';

if ($action === 'up') {
    CreateUsersTable::up();
    CreateTradesTable::up();
    AddMaxTradesToUsers::up();
    AddAccountsTable::up();
    AddTargetAmountToTrades::up();
    echo "Migrations complete.\n";
} elseif ($action === 'down') {
    AddTargetAmountToTrades::down();
    AddAccountsTable::down();
    AddMaxTradesToUsers::down();
    CreateTradesTable::down();
    CreateUsersTable::down();
    echo "Rollback complete.\n";
} elseif ($action === 'fresh') {
    CreateTradesTable::down();
    CreateUsersTable::down();
    CreateUsersTable::up();
    CreateTradesTable::up();
    AddMaxTradesToUsers::up();
    AddAccountsTable::up();
    AddTargetAmountToTrades::up();
    echo "Fresh migration complete.\n";
} else {
    echo "Usage: php migrate.php [up|down|fresh]\n";
}
