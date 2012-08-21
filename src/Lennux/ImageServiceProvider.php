<?php

namespace Lennux;
use Silex\Application;
use Silex\ServiceProviderInterface;

class ImageServiceProvider implements ServiceProviderInterface {
    public function register(Application $app){
        $app['imageService'] = $app->share(function($tmpPath, $imagePath) use($app){
            return new ImageService($app, $tmpPath, $imagePath);
        });
    }

    public function boot(Application $app) {}
}
