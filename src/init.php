<?php
ini_set('html_errors', 'on');
date_default_timezone_set(@date_default_timezone_get());

/** Namespaces **/
    use Lennux\LoginServiceProvider;
    use Lennux\GalleryServiceProvider;
    use Silex\Provider\SessionServiceProvider;
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

    // Initialise templating and set default date format
    $app->register(new TwigServiceProvider(), array('twig.path' => __DIR__.'/views'));
    $app['twig']->getExtension('core')->setDateFormat('Y-m-d');

    // Setup database
    $app->register(new DoctrineServiceProvider(), array(
        'db.options' => array(
            'driver' => 'pdo_sqlite',
            'path'   => __DIR__.'/../db/glry.db',
        ),  
    ));

    // Initialise services
    $app->register(new GalleryServiceProvider());
    $app->register(new LoginServiceProvider());
    $app->register(new SessionServiceProvider());
