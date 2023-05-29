<?php
/**
 * Autoloader defined to automatically load all .php 
 * files in index.php class
 * 
 * @author Marius Oprea
 * @id w20039534
 */
class Autoload
{
    public static function autoloader($className) {
        /**
         * We use // as a placeholder to first convert all files to lowercases
         * we then replace // with directory_separator as diff OS have the slashes in the path
         * and we need to make sure the path is constant and accepted in each OS
         */
        $filename = "src\\" . strtolower($className) . ".php";
        $filename = str_replace('\\', DIRECTORY_SEPARATOR, $filename);
        if (is_readable($filename)) {
            include_once $filename;
        } else {
            throw new Exception("File not found: " . $className . " (" . $filename . ")");
        }
    }
}