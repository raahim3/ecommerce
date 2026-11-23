<?php

use App\Providers\AppServiceProvider;
use Intervention\Image\Laravel\ServiceProvider as InterventionImageServiceProvider;

return [
    AppServiceProvider::class,
    InterventionImageServiceProvider::class,
];
