<?php
/**
 *	Template Name: Manage Accounts Page V2
 *	Description: Page to manage accounts on, what did you expect?
 * Can be seen at https://quantimo.do/connect/
 */
add_action( 'admin_enqueue_scripts', 'queue_my_admin_scripts');

function queue_my_admin_scripts() {
	wp_enqueue_script (  'my-spiffy-miodal' ,       // handle
	URL_TO_THE_JS_FILE  ,       // source
	array('jquery-ui-dialog')); // dependencies
	// A style available in WP
	wp_enqueue_style (  'wp-jquery-ui-dialog');
}

wp_enqueue_style("manageaccounts", get_stylesheet_directory_uri()."/css/manageaccountsv2.css");
wp_enqueue_style("jquery-ui-flick", get_stylesheet_directory_uri()."/css/jquery-ui-flick.css");
wp_enqueue_style("jquery-dropdown", get_stylesheet_directory_uri()."/css/jquery.dropdown.css");

wp_enqueue_script("jquery", true);
wp_enqueue_script("jquery-ui-core");
wp_enqueue_script("jquery-ui-dialog");
//wp_enqueue_script("jquery-ui-datepicker");
//wp_enqueue_script("jquery-ui-button");
//wp_enqueue_script("jquery-ui-sortable");
wp_enqueue_script("jquery-dropdown",get_stylesheet_directory_uri()."/js/libs/jquery.dropdown.min.js", "jquery");
// wp_enqueue_script("jquery-ajaxform",get_stylesheet_directory_uri()."/js/libs/jquery.form.min.js", "jquery");
//wp_enqueue_script("jquery-touch",get_stylesheet_directory_uri()."/js/libs/jquery.ui.touch-punch.min.js", "jquery");
wp_enqueue_script("mustache",get_stylesheet_directory_uri()."/js/libs/mustache.js");
wp_enqueue_script("qm-sdk", get_stylesheet_directory_uri()."/js/libs/quantimodo-api.js", "jquery", false, true);

wp_enqueue_script("manageaccounts", get_stylesheet_directory_uri()."/js/manageaccountsv2.js", "qm-sdk", false, true);

get_header();
?>

<?php if(!is_user_logged_in()): ?>
<div
	class="dialog-background" id="login-dialog-background"></div>
<div class="dialog" id="login-dialog">
	<?php login_with_ajax(); ?>
</div>
<?php endif; ?>

<div id="content">
	<div class="modal-body">
		<div>
			<div id="connectorInfoTable">
				<script type="text/html" id="connectorsTemplate">
					{{#connectors}}
						<div class="connectorBlock" id="connector-{{name}}">	
							<div class="connectors" style="text-align: center; vertical-align: middle;" id="connectorName-{{name}}">
								<img class="connectorLogo {{^connected}}grayout{{/connected}}" src="{{image}}" alt="{{name}}" {{^connected}}style="filter: grayscale(100%);-webkit-filter: grayscale(100%);filter: gray;-webkit-transition: all .6s ease;"{{/connected}}>
								<h6>{{displayName}}</h6>
							</div>
						</div>

						<div class="connectorDialog" id="showDialog-{{name}}">
							<div class="connectNotificationContainer" id="connectNotificationContainer-{{name}}" style="height: 0px;"></div>
							<div class="clearfix">
								<div style="float: left;width: 140px;">
									<div style="height: 150px;">
										<img class="connectorLogo" src="{{image}}" alt="{{name}}" style="width: 140px; height: 140px;">
										{{^connected}}
										  <img class="connectorStatus" src="https://i.imgur.com/tvNH2wA.png" height="30px" width="30px" style="position: relative; top: -40px; left: 110px;">
										{{/connected}}
										{{#connected}}
										  <img class="connectorStatus" src="https://i.imgur.com/Rvv8Ujo.png" height="30px" width="30px" style="position: relative; top: -40px; left: 110px;">
										{{/connected}}
									</div>
									{{#connected}}
										<div class="buttons">
											<button class="disconnect-button" id="update-{{name}}" style="display: block; width: 120px; margin: auto; margin-bottom: 5px;">Sync</button>
											<button class="disconnect-button" id="disconnect-{{name}}" style="display: block; width: 120px; margin: auto;">Disconnect</button>
										</div>  							
									{{/connected}}
								</div>
								<div class="connectorDialog-desc">{{text}}
									{{#connectInstructions}}
										<form id="connectform-{{name}}" style="{{#connected}}display:none{{/connected}}">
											{{#parameters}}
												<label for="{{name}}-{{key}}">{{displayName}}</label>
												<input type="{{type}}" name="{{key}}" id="{{name}}-{{key}}" placeholder="{{placeholder}}">{{defaultValue}}</input>
											{{/parameters}}
											<input type="submit" value="Connect" style="margin-top: 10px; float:right;">
										</form>
									{{/connectInstructions}}
									
		                                                         
									{{^noDataYet}}
										<table class="connectorInfoTable" style="{{^connected}}display:none{{/connected}}">
											<tr class="tabletr">
												<td class="bold">Last Sync</td>
												<td id="connectorDialog-lastUpdate-{{name}}">{{^syncing}}{{lastUpdate}} {{/syncing}}{{#syncing}}Now synchronizing{{/syncing}}</td>
											</tr>
											<tr class="tabletr">
												<td class="bold">Latest Data</td>
												<td id="connectorDialog-latestData-{{name}}">{{latestData}}</td>
											</tr>
										</table>
									{{/noDataYet}}

									{{#noDataYet}}
										<b>Retrieving Data Check back soon!</b>
									{{/noDataYet}}
		                                                        
									{{#connected}} 
										{{^noDataYet}}
										<a class="view-updates-button" id="viewUpdates-{{name}}" href="#"><i class="icon-table"></i> View Updates</a>
										{{/noDataYet}}    
									{{/connected}}
								</div>
							</div>
							{{#showGetItButton}}
								<div class="getitnow-container">
									<a href="{{getItUrl}}" target="_blank">GET IT HERE</a>
								</div>
							{{/showGetItButton}}
						</div>
					{{/connectors}}
				</script>
			</div>
		</div>
	</div>
	<div class="modal-footer">
<!--		<div class="synchAll">
			<a id="sync-all" href="#" class="btn btn-info">sync all your devices
				now <i class="icon-refresh"></i>
			</a>
		</div>-->
	</div>
</div>

<div style="display: none;">
	<table class="updates-table">
		<thead>
			<th>Status</th>
			<th>Time</th>
			<th>Measurements</th>
		</thead>
	</table>
</div>

<?php
get_footer();
?>

