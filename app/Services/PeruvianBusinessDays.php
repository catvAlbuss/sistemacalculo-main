<?php

namespace App\Services;

use Carbon\CarbonImmutable;

class PeruvianBusinessDays
{
    public function deadline(CarbonImmutable $filed, int $days): string
    {
        $date = $filed->setTimezone('America/Lima')->startOfDay();
        while ($days > 0) {
            $date = $date->addDay();
            if (!$date->isWeekend() && !$this->isHoliday($date)) {
                $days--;
            }
        }

        return $date->toDateString();
    }

    private function isHoliday(CarbonImmutable $date): bool
    {
        if (in_array($date->format('m-d'), ['01-01', '05-01', '06-07', '06-29', '07-23',
            '07-28', '07-29', '08-06', '08-30', '10-08', '11-01', '12-08', '12-09', '12-25'], true)
            || in_array($date->toDateString(), config('legal.additional_holidays', []), true)) {
            return true;
        }
        // Pascua gregoriana (Meeus): sin depender de la extensión calendar de PHP.
        $year = $date->year;
        $a = $year % 19;
        $b = intdiv($year, 100);
        $c = $year % 100;
        $h = (19 * $a + $b - intdiv($b, 4) - intdiv($b - intdiv($b + 8, 25) + 1, 3) + 15) % 30;
        $l = (32 + 2 * ($b % 4) + 2 * intdiv($c, 4) - $h - $c % 4) % 7;
        $m = intdiv($a + 11 * $h + 22 * $l, 451);
        $value = $h + $l - 7 * $m + 114;
        $easter = CarbonImmutable::create($year, intdiv($value, 31), $value % 31 + 1, 0, 0, 0, 'America/Lima');

        return $date->isSameDay($easter->subDays(3)) || $date->isSameDay($easter->subDays(2));
    }
}
