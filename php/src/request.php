<?php
/**
 * Request class which deals with the URI. 
 * The class reads/sets the URL path and validates the 
 * request methods. 
 * @author Marius Oprea
 * @id w20039534
 */
class Request{
    private $path;
    private $method;

/**
 * When class is initiated, three things must be done:
 * set the path
 * set the method
 * validate the request method
 */
    public function __construct(){
     $this->setPath();
     $this->setMethod();
     $this->validateRequestMethod(array("GET", "POST", "PUT", "PATCH"));

    }

 public function setMethod(){
    $this->method= $_SERVER['REQUEST_METHOD'];
 }   
/**
 * @param urlMethod an array of url methods
 */
 public function validateRequestMethod($urlMethod){
    if(!in_array($this->method, $urlMethod)){
        //method not allowed 405
        http_response_code(405);
        $output['error']="Method error: ".$this->method;
        die(json_encode($output));
    }
 }

//parse the URI and set the path 
//replace the path directory to empty string for 
public function setPath(){
 $this->path= parse_url($_SERVER["REQUEST_URI"])['path'];
 //   /serverside
 $this->path= str_replace("/myplace/php", "", $this->path);
}

public function getPath(){
    return $this->path;
}


}


