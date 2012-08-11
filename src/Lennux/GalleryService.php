<?php

namespace Lennux;

class GalleryService {
    private $db;
    private $urls = array();

    public function __construct($db) {
        $this->db = $db;
    }

    public function getCollections() {
        $sql = "SELECT c.id, c.title, c.created, i.filename AS keyimage, 
                    ((SELECT COUNT(*) FROM images 
                    WHERE collection_id = c.id)) 
                AS imagecount 
                FROM collections AS c 
                JOIN images AS i ON i.collection_id = c.id AND i.pos = 0 ";
        $collections = $this->db->fetchAll($sql);
        $colls = array();
        foreach($collections as $c) {
            $colls[$c["id"]] = $c;
        }

        return $colls;
    }

    public function getCollection($id) {
        $sql = "SELECT * FROM images WHERE collection_id = ?";
        $images = $this->db->fetchAll($sql, array($id));

        return $images;
    }

    private function insertId($table) {
        $sql = "SELECT last_insert_rowid() AS id '?' LIMIT 1";
        $info = $this->db->fetchAssoc($sql, array($table));
        return $info['id'];
    }

    public function addCollection() {
        
    }

    public function editCollection($id) {
        
    }

    public function deleteCollection($id) {
        
    }

    public function addImage($collection_id) {
        
    }

    public function editImage($id) {
        
    }

    public function deleteImage($id) {
        
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
