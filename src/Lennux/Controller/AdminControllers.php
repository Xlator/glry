<?php

namespace Lennux\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Silex\ControllerCollection;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminControllers implements ControllerProviderInterface  {
    public function connect(Application $app) {
        $controllers = $app['controllers_factory'];
            $controllers->get('/{collection}', function($collection) use ($app) {
                if((int)$app['session']->get('login') == 0)
                    return $app->redirect('/glry');

                $data = array(
                    'username' => 'Username',
                    'password' => 'Password',
                );

                $form = $app['form.factory']->createBuilder('form', $data)
                    ->add('username')
                    ->add('password','password')
                    ->getForm();

                return $app['twig']->render('admin.html', array(
                    'collection_id' => $collection,
                    'images' => $app['galleryService']->getCollection($collection),
                    'collections' => $app['galleryService']->getCollections(),
                    'form' => $form->createView(),
                    'logged_in' => 1,
                )); 

            });

            $controllers->post('/create', function() use($app) {
                try {
                    $id = $app['galleryService']->addCollection();
                }
                catch(\Exception $e)
                {
                    return $app->json(array("Exception" => $e), 500);
                }
                return $app->json($id, 200);
                
            });
            
            $controllers->post('/delete/{collection}/{image}', function(Request $request, $collection, $image) use ($app) {
                $ret = $app['galleryService']->deleteImage($image);
                if($ret === true)
                    return $app->json(array(), 200);
                else
                    return $app->json(array("Exception" => $ret), 500);
            });

            $controllers->post('/reorder/{collection}', function(Request $request, $collection) use ($app) {
                $order = $request->request->get('collection');
                $status = $app['galleryService']->reorderCollection($order); 
                if($status === true)
                    return $app->json(array('message' => "Collection $collection updated"), 200);

                return $app->json(array($status), 500);
            });

            $controllers->post('/upload/{collection}', 
                function(Request $request, $collection) use($app) {
                $file = $request->request->all();

                try {
                    $app['uploadService']->upload($file['name'], $file['value'], $collection);
                    return $app->json(array(
                        'id' => $app['galleryService']->addImage($collection, $file['name'])
                    ), 200);
                }

                catch(\Exception $e) {
                    return $app->json(array('Exception' => $e), 500);    
                }
            });

            $controllers->post('/rename/{image}', 
                function(Request $request, $image) use ($app) {
                $title = $request->request->get('title');
                $ret = $app['galleryService']->renameImage($image, $title);
                if($ret === true) {
                    return $app->json(array("message" => "Image $image renamed"), 200);
                }
                return $app->json(array("Exception" => $ret->getMessage()), 500);

            });


            $controllers->post('/rename', 
                function(Request $request) use ($app) {
                $collection = $request->request->get('collection');
                $title = $request->request->get('title');
                $ret = $app['galleryService']->renameCollection($collection, $title); 
                if($ret === true) {
                    return $app->json(array("message" => "Collection $collection renamed"), 200);
                }
                return $app->json(array("Exception" => $ret->getMessage()), 500);
            });

            $controllers->post('/delete/{collection}',
                function($collection) use ($app) {
                    $ret = $app['galleryService']->deleteCollection($collection);
                    if($ret === true)
                        return $app->json(array("message" => "Collection $collection deleted"), 200);
                    return $app->json(array("Exception" => $ret->getMessage()), 500);
                        
                });
            

            $controllers->post('/delete',
                function(Request $request) use ($app) {
                $delete = $request->request->get('delete');
                $ret = $app['galleryService']->deleteImages($delete);
                if($ret === true)
                    return $app->json(array("message" => "Images deleted"), 200);
                return $app->json(array("Exception" => $ret->getMessage()), 500);
            });
        return $controllers;

    }
}
