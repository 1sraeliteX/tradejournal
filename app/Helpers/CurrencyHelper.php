<?php

namespace App\Helpers;

class CurrencyHelper
{
    private static array $currencies = [
        'USD' => ['symbol' => '$', 'code' => 'USD', 'name' => 'US Dollar'],
        'NGN' => ['symbol' => '₦', 'code' => 'NGN', 'name' => 'Nigerian Naira'],
        'EUR' => ['symbol' => '€', 'code' => 'EUR', 'name' => 'Euro'],
        'GBP' => ['symbol' => '£', 'code' => 'GBP', 'name' => 'British Pound'],
        'CAD' => ['symbol' => 'C$', 'code' => 'CAD', 'name' => 'Canadian Dollar'],
        'AUD' => ['symbol' => 'A$', 'code' => 'AUD', 'name' => 'Australian Dollar'],
        'JPY' => ['symbol' => '¥', 'code' => 'JPY', 'name' => 'Japanese Yen'],
        'CHF' => ['symbol' => 'Fr', 'code' => 'CHF', 'name' => 'Swiss Franc'],
    ];

    public static function format(float $amount, string $currency = null): string
    {
        $currency = $currency ?? self::getDefaultCurrency();

        if (!isset(self::$currencies[$currency])) {
            $currency = 'USD';
        }

        $symbol = self::$currencies[$currency]['symbol'];
        $formatted = number_format(abs($amount), 2, '.', ',');

        if ($amount < 0) {
            return "-{$symbol}{$formatted}";
        }

        return "{$symbol}{$formatted}";
    }

    public static function supportedCurrencies(): array
    {
        return self::$currencies;
    }

    public static function getDefaultCurrency(): string
    {
        $config = require __DIR__ . '/../../config/config.php';
        return $config['app']['default_currency'] ?? 'USD';
    }
}
