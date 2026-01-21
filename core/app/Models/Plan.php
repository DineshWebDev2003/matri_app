<?php

namespace App\Models;

// Lightweight alias so existing API controllers referring to App\Models\Plan keep working
// without touching the rest of the codebase. It simply re-uses all logic of Package.
class Plan extends Package
{
    // No additional code required
}
