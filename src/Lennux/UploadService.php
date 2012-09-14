<?php

namespace Lennux;

class UploadService {
    private $db;

    public function __construct($app, $db) {
        $this->db = $db;
        $this->app = $app;
    }

    public function upload($filename, $data, $collection) {
        $imagePath = sprintf("%s%scollections/%d/%s", 
            $_SERVER['DOCUMENT_ROOT'], $this->app['base'], $collection, $filename);

        $file = $this->decodeData($data);
        $tmpName = sprintf('/tmp/%s', md5(microtime()));

        if(!file_put_contents($tmpName, $file)) {
            throw new \Exception('File upload failed');
            return false;
        }

        $image = new ImageService($this->app, $imagePath, $tmpName);

        try {
            if(!is_null($image->orientation))
                $image->rotate();
            $image->resize();
            $image->write();
        }
        catch(\Exception $e) {
            return $this->app->json(array("Exception" => $e->getMessage()), 500);
        }
    }

    private function decodeData($encoded) {
        $data = explode(',', $encoded);
        return base64_decode(str_replace(' ','+',$data[1]));
    }
    
    private function insertId($table) {
        $sql = "SELECT last_insert_rowid() AS id '?' LIMIT 1";
        $info = $this->db->fetchAssoc($sql, array($table));
        return $info['id'];
    }

}
