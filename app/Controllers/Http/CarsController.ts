import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
const axios = require('axios')
import Route from '@ioc:Adonis/Core/Route'


export default class CarsController {

  private searchIncudData(included: any[], id: any, type: any) {
    return included.find(i => i.id == id && i.type == type)
  }

  public photos(results) {
    const cars = results.data.data?.map(car => {
      const photos = car.relationships?.['car-photos']?.data?.map?.(photo => {
        const photoIncluded = results.data.included?.find(include => {
          return include.id == photo.id && include.type == 'car-photos'
        })
        photo.include = photoIncluded
        return photo
      })

      car.photos = photos
      return car
    })
    return cars
  }

  public datas(results) {
    const includedData = results.data.data?.map(car => {
      Object.keys(car?.relationships).map(rKey => {
        let relationships = car?.relationships[rKey]
        if (typeof relationships.data == 'object') {
          relationships.data.include = this.searchIncudData(results.data.included, relationships.data.id, relationships.data.type)

        } else if (Array.isArray(relationships.data)) {
          relationships.data?.map(r => {
            r.include = this.searchIncudData(results.data.included, r.id, r.type)
          })
        }
      })
    })
    // console.log('includedData', JSON.stringify(results.data.data[0], null, 2))
    includedData
    const alldata = results.data.data
    return alldata
  }

  public activeMile(request) {
    let mile0 = ""
    let activeMiless = request.input('active_mileage', "")
    if (activeMiless == "") {
      mile0 = "active"
    }
    return mile0
  }
  public activeColor(request) {
    var colorActive0
    let colorActive = request.input('car_color', "")
    if (colorActive == "") {
      colorActive0 = "active"
    }
    return colorActive0
  }
  public activeBody(request) {
    var bodyActive0
    let bodyActive = request.input('car_type', "")
    if (bodyActive == "") {
      bodyActive0 = "active"
    }
    return bodyActive0
  }
  public activeYear(request) {
    let year0 = ""
    let activeYear = request.input('active_year', "")
    if (activeYear == "") {
      year0 = "active"
    }
    return year0
  }
  public activePrice(request) {
    let price0 = "";
    let activePrice = request.input('active_price', "")
    if (activePrice == "") {
      price0 = "active"

    }
    return price0
  }




  public async cars({ request, view }: HttpContextContract) {
    //id ของ page
    const currentpage = request.input('page', 1)


    //กรองยี่ห้อรถ
    const grong: any[] = request.qs()?.carBrandAndModel || []
    let brandcars = ''
    for (let i = 0; i < grong.length; i++) {
      brandcars = brandcars + '&car_make[]=' + grong[i]
    }


    //กรองรุ่นรถ
    const modelcars: any[] = request.qs()?.car_model || []
    let car_model = ''
    for (let i = 0; i < modelcars.length; i++) {
      car_model = car_model + '&car_model[]=' + modelcars[i]
    }


    //id ของกล่องช้างๆ
    const carsboxdetailid = request.input('carsboxdetailid', 1)



    //กรองราคา
    const max_price = request.input('max_price', "")
    const active_price = request.input('active_price', "all")
    const min_price = request.input('min_price', "")


    //กรองปี
    const min_year = request.input('min_year', "")
    const max_year = request.input('max_year', "")
    const active_year = request.input('active_year', "all")


    //รูปแบบตัวถัง  
    const bodystyle: any[] = request.qs()?.car_type || []
    let car_type = ''
    for (let i = 0; i < bodystyle.length; i++) {
      car_type = car_type + '&car_type[]=' + bodystyle[i]
    }


    //ระยะวิ่ง
    const min_mileage = request.input('min_mileage', "")
    const max_mileage = request.input('max_mileage', "")
    const active_mileage = request.input('active_mileage', "all")


    //กรองสี
    const color: any[] = request.qs()?.car_color || []
    let car_color_str = ''
    for (let i = 0; i < color.length; i++) {
      car_color_str = car_color_str + '&car_color[]=' + color[i]
    }
    //checkbox ผ่านการตรวจสอบจากคาร์มานา
    const certified = request.input('is_certified', "false")



    const getCarModelsById: any = async (id) => {
      return await axios.get(`https://carmana.com/api/v2/car-models?car_make_id=${id}`)
    }

    let endpoint = `https://carmana.com/api/v2/cars?min_price=${min_price}&max_price=${max_price}&min_mileage=${min_mileage}&max_mileage=${max_mileage}&min_year=${min_year}&max_year=${max_year}${car_type}${car_color_str}&is_certified=${certified}&active_year=${active_year}&active_price=${active_price}&active_mileage=${active_mileage}${brandcars}${car_model}&page[number]=${currentpage}&sort=&include=redbook-info.car-submodel.car-model.car-make,car-photos,wished-car,wisher`
    let results = await axios.get(endpoint)
    let carsbox = await axios.get('https://carmana.com/api/v2/car-makes')
    let carsboxdetail = await getCarModelsById(carsboxdetailid)

    //datas cars
    const cars = this.photos(results)
    const alldata = this.datas(results)
    let countpage = results.data.meta.page?.['total-pages']
    //active miles
    let mile0 = this.activeMile(request)
    let colorActive0 = this.activeColor(request)
    let bodyActive0 = this.activeBody(request)
    let year0 = this.activeYear(request)
    let price0 = this.activePrice(request)


    const makeUrl = (query = {}, appendQuery = false, appendArray = true) => {
      if (appendArray) {
        Object.keys(query).map(key => {
          if (Array.isArray(query[key])) {
            console.log(key, query[key], request.qs()?.[key])
            query[key] = [...new Set([...query[key], ...(request.qs()?.[key] || [])])]
          }
        })
      }
      return Route.makeUrl('/cars', {}, {
        qs: {
          ...(appendQuery ? request.qs() : {}),
          ...query
        },
      })
    }


    //load view
    return await view.render('pages/cars', {
      cars: cars,
      carsbox: carsbox.data.data,
      carsboxdetail: carsboxdetail.data.data,
      count_cars: results.data.meta.page?.['total-count'],
      countpage: countpage,
      alldata: alldata,
      getCarModelsById,
      makeUrl,

      mile0: mile0,
      year0: year0,
      price0: price0,
      colorActive0: colorActive0,
      bodyActive0: bodyActive0
    });

  }




