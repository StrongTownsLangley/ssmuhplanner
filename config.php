<?php
/**
 * SSMUH Planner - Configuration
 * 
 * This file contains configuration settings for the SSMUH Planning Tool.
 */

// Version information
define('SSMUH_PLANNER_VERSION', '1.0.0');

// Path settings
define('SSMUH_PLANNER_PATH', __DIR__ . '/..');
define('SSMUH_PLANNER_DATA_PATH', SSMUH_PLANNER_PATH . '/data');
define('SSMUH_PLANNER_ASSETS_PATH', SSMUH_PLANNER_PATH . '/assets');

// URL settings (for standalone mode)
define('SSMUH_PLANNER_URL', './');
define('SSMUH_PLANNER_ASSETS_URL', SSMUH_PLANNER_URL . 'assets/');

// Debug mode (set to false in production)
define('SSMUH_PLANNER_DEBUG', false);
