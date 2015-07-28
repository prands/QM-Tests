<?php
class WebTest extends PHPUnit_Extensions_Selenium2TestCase
{
	die('HERE');
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