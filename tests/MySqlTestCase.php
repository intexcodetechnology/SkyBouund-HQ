<?php

namespace Tests;

use RuntimeException;

abstract class MySqlTestCase extends TestCase
{
    protected function setUp(): void
    {
        // Before Laravel's database migration traits can execute any destructive test setup.
        if (getenv('DB_CONNECTION') !== 'mysql' || ! str_ends_with((string) getenv('DB_DATABASE'), '_testing')) {
            throw new RuntimeException('Use phpunit.mysql.xml with a dedicated *_testing MySQL database.');
        }
        parent::setUp();
    }
}
