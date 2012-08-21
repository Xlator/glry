<?php

namespace Lennux\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Silex\ControllerCollection;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiControllers implements ControllerProviderInterface  {
    public function connect(Application $app) {
        $controllers = $app['controllers_factory'];

        $controllers->get('/c/{collection_id}', function($collection_id) use ($app){
            $collection = $app['galleryService']->getCollection($collection_id);
            return $app->json($collection, 200);
        })->assert('collection_id', '\d+');

        $controllers->get('/c', function() use($app) {
            $collections = $app['galleryService']->getCollections();
            return $app->json($collections, 200);
        });
        /* $controllers->get('/new/{token}', function() use($app) { */

        /* }); */

        $controllers->post('/login', function (Request $request) use($app) {

            $data = array(
                'username' => $request->get('username'),
                'password' => $request->get('password')
            );
            
            if(!$app['login']->checkUser($data['username'], $data['password']))
                return $app->json(array('message' => 'Login failed'), 401);

            $app['session']->set('login', 1);
            return $app->json(array(), 200);

        });

        $controllers->get('/logout', function() use($app) {
            $app['session']->clear();
            return $app->json(array(), 200);
        });

        return $controllers;
    }
}
