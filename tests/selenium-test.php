<?php
require __DIR__ . '/../../PHPUnit/Extensions/Selenium2TestCase.php';
class WebTest extends PHPUnit_Extensions_Selenium2TestCase
{
    protected function setUp()
    {
        $this->setBrowser('firefox');
        $this->setBrowserUrl('http://quantimodo.projectstatus.in/');
    }

    public function testTitle()
    {
        $this->url('http://quantimodo.projectstatus.in/');
        $this->assertEquals('QuantiModo | Just another WordasdPress sd', $this->title());
    }

}
?>