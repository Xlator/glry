<?php

namespace Lennux;

class ImageService {
    private $app;

    private $imagePath;
    private $tmpPath;
    private $exif = array();
    private $orientation;
    private $width;
    private $height;

    public function __construct($app, $imagePath, $tmpPath) {
        $this->app = $app;
        $this->imagePath = $imagePath;
        $this->tmpPath = $tmpPath;
        $this->exif = exif_read_data($tmpPath);
        $this->width = $this->exif['COMPUTED']['Width'];
        $this->height = $this->exif['COMPUTED']['Height'];
        @$this->orientation = $this->exif['Orientation'];
    }

    public function __get($value) {
        return $this->$value;
    }

    public function write() {
        copy($this->tmpPath, $this->imagePath);
    }

    public function resize() {
        $filter = "resize";
        $tmpFile = sprintf("/tmp/%s", md5(microtime()));
        /* if($this->width > $this->height) */
        /*     $args = '1125x'; */
        /* else { */
        /*     $args = 'x840'; */
        /* } */ 
        $args = "1125x840";
        if($this->runCommand($filter, $args, $tmpFile))
            return $tmpFile;
        return false;

    }

    public function rotate($deg = NULL) {
        if(is_null($this->orientation))
            return false;
        $tmpFile = sprintf("/tmp/%s", md5(microtime()));
        if(!is_null($deg)) {
            $filter = 'rotate';
            $args = $deg;
        }
        else {
            switch($this->orientation) {
                case 2:
                    $filter = 'flip';
                    $args = 'horizontal';
                    break;
                case 3:
                    $filter = 'rotate';
                    $args = '180';
                    break;
                case 4:
                    $filter = 'flip';
                    $args = 'vertical';
                    break;
                case 5:
                    $filter = 'transpose';
                    $args = '';
                    break;
                case 6:
                    $filter = 'rotate';
                    $args = '90';
                    break;
                case 7:
                    $filter = 'transverse';
                    $args = '';
                    break;
                case 8:
                    $filter = 'rotate';
                    $args = '270';
                    break;
                default: 
                    return $this->tmpPath;
            }
        }
        if($this->runCommand($filter, $args, $tmpFile))
            return $tmpFile;
        return false;
    }

    private function runCommand($filter, $args, $outFile) {
        $out = array();
        exec($this->app['im_prefix']."/convert $this->tmpPath -$filter $args $outFile", $out, $ret);
        if($ret == 0) {
            $this->tmpPath = $outFile;    
            return true;
        }
        throw new \Exception('ImageMagick failed with a return code of $ret');
        return false;
    }
}
