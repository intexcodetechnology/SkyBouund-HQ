<?php

namespace Tests\Feature;

use Tests\TestCase;

class FoundationSmokeTest extends TestCase
{
    public function test_login_screen_is_available(): void
    {
        $this->withoutVite()->get('/login')->assertOk();
    }

    public function test_workspace_requires_authentication(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_health_endpoint_is_available(): void
    {
        $this->get('/up')->assertOk();
    }
}
