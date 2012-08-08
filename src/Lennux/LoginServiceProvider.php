<?php
namespace Lennux;
use Silex\Application;
use Silex\ServiceProviderInterface;

class LoginServiceProvider implements ServiceProviderInterface {
    public function register(Application $app){
        $app['login'] = $app->share(function() use($app){
            return new LoginService($app['db']);
        });
    }

    public function boot(Application $app) {}
}
