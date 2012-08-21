<?php
namespace Lennux;
use Silex\Application;
use Silex\ServiceProviderInterface;

class UploadServiceProvider implements ServiceProviderInterface {
    public function register(Application $app){
        $app['uploadService'] = $app->share(function() use($app){
            return new UploadService($app, $app['db']);
        });
    }

    public function boot(Application $app) {}
}
