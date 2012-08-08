<?php

use Lennux\LoginServiceProvider;
use Silex\SessionServiceProvider;
use Silex\Provider\TwigServiceProvider;
use Silex\Provider\DoctrineServiceProvider;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/** Bootstrap **/
require_once __DIR__.'/../vendor/autoload.php';
$path = pathinfo($_SERVER['SCRIPT_NAME']);
$app = new Application();
$app['debug'] = true;
$app['base'] = ($path['dirname'] != "/" ? $path['dirname'] . "/" : "/" );
$app->register(new TwigServiceProvider(), array('twig.path' => __DIR__.'/templates'));
$app->register(new DoctrineServiceProvider(), array(
    'db.options' => array(
        'driver' => 'pdo_sqlite',
        'path'   => __DIR__.'/glry.db',
    ),  
));

/** App Definition */
$app->get('/', function() use($app){
    return $app['twig']->render('collections.html');
});

$app->get('/c/{collection}', function($collection) use ($app){
    return $app['twig']->render('images.html', array('collection' => $collection));
});

return $app;

