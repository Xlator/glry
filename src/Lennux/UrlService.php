<?php

namespace Lennux;

class UrlService {
    private $db;
    private $urls = array();

    const url_regex = '^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?^';

    public function __construct($db) {
        $this->db = $db;
        $this->urls = $this->readUrls();
    }

    private function readUrls() {
        $sql = "SELECT * FROM urls ORDER BY timestamp DESC";
        $urls = $this->db->fetchAll($sql);
        $list = array();
        foreach($urls as $u) {
            $list[$u["slug"]]["url"] = $u["url"];
            $list[$u["slug"]]["timestamp"] = $u["timestamp"];
        }
        return $list;
    }

    public function add($slug = NULL, $url) {
        if(!\preg_match(self::url_regex, $url)) 
            throw new \Exception('Invalid URL');

        if(isset($this->urls[$slug]))
            throw new \Exception('URL short name already exists');

        if(is_null($slug)) {
            $sql = "SHOW TABLE STATUS LIKE 'urls'";
            $info = $this->db->fetchAssoc($sql);
            $id = $info['Auto_increment'];
            $slug = base_convert($id*1000, 10, 36);
        }

        $this->db->insert('urls', array('url' => $url, 'slug' => $slug));
    }

    public function delete($slug) {
        return $this->db->delete('urls', array('slug' => $slug));
    }
    
    public function get($slug){
        if(!array_key_exists($slug, $this->urls))
            throw new \Exception('No such URL');

        return $this->urls[$slug]["url"];
    }

    public function getAll() {
        return $this->urls;
    }
}
