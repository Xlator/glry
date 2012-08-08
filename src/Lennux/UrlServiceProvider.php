<?php
namespace Lennux;
use Silex\Application;
use Silex\ServiceProviderInterface;

class UrlServiceProvider implements ServiceProviderInterface {
    public function register(Application $app){
        $app['urlService'] = $app->share(function() use($app){
            return new UrlService($app['db']);
        });
    }

    public function boot(Application $app) {}
}
