<?php

namespace Lennux;

class InstallerService {
    private $app;
    public $status = true;

    public function __construct($app) {
        $this->app = $app;
    }

    public function db() {
        $dbfile = __DIR__."/../../db/glry.db";
        if(!file_exists($dbfile)) {
            @copy(__DIR__."/../../db/glry.db.dist", $dbfile);
            @chmod($dbfile, 0700);
        }
    }

    public function checkPerms() {
        $path = __DIR__."/../../";
        $files = array("db/", "db/glry.db", "web/collections", "web/collections/1");

        $filePerms = array();
        foreach($files as $f) {
            $w = is_writeable($path."/".$f);

            // Install database!
            if($f == "db/" && $w)
                $this->db();

            if(!$w)
                $this->status = false;
            array_push($filePerms, array("filename" => $f, "writable" => $w));

        }

        return $filePerms;
    } 
}
