<?php

namespace Lennux;

class LoginService {

    public function __construct($db) {
        $this->db = $db;
        $this->hasher = new \Phpass\Hash;
    }

    public function checkAuth() {
        $result = $this->db->fetchAssoc("SELECT COUNT(*) AS count FROM login"); 
        return $result["count"];
    }

    public function storeHash($pass) {
        if($this->checkAuth())
            throw new \Exception('Password is already set');
        $hash = $this->hasher->hashPassword($pass);
        $this->db->insert('login', array('hash' => $hash));
    }

    public function checkPass($pass) {
        $stored = $this->db->fetchAssoc("SELECT hash FROM login");
        return (int) $this->hasher->checkPassword($pass, $stored["hash"]);
    }
}
