<?php

require_once __DIR__ . '/vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/config');
$dotenv->safeLoad();

require_once __DIR__ . '/app/Migrations/001_create_users_table.php';
require_once __DIR__ . '/app/Migrations/002_create_trades_table.php';
require_once __DIR__ . '/app/Migrations/003_add_max_trades_to_users.php';
require_once __DIR__ . '/app/Migrations/004_add_accounts_table.php';
require_once __DIR__ . '/app/Migrations/005_add_target_amount_to_trades.php';
require_once __DIR__ . '/app/Migrations/006_add_max_trades_per_day_to_accounts.php';
require_once __DIR__ . '/app/Migrations/007_add_trade_indexes.php';

use App\Migrations\CreateUsersTable;
use App\Migrations\CreateTradesTable;
use App\Migrations\AddMaxTradesToUsers;
use App\Migrations\AddAccountsTable;
use App\Migrations\AddTargetAmountToTrades;
use App\Migrations\AddMaxTradesPerDayToAccounts;
use App\Migrations\AddTradeIndexes;

$action = $argv[1] ?? 'up';

if ($action === 'up') {
    CreateUsersTable::up();
    CreateTradesTable::up();
    AddMaxTradesToUsers::up();
    AddAccountsTable::up();
    AddTargetAmountToTrades::up();
    AddMaxTradesPerDayToAccounts::up();
    AddTradeIndexes::up();
    echo "Migrations complete.\n";
} elseif ($action === 'down') {
    AddTradeIndexes::down();
    AddMaxTradesPerDayToAccounts::down();
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
    AddMaxTradesPerDayToAccounts::up();
    echo "Fresh migration complete.\n";
} else {
    echo "Usage: php migrate.php [up|down|fresh]\n";
}
