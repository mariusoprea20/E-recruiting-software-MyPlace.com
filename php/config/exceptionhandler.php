<?php
/**
 * ExceptionHandler catch and exception thrown by the server
 * logs the exception into a file and displays 500 http response code.
 * @author Marius Oprea
 * @id w20039534
 */

function exceptionHandler($e){
//display status code internal server error
http_response_code(500);
//error date
$output['date']=date('D M j G:i:s T Y');
//get the  exception message
$output['message']= $e->getMessage();
//get the file location
$output['location']['file']= $e->getFile();
//get the line location
$output['location']['line']= $e->getLine();
//open a file error
$fileError=fopen("config/fileError.txt", "ab");
//write to the file 
fwrite($fileError, json_encode($output).PHP_EOL);
//close the file
fclose($fileError);
//stop the current process 
die();
}


