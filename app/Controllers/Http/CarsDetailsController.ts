import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
const axios = require('axios')

export default class CarsDetailsController {
    private searchIncudData(included: any[], id: any, type: any) {
        return included.find(i => i.id == id && i.type == type)
    }
    private searchIncudData2(included: any[], id: any, type: any) {
        return included.find(i => i.id == id && i.type == type)
    }
    public datas(results) {
        Object.keys(results.data.data?.relationships).map(rKey => {
            let relationships = results.data.data?.relationships[rKey]
            if (typeof relationships.data == 'object') {
                relationships.data.include = this.searchIncudData(results.data.included, relationships.data.id, relationships.data.type)

            } else if (Array.isArray(relationships.data)) {
                relationships.data?.map(r => {
                    r.include = this.searchIncudData(results.data.included, r.id, r.type)
                })
            }
        })
        const alldata = results.data.data
        return alldata
    }
    public photos(results) {
        const photos = results.data.data.relationships?.['car-photos']?.data?.map?.(photo => {
            const photoIncluded = results.data.included?.find(include => {
                return include.id == photo.id && include.type == 'car-photos'
            })
            photo.include = photoIncluded
            return photo
        })
        results.data.data.photos = photos
    }



    public photos2(results2) {
        const cars = results2.data.data?.map(car => {
            const photos = car.relationships?.['car-photos']?.data?.map?.(photo => {
                const photoIncluded = results2.data.included?.find(include => {
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

    public datas2(results2) {
        const includedData2 = results2.data.data?.map(car => {
            Object.keys(car?.relationships).map(rKey => {
                let relationships = car?.relationships[rKey]
                if (typeof relationships.data == 'object') {
                    relationships.data.include = this.searchIncudData2(results2.data.included, relationships.data.id, relationships.data.type)

                } else if (Array.isArray(relationships.data)) {
                    relationships.data?.map(r => {
                        r.include = this.searchIncudData2(results2.data.included, r.id, r.type)
                    })
                }
            })
        })
        includedData2
        const alldata2 = results2.data.data
        return alldata2
    }





    public async carsdetail({ request, view }: HttpContextContract) {
        const id = request.param('id')

        // api car ฟีเจอร์
        // let feature = await axios.get('https://carmana.com/api/v2/car-features')

        // api หลัก
        let endpoint = `https://carmana.com/api/v2/cars/${id}?include=user,car-photos,redbook-info.car-submodel.car-model.car-make,car-feature-variations.feature-variation.car-feature,user,car-district.car-province`
        let results = await axios.get(endpoint)

        const Province = results.data.included?.find(include => {
            return include.type == 'car-provinces'
        })
        results.data.data.Province = Province

        const submodel = results.data.included?.find(include => {
            return include.type == 'car-submodels'
        })
        results.data.data.submodel = submodel




        const carFeture = results.data.included.filter?.(tr => {          
            if(tr.type == 'car-features'){
                return tr             
            }  
           
        })
        // console.log('carFeture', JSON.stringify(carFeture, null, 2))
        // console.log('carFeture', (carFeture))












        const alldata = this.datas(results)
        const cars = this.photos(results)
        // console.log('includedData', JSON.stringify(results.data.data, null, 2))









        //api รถที่แนะนำ
        let endpoint2 = `https://carmana.com/api/v2/similar-cars?id=${id}&include=car-photos,redbook-info.car-submodel.car-model.car-make,car-feature-variations.feature-variation.car-feature,user`
        let results2 = await axios.get(endpoint2)
        const cars2 = this.photos2(results2)
        const alldata2 = this.datas2(results2)
        // console.log('includedData2', JSON.stringify(results2.data.data[0], null, 2))



        return view.render('pages/cars_detail', {
            cars: cars,
            alldata: alldata,
            carFeture: carFeture,

            cars2: cars2,
            alldata2: alldata2,

            
        });
    }
}
