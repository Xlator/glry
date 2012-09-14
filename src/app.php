<?php
/* phpinfo(); */
/* var_dump(sprintf("%s%scollections/", $_SERVER['DOCUMENT_ROOT'], $this->app['base'])); */
ini_set('html_errors', 'on');
date_default_timezone_set(@date_default_timezone_get());

/** Namespaces **/
    use Silex\Application;
    use Symfony\Component\HttpFoundation\Request;
    use Symfony\Component\HttpFoundation\Response;

/** Bootstrap **/
    require_once __DIR__.'/../vendor/autoload.php';
    $path = pathinfo($_SERVER['SCRIPT_NAME']);
    $app = new Application();
    $app['im_prefix'] = "/usr/local/bin";

    $app['debug'] = true;
    $app['base'] = ($path['dirname'] != "/" ? $path['dirname'] . "/" : "/" );

    /* var_dump($_SERVER); */
    $dbfile = __DIR__."/../db/glry.db";

    if(!file_exists($dbfile)) {
        copy(__DIR__."/../db/glry.db.dist", $dbfile);
        /* chmod('/db/glry.db', 0700); */
    }

    $app->register(new Silex\Provider\TranslationServiceProvider());
    $app->register(new Silex\Provider\SessionServiceProvider());
    $app->register(new Silex\Provider\FormServiceProvider());

    // Initialise templating and set default date format
    $app->register(new Silex\Provider\TwigServiceProvider(), 
        array('twig.path' => __DIR__.'/views'));
    $app['twig']->getExtension('core')->setDateFormat('Y-m-d');

    // Setup database
    $app->register(new Silex\Provider\DoctrineServiceProvider(), array(
        'db.options' => array(
            'driver' => 'pdo_sqlite',
            'path'   => __DIR__.'/../db/glry.db',
        ),  
    ));

    // Initialise services
    $app->register(new Lennux\GalleryServiceProvider());
    $app->register(new Lennux\UploadServiceProvider());
    $app->register(new Lennux\LoginServiceProvider());

    // Mount controllers
    $app->mount('/', new Lennux\Controller\BaseControllers);
    $app->mount('/api', new Lennux\Controller\ApiControllers);

    if($app['session']->get('login') == 1)
        $app->mount('/admin', new Lennux\Controller\AdminControllers);

return $app;
