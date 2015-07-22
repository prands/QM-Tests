<?php
class ApiconfigTest extends WP_UnitTestCase {
     private $clientConfig;
	 public function setUp()
		{
       
		$this->clientConfig = array(
		'grant_type' => 'authorization_code',
		'client_id' => getenv('CLIENT_ID'),
		'client_secret' => getenv('CLIENT_SECRET'),
		'code' => uniqid('', true),
		'redirect_uri' => "http://quantimodo.projectstatus.in/",
	);
           
    }
	 
	public function testGetAccessToken()
    {
      
	$url_params = http_build_query($this->clientConfig);

			$url = "https://staging.quantimo.do:443/api/oauth2/token?" . $url_params;
			$curl = curl_init();
			curl_setopt($curl, CURLOPT_URL, $url);
			curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($curl, CURLOPT_POST, 1);
			curl_setopt($curl, CURLOPT_POSTFIELDS, $this->clientConfig);
			// PROVIDER NORMALIZATION: PayPal requires Accept and Accept-Language headers, Reddit requires sending a User-Agent header
			// PROVIDER NORMALIZATION: PayPal/Reddit requires sending the client id/secret via http basic authentication
			curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, (get_option('qmoa_http_util_verify_ssl') == 1 ? 1 : 0));
			curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, (get_option('qmoa_http_util_verify_ssl') == 1 ? 2 : 0));
			$result = curl_exec($curl);
			break;
	// parse the result:
	$result_obj = json_decode($result, true); // PROVIDER SPECIFIC: QuantiModo encodes the access token result as json by default		
	$access_token = $result_obj['access_token']; // PROVIDER SPECIFIC: this is how QuantiModo returns the access token KEEP THIS PROTECTED!			
    }	
}