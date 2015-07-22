<?php
class ApiconfigTest extends WP_UnitTestCase {
     
	 public function testConfig() {
        $data = array('client_id' => getenv('CLIENT_ID'), 'client_secret' => getenv('CLIENT_SECRET'), 'authorize_endpoint' => 'https://staging.quantimo.do:443/api/oauth2/authorize?', 'token_endpoint' => 'https://staging.quantimo.do:443/api/oauth2/token?');
        
        $this->assertEquals(CLIENT_ID, $data->client_id);
        $this->assertEquals(CLIENT_SECRET, $data->client_secret);
        $this->assertEquals(URL_AUTH, $data->authorize_endpoint);
        $this->assertEquals(URL_TOKEN, $data->token_endpoint);
        $this->assertNull(REDIRECT_URI);
        $this->assertFalse(HTTP_UTIL);
    }
}