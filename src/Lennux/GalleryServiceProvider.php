<?php
namespace Lennux;
use Silex\Application;
use Silex\ServiceProviderInterface;

class GalleryServiceProvider implements ServiceProviderInterface {
    public function register(Application $app){
        $app['galleryService'] = $app->share(function() use($app){
            return new GalleryService($app['db']);
        });
    }

    public function boot(Application $app) {}
}
