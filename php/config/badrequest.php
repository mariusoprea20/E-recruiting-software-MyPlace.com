<?php
class BadRequest extends Exception{
    
    public function badRequestMessage(){
        http_response_code(400);
        $output["message"]= $this->message;
        return $output;
    }
}