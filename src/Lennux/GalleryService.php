<?php

namespace Lennux;

class GalleryService {
    private $db;
    private $urls = array();

    public function __construct($app, $db) {
        $this->db = $db;
        $this->app = $app;
    }

    public function getCollections() {
        $sql = "SELECT c.id, c.title, c.created, i.filename AS keyimage, 
                    ((SELECT COUNT(*) FROM images 
                    WHERE collection_id = c.id)) 
                AS imagecount 
                FROM collections AS c 
                LEFT OUTER JOIN images AS i ON i.collection_id = c.id AND i.pos = 0 ORDER BY c.pos ASC";
        $collections = $this->db->fetchAll($sql);
        /* var_dump($collections); */
        $colls = array();
        foreach($collections as $c) {
            $colls[$c["id"]] = $c;
        }

        return $colls;
    }

    public function getCollection($id) {
        $collection = $this->db->fetchAssoc("SELECT title, COUNT(*) AS count FROM collections WHERE id= ?", array($id));
        if($collection['count'] == 0)
            throw new \Exception('Collection not found');

        $sql = "SELECT id, collection_id, title, pos, filename, DATETIME(uploaded, 'localtime') AS uploaded FROM images WHERE collection_id = ? ORDER BY pos ASC";
        $images = $this->db->fetchAll($sql, array($id));
        foreach($images as $k=>$i) {
            
            $i["uploaded"] = strtotime($i['uploaded']);
            $i["imagedata"] = exif_read_data(sprintf("%s%scollections/%s/%s", $_SERVER['DOCUMENT_ROOT'], $this->app['base'], $i['collection_id'], $i['filename']), 'IFD0', 0, 1);
            $i["dimensions"][0] = $i["imagedata"]["COMPUTED"]["Width"];
            $i["dimensions"][1] = $i["imagedata"]["COMPUTED"]["Height"];
            /* $i["captured"] = new \DateTime($i["imagedata"]["DateTime"]); */
            $i["captured"] = isset($i["imagedata"]["DateTime"]) ? strtotime($i["imagedata"]["DateTime"]) : false;
            $i["gpspos"] = $this->calculateGps($i["imagedata"]);
            $images[$k] = $i;
        }
        return array('title' => $collection['title'], 'images' => $images);
    }

    private function insertId($table) {
        $sql = "SELECT last_insert_rowid() AS id FROM $table LIMIT 1";
        $info = $this->db->fetchAssoc($sql);
        return $info['id'];
    }

    public function addCollection() {
        $count = $this->db->fetchColumn('SELECT COUNT(*) FROM collections');
        $this->db->insert('collections', array('pos' => $count, 'title' => 'New collection'));
        $time = $this->db->fetchColumn("SELECT DATETIME('NOW', 'localtime')");
        $time = new \DateTime($time);
        $time = $time->getTimestamp();
        $id = $this->insertId('collections');
        mkdir(sprintf("%s%scollections/%s", $_SERVER['DOCUMENT_ROOT'], $this->app['base'], $id));
        return array("id" => $id, "created" => $time, "title" => "New collection");
    }

    public function renameCollection($id, $title) {
        try {
            $this->db->update('collections', array('title' => $title), array('id' => $id)); 
        }
        catch(\Exception $e) {
            return $e;
        }
        return true;
    }

    public function reorderCollection($order) {
        foreach($order as $pos => $id) {
            try {
                $this->db->update('images', 
                    array('pos' => $pos), array('id' => $id)
                );
            }
            catch(\Exception $e) {
                return $e;
            }
        }
        return true;
    }

    public function deleteCollection($collection) {
        try {
            $this->db->delete('collections', array('id' => $collection));
            $this->db->delete('images', array('collection_id' => $collection));
            $dir = sprintf("%s%scollections/%s", $_SERVER['DOCUMENT_ROOT'], $this->app['base'], $collection);
            function rrmdir($dir) {
                foreach(glob($dir . '/*') as $file) {
                    if(is_dir($file))
                        rrmdir($file);
                    else
                        unlink($file);
                    rmdir($dir);
                }
            }
            rrmdir($dir);
        }
        catch(\Exception $e) {
            return $e;
        }
        return true;
    }

    public function reorderCollections($order) {
        foreach($order as $pos => $id) {
            try {
                $this->db->update('collections', 
                    array('pos' => $pos), array('id' => $id)
                );
            }
            catch(\Exception $e) {
                return $e;
            }
        }
        return true;
    }

    public function addImage($collection_id, $filename, $title = NULL) {
        $count = $this->db->fetchColumn('SELECT COUNT(*) FROM images WHERE collection_id = ?', array($collection_id));
        $this->db->insert('images', 
            array('collection_id' => $collection_id, 
            'filename' => $filename,
            'pos' => $count,
            'title' => $title,
        ));
        return $this->insertId('images');
    }

    public function renameImage($id, $title) {
        try {
            $this->db->update('images', array('title' => $title), array('id' => $id)); 
        }
        catch(\Exception $e) {
            return $e;
        }
        return true;
    }

    public function editImage($id) {
    
    }

    public function deleteImages($images) {
        foreach($images as $image) {
            try {
                $this->db->delete('images', array('id' => $image));
            }
            catch(\Exception $e) {
                return $e; 
            }
        }
        return true;
    }


    private function calculateGps($exif) {
        if(!isset($exif["GPSLatitudeRef"]))
            return false; 

        $ref = array($exif["GPSLatitudeRef"], $exif["GPSLongitudeRef"]);
        $oldCoords = array($exif["GPSLatitude"], $exif["GPSLongitude"]);
        $newCoords = array();
        foreach($oldCoords as $k => $o) {
            $newCoords[$k] = abs((int)$o[0] + (((int)$o[1] / 100) / 60));
            if($ref[$k] == 'S' || $ref[$k] == 'W')
                $newCoords[$k] = $newCoords[$k] - ($newCoords[$k] * 2);
        }
        return implode(',',$newCoords);
    }
    /* public function add($slug = NULL, $url) { */
    /*     if(!\preg_match(self::url_regex, $url)) */ 
    /*         throw new \Exception('Invalid URL'); */

    /*     if(isset($this->urls[$slug])) */
    /*         throw new \Exception('URL short name already exists'); */

    /*     if(is_null($slug)) { */
    /*         $sql = "SHOW TABLE STATUS LIKE 'urls'"; */
    /*         $info = $this->db->fetchAssoc($sql); */
    /*         $id = $info['Auto_increment']; */
    /*         $slug = base_convert($id*1000, 10, 36); */
    /*     } */

    /*     $this->db->insert('urls', array('url' => $url, 'slug' => $slug)); */
    /* } */

    /* public function delete($slug) { */
    /*     return $this->db->delete('urls', array('slug' => $slug)); */
    /* } */
    
    /* public function get($slug){ */
    /*     if(!array_key_exists($slug, $this->urls)) */
    /*         throw new \Exception('No such URL'); */

    /*     return $this->urls[$slug]["url"]; */
    /* } */

    /* public function getAll() { */
    /*     return $this->urls; */
    /* } */
}
