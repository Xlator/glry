<?php

namespace Lennux;

class LoginService {

    public function __construct($db) {
        $this->db = $db;
        $this->hasher = new \Phpass\Hash;
    }

    public function checkInstalled() {


        $result = $this->db->fetchAssoc("SELECT COUNT(*) AS count FROM login"); 
        return $result["count"];
    }

    public function storeUser($user, $pass) {
        if($this->checkInstalled())
            throw new \Exception('Password is already set');
        $hash = $this->hasher->hashPassword($pass);
        $this->db->insert('login', array('username' => $user, 'hash' => $hash));
    }

    public function checkUser($user, $pass) {
        $stored = $this->db->fetchAssoc("SELECT hash FROM login WHERE username = ?", 
            array($user));
        return (bool) $this->hasher->checkPassword($pass, $stored["hash"]);
    }
}
