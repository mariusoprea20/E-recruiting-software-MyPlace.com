<?php
/**
 * config.php is called in index.php to include the autoloader
 * and the handlers for any error or exception.
 * 
 * @author Marius Oprea
 * @id w20039534
 */


//turn on the errors if they are turned off in the browser  
//using ini_set $ error_reporting functions
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
 
include 'config/exceptionhandler.php';
set_exception_handler('exceptionHandler');
 
include 'config/errorhandler.php';
set_error_handler('errorHandler');
 
include 'config/autoloader.php';
spl_autoload_register('Autoload::autoloader');

include 'config/badrequest.php';
