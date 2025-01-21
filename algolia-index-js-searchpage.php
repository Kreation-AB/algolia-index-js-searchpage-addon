<?php

/**
 * Plugin Name:       Algolia Index Js Search Page (Tingsryd Fork)
 * Plugin URI:        (#plugin_url#)
 * Description:       Replaces search page with a js (instant search) page.
 * Version: 3.3.0
 * Author:            Sebastian Thulin
 * Author URI:        (#plugin_author_url#)
 * License:           MIT
 * License URI:       https://opensource.org/licenses/MIT
 * Text Domain:       algolia-index-js-searchpage
 * Domain Path:       /languages
 */

 // Protect agains direct file access

if (! defined('WPINC')) {
    die;
}

define('ALGOLIAINDEXJSSEARCHPAGE_PATH', plugin_dir_path(__FILE__));
define('ALGOLIAINDEXJSSEARCHPAGE_URL', plugins_url('', __FILE__));
define('ALGOLIAINDEXJSSEARCHPAGE_TEMPLATE_PATH', ALGOLIAINDEXJSSEARCHPAGE_PATH . 'templates/');
define('ALGOLIAINDEXJSSEARCHPAGE_VIEW_PATH', ALGOLIAINDEXJSSEARCHPAGE_PATH . 'views/');

load_plugin_textdomain('algolia-index-js-searchpage', false, plugin_basename(dirname(__FILE__)) . '/languages');

// Autoload from plugin
if (file_exists(ALGOLIAINDEXJSSEARCHPAGE_PATH . 'vendor/autoload.php')) {
    require_once ALGOLIAINDEXJSSEARCHPAGE_PATH . 'vendor/autoload.php';
}
require_once ALGOLIAINDEXJSSEARCHPAGE_PATH . 'Public.php';

// Start application
new AlgoliaIndexJsSearchpage\App();