  //รถที่ดูแลการขายโดย carmana
  public async ascars({ request, view }: HttpContextContract) {
    //id ของ page
    const currentpage = request.input('page', 1)


    //กรองยี่ห้อรถ
    const grong: any[] = request.qs()?.carBrandAndModel || []
    let brandcars = ''
    for (let i = 0; i < grong.length; i++) {
      brandcars = brandcars + '&car_make[]=' + grong[i]
    }


    //กรองรุ่นรถ
    const modelcars: any[] = request.qs()?.car_model || []
    let car_model = ''
    for (let i = 0; i < modelcars.length; i++) {
      car_model = car_model + '&car_model[]=' + modelcars[i]
    }


    //id ของกล่องช้างๆ
    const carsboxdetailid = request.input('carsboxdetailid', 1)



    //กรองราคา
    const max_price = request.input('max_price', "")
    const active_price = request.input('active_price', "all")
    const min_price = request.input('min_price', "")


    //กรองปี
    const min_year = request.input('min_year', "")
    const max_year = request.input('max_year', "")
    const active_year = request.input('active_year', "all")


    //รูปแบบตัวถัง  
    const bodystyle: any[] = request.qs()?.car_type || []
    let car_type = ''
    for (let i = 0; i < bodystyle.length; i++) {
      car_type = car_type + '&car_type[]=' + bodystyle[i]
    }


    //ระยะวิ่ง
    const min_mileage = request.input('min_mileage', "")
    const max_mileage = request.input('max_mileage', "")
    const active_mileage = request.input('active_mileage', "all")


    //กรองสี
    const color: any[] = request.qs()?.car_color || []
    let car_color_str = ''
    for (let i = 0; i < color.length; i++) {
      car_color_str = car_color_str + '&car_color[]=' + color[i]
    }
    //checkbox ผ่านการตรวจสอบจากคาร์มานา
    const certified = request.input('is_certified', "false")



    const getCarModelsById: any = async (id) => {
      return await axios.get(`https://carmana.com/api/v2/car-models?car_make_id=${id}`)
    }

    let endpoint = `https://carmana.com/api/v2/carmana-sales-assisted-cars?min_price=${min_price}&max_price=${max_price}&min_mileage=${min_mileage}&max_mileage=${max_mileage}&min_year=${min_year}&max_year=${max_year}${car_type}${car_color_str}&is_certified=${certified}&active_year=${active_year}&active_price=${active_price}&active_mileage=${active_mileage}${brandcars}${car_model}&page[number]=${currentpage}&sort=&include=redbook-info.car-submodel.car-model.car-make,car-photos,wished-car,wisher`
    let results = await axios.get(endpoint)
    let carsbox = await axios.get('https://carmana.com/api/v2/car-makes')
    let carsboxdetail = await getCarModelsById(carsboxdetailid)

    //datas cars
    const cars = this.photos(results)
    const alldata = this.datas(results)
    let countpage = results.data.meta.page?.['total-pages']
    //active miles
    let mile0 = this.activeMile(request)
    let colorActive0 = this.activeColor(request)
    let bodyActive0 = this.activeBody(request)
    let year0 = this.activeYear(request)
    let price0 = this.activePrice(request)


    const makeUrl = (query = {}, appendQuery = false, appendArray = true) => {
      if (appendArray) {
        Object.keys(query).map(key => {
          if (Array.isArray(query[key])) {
            console.log(key, query[key], request.qs()?.[key])
            query[key] = [...new Set([...query[key], ...(request.qs()?.[key] || [])])]
          }
        })
      }
      return Route.makeUrl('/cars', {}, {
        qs: {
          ...(appendQuery ? request.qs() : {}),
          ...query
        },
      })
    }


    //load view
    return await view.render('pages/cars', {
      cars: cars,
      carsbox: carsbox.data.data,
      carsboxdetail: carsboxdetail.data.data,
      count_cars: results.data.meta.page?.['total-count'],
      countpage: countpage,
      alldata: alldata,
      getCarModelsById,
      makeUrl,

      mile0: mile0,
      year0: year0,
      price0: price0,
      colorActive0: colorActive0,
      bodyActive0: bodyActive0
    });

  }


}
