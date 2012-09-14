<?php
namespace Lennux;
use Silex\Application;
use Silex\ServiceProviderInterface;

class InstallerServiceProvider implements ServiceProviderInterface {
    public function register(Application $app){
        $app['install'] = $app->share(function() use($app){
            return new InstallerService($app);
        });
    }

    public function boot(Application $app) {}
}
