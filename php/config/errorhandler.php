<?php
/**
 * Error handler defined  to identify code errors .
 * This function thorws an Exception error which 
 * is than handled by the ExceptionHandler class.
 * 
 * @author Marius Oprea
 * @id w20039534
 */

function errorHandler($errno, $errstr, $errfile, $errline){

//this should be logged in to file as it just ignors non fatal errors
    if($errno != 2 && $errno != 8){
    //rely on the exception handler to pick up and deal with the errors;
        throw new Exception($errstr);
    }
 
}