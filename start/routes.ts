/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'
import CarsController from 'App/Controllers/Http/CarsController'
import CarsDetailsController from 'App/Controllers/Http/CarsDetailsController'


//cars
Route.get('/cars', async (ctx) => {
  return new CarsController().cars(ctx)
})

Route.get('carmana-sales-assisted-cars', 'CarsController.ascars')

Route.get('/car/:id', async (ctx) => {
  return new CarsDetailsController().carsdetail(ctx)
})






