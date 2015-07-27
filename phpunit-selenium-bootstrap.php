<?php
require_once __DIR__ . '/vendor/autoload.php';

PHPUnit_Extensions_SeleniumTestCase::shareSession(true);
require_once 'tests/SeleniumTestCase/BaseTestCase.php';
require_once 'tests/Selenium2TestCase/BaseTestCase.php';
PHPUnit_Extensions_Selenium2TestCase::shareSession(true);
