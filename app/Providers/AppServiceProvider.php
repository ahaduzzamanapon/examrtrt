<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // Fix MySQL key length for older MariaDB/MySQL versions (< 5.7.7)
        Schema::defaultStringLength(191);

        Vite::prefetch(concurrency: 3);
    }
}
