<?php
namespace Lennux\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Silex\ControllerCollection;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class BaseControllers implements ControllerProviderInterface  {

    public function connect(Application $app) {
        $controllers = $app['controllers_factory'];

        $mainpage = function(Request $request) use($app) {

            $data = array(
                'username' => 'Username',
                'password' => 'Password',
            );

            $form = $app['form.factory']->createBuilder('form', $data)
                ->add('username')
                ->add('password','password')
                ->getForm();


            return $app['twig']->render('images.html', array(
                'collections' => $app['galleryService']->getCollections(),
                'form' => $form->createView(),
                'logged_in' => (int)$app['session']->get('login')
            ));

        };

        $controllers->match('/install', function(Request $request) use ($app) {

            $perms = $app['install']->checkPerms();
            $status = $app['install']->status;
            $installed = false;

            if($status && $app['login']->checkInstalled()) {
                /* throw new \Exception('Password is already set'); */
                $installed = true;
            }

            $data = array(
                'username' => 'Username',
                'password' => 'Password',
            );

            $message = "";

            $form = $app['form.factory']->createBuilder('form', $data)
                ->add('username')
                ->add('password')
                ->getForm();

            if('POST' == $request->getMethod()) {
                $form->bindRequest($request);

                /* var_dump($form->isValid()); */
                /* if($form->isValid()) { */
                    $data = $form->getData();
                    $app['login']->storeUser($data['username'], $data['password']);
                    $app->redirect($app['base']);
                /* } */

                /* else */
                /*     $message = "Invalid input"; */
            }

            return $app['twig']->render('install.html', array(
                'perms' => $app['install']->checkPerms(),
                'message' => $message, 
                'installed' => $installed,
                'form' => $form->createView())
            );
        }, 'POST|GET');
        $controllers->match('/', $mainpage, 'POST|GET');
        $controllers->match('/{collection}', $mainpage, 'POST|GET');


        return $controllers;
    }
}
