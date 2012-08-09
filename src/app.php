<?php

require_once __DIR__.'/init.php';

/** Routes */
    $app->get('/', function() use($app){
        return $app['twig']->render('collections.html', array(
            'collections' => $app['galleryService']->getCollections()
        ));
    });

    $app->get('/c/{collection_id}', function($collection_id) use ($app){
        return $app['twig']->render('images.html', array(
            'collection' => $app['galleryService']->getCollection($collection_id),
            'collection_id' => $collection_id
        ));
    });

    $app->post('/install', function(Request $request) use ($app) {
        $app['login']->storeHash($request->get('pass'));
        /* return $app->redirect($app['base']); */
    }); 

    $app->get('/install', function() use ($app) {
        if($app['login']->checkAuth())
            throw new Exception('Password is already set');
        return $app['twig']->render('install.html');
    });

    $app->post('/login', function (Request $request) use($app) {
        if($app['login']->checkPass($request->get('pass')))
            $app['session']->set("login", 1);

        return $app->redirect($app['base']);
    });
    
    $app->get('/new/{token}', function(Request $request) use($app) {
        var_dump($request);
        var_dump($app['session']);
    });
return $app;
