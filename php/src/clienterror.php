<?php
/**
 * Endpoint for handling client errors 
 * 
 * @author Marius Oprea
 * @id 
 */
class ClientError extends Endpoint
{
    /**
     * Override the constructor because we do
     * not need to query the database for this 
     * endpoint.
     * 
     * @param String $message - A message explaining the error
     * @param Int $code - the relevant http status code
     */
    public function __construct($message, $code) {
        // Set the relevant response code
        http_response_code($code);
 
        // We are following the same pattern for all endpoints
        $this->setData( array(
            "length" => 0,
            "message" => $message,
            "data" => null
        ));
    }
}