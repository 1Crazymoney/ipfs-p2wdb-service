/*
  REST API Controller library for the /entry route
*/

const { wlogger } = require('../../../adapters/wlogger')

let _this

class EntryRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /entry REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /entry REST Controller.'
      )
    }

    // Encapsulate dependencies
    // this.UserModel = this.adapters.localdb.Users
    // this.userUseCases = this.useCases.user

    _this = this
  }

  /**
   * @api {post} /entry/write Write
   * @apiPermission public
   * @apiName P2WDB Write
   * @apiGroup REST P2WDB
   *
   * @apiDescription
   * Write a new entry to the database.
   *
   * Given the body data properties returns the following properties
   *
   *  - success : - Petition status
   *  - id : "" - Orbitdb hash.
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{ "txid": "9ac06c53c158430ea32a587fb4e2bc9e947b1d8c6ff1e4cc02afa40d522d7967", "message": "test", "signature": "H+TgPR/6Fxlo2uDb9UyQpWENBW1xtQvM2+etWlSmc+1kIeZtyw7HCsYMnf8X+EdP0E+CUJwP37HcpVLyKly2XKg=", "data": "This is the data that will go into the database." }' localhost:5001/entry/write
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "success":true,
   *        "hash": "zdpuAtvo53imGJ5DDe7LrZNRZihJsGj9Q7M3bxkaf2EdK4Kfb"
   *     }
   *
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async postEntry (ctx) {
    try {
      const txid = ctx.request.body.txid
      const signature = ctx.request.body.signature
      const message = ctx.request.body.message
      const data = ctx.request.body.data
      const appId = ctx.request.body.appId

      const writeObj = { txid, signature, message, data, appId }
      console.log(`body data: ${JSON.stringify(writeObj, null, 2)}`)

      // const hash = await this.addEntry.addUserEntry(writeObj)
      const hash = await this.useCases.entry.addEntry.addUserEntry(writeObj)

      ctx.body = {
        success: true,
        hash
      }
    } catch (err) {
      // console.log('Error in post-entry.js/restController(): ', err)
      // throw err
      _this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /entry/all/:page Read All
   * @apiPermission public
   * @apiName P2WDB Read All
   * @apiGroup REST P2WDB
   *
   * @apiDescription
   * Read all the entries from the database. Results are paginated, with 20
   * entries per page. Most recent entries are served first.
   *
   *  This endpoint returns the following properties
   *
   *  - success : - Petition status
   *  - data : [] - Array of entries.
   *    - isValid: "" - Entry validation
   *    - appId: "" - App id associated
   *    - createdAt : - Creation time
   *    - _id : "" - Entry ID
   *    - hash : "" - Orbit DB hash
   *    - key: "" - Transaction ID
   *    - value : "" - Entry Data
   *
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/entry/all/0
   *
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *  {
   *     "success":true,
   *     "data":[
   *        {
   *           "isValid":true,
   *           "appId":"",
   *           "createdAt":1629350514655,
   *           "_id":"611dea72ad093c20042d238c",
   *           "hash":"zdpuAtvo53imGJ5DDe7LrZNRZihJsGj9Q7M3bxkaf2EdK4Kfb",
   *           "key":"9ac06c53c158430ea32a587fb4e2bc9e947b1d8c6ff1e4cc02afa40d522d7967",
   *           "value":{
   *              "message":"test",
   *              "signature":"H+TgPR/6Fxlo2uDb9UyQpWENBW1xtQvM2+etWlSmc+1kIeZtyw7HCsYMnf8X+EdP0E+CUJwP37HcpVLyKly2XKg=",
   *              "data":"This is the data that will go into the database."
   *           },
   *           "__v":0
   *        }
   *     ]
   *  }
   *
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async getAll (ctx) {
    try {
      const page = ctx.params.page
      // console.log('hash: ', hash)

      // Get all the contents of the P2WDB.
      const allData = await this.useCases.entry.readEntry.readAllEntries(page)

      ctx.body = {
        success: true,
        data: allData
      }
    } catch (err) {
      // console.log('Error in get-all.js/restController()')
      // throw err
      _this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /entry/appid/:appid/:page Read By App ID
   * @apiPermission public
   * @apiName P2WDB Read By App ID
   * @apiGroup REST P2WDB
   *
   * @apiDescription
   * Read paginated entries from the P2WDB, filtered by the appId. Newest
   * entries are served first.
   *
   * This endpoint returns the following properties
   *
   *  - success : - Petition status
   *  - data : [] - Array of entries.
   *    - isValid: "" - Entry validation
   *    - appId: "" - App id associated
   *    - createdAt : - Creation time
   *    - _id : "" - Entry ID
   *    - hash : "" - Orbit DB hash
   *    - key: "" - Transaction ID
   *    - value : "" - Entry Data
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/entry/appid/test/0
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *  {
   *     "success":true,
   *     "data":[
   *        {
   *           "isValid":true,
   *           "appId":"test",
   *           "createdAt":1629350514655,
   *           "_id":"611dea72ad093c20042d238c",
   *           "hash":"zdpuAtvo53imGJ5DDe7LrZNRZihJsGj9Q7M3bxkaf2EdK4Kfb",
   *           "key":"9ac06c53c158430ea32a587fb4e2bc9e947b1d8c6ff1e4cc02afa40d522d7967",
   *           "value":{
   *              "message":"test",
   *              "signature":"H+TgPR/6Fxlo2uDb9UyQpWENBW1xtQvM2+etWlSmc+1kIeZtyw7HCsYMnf8X+EdP0E+CUJwP37HcpVLyKly2XKg=",
   *              "data":"This is the data that will go into the database."
   *           },
   *           "__v":0
   *        }
   *     ]
   *  }
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async getByAppId (ctx) {
    try {
      const appId = ctx.params.appid
      const page = ctx.params.page
      // console.log(ctx.params)

      // Get all the contents of the P2WDB.
      const allData = await this.useCases.entry.readEntry.readByAppId(
        appId,
        page
      )

      ctx.body = {
        success: true,
        data: allData,
        page
      }
    } catch (err) {
      // console.log('Error in get-by-appid.js/restController(): ', err)
      // throw err
      _this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /entry/hash/:hash Read By Hash
   * @apiPermission public
   * @apiName P2WDB Read By Hash
   * @apiGroup REST P2WDB
   *
   * @apiDescription
   * Read an entry from the P2WDB if it matches the hash.
   *
   * This endpoint returns the following properties
   *
   *  - success : - Petition status
   *  - data : {} - Entry.
   *    - isValid: "" - Entry validation
   *    - appId: "" - App id associated
   *    - createdAt : - Creation time
   *    - _id : "" - Entry ID
   *    - hash : "" - Orbit DB hash
   *    - key: "" - Transaction ID
   *    - value : "" - Entry Data
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/entry/hash/zdpuAtvo53imGJ5DDe7LrZNRZihJsGj9Q7M3bxkaf2EdK4Kfb
   *
   * @apiSuccessExample {json} Success-Response:
   *     HTTP/1.1 200 OK
   *  {
   *     "success":true,
   *     "data":{
   *           "isValid":true,
   *           "appId":"",
   *           "createdAt":1629350514655,
   *           "_id":"611dea72ad093c20042d238c",
   *           "hash":"zdpuAtvo53imGJ5DDe7LrZNRZihJsGj9Q7M3bxkaf2EdK4Kfb",
   *           "key":"9ac06c53c158430ea32a587fb4e2bc9e947b1d8c6ff1e4cc02afa40d522d7967",
   *           "value":{
   *              "message":"test",
   *              "signature":"H+TgPR/6Fxlo2uDb9UyQpWENBW1xtQvM2+etWlSmc+1kIeZtyw7HCsYMnf8X+EdP0E+CUJwP37HcpVLyKly2XKg=",
   *              "data":"This is the data that will go into the database."
   *           },
   *           "__v":0
   *        }
   *  }
   *
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   *
   */
  async getByHash (ctx) {
    try {
      const hash = ctx.params.hash
      // console.log('hash: ', hash)

      // Get all the contents of the P2WDB.
      const allData = await this.useCases.entry.readEntry.readByHash(hash)

      ctx.body = {
        success: true,
        data: allData
      }
    } catch (err) {
      // console.log('Error in get-by-hash.js/restController(): ', err)
      // throw err
      _this.handleError(ctx, err)
    }
  }

  /**
   * @api {get} /entry/txid/:txid Read By TXID
   * @apiPermission public
   * @apiName P2WDB Read By TXID
   * @apiGroup REST P2WDB
   *
   * @apiDescription
   * Read an entry from the P2WDB if it matches the TXID.
   *
   *  This endpoint returns the following properties
   *
   *  - success : - Petition status
   *  - data : {} - Entry.
   *    - isValid: "" - Entry validation
   *    - appId: "" - App id associated
   *    - createdAt : - Creation time
   *    - _id : "" - Entry ID
   *    - hash : "" - Orbit DB hash
   *    - key: "" - Transaction ID
   *    - value : "" - Entry Data
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5001/entry/txid/9ac06c53c158430ea32a587fb4e2bc9e947b1d8c6ff1e4cc02afa40d522d7967
   *
   * @apiSuccessExample {json} Success-Response:
   *  HTTP/1.1 200 OK
   *  {
   *     "success":true,
   *     "data":{
   *           "isValid":true,
   *           "appId":"",
   *           "createdAt":1629350514655,
   *           "_id":"611dea72ad093c20042d238c",
   *           "hash":"zdpuAtvo53imGJ5DDe7LrZNRZihJsGj9Q7M3bxkaf2EdK4Kfb",
   *           "key":"9ac06c53c158430ea32a587fb4e2bc9e947b1d8c6ff1e4cc02afa40d522d7967",
   *           "value":{
   *              "message":"test",
   *              "signature":"H+TgPR/6Fxlo2uDb9UyQpWENBW1xtQvM2+etWlSmc+1kIeZtyw7HCsYMnf8X+EdP0E+CUJwP37HcpVLyKly2XKg=",
   *              "data":"This is the data that will go into the database."
   *           },
   *           "__v":0
   *        }
   *  }
   * @apiError UnprocessableEntity Missing required parameters
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 422 Unprocessable Entity
   *     {
   *       "status": 422,
   *       "error": "Unprocessable Entity"
   *     }
   */
  async getByTxid (ctx) {
    try {
      const txid = ctx.params.txid
      // console.log(ctx.params)

      // Get all the contents of the P2WDB.
      const allData = await this.useCases.entry.readEntry.readByTxid(txid)

      ctx.body = {
        success: true,
        data: allData
      }
    } catch (err) {
      // console.log('Error in get-by-txid.js/restController(): ', err)
      // throw err
      _this.handleError(ctx, err)
    }
  }

  // DRY error handler
  handleError (ctx, err) {
    // If an HTTP status is specified by the buisiness logic, use that.
    if (err.status) {
      if (err.message) {
        ctx.throw(err.status, err.message)
      } else {
        ctx.throw(err.status)
      }
    } else {
      wlogger.error(err)
      // By default use a 422 error if the HTTP status is not specified.
      ctx.throw(422, err.message)
    }
  }
}

module.exports = EntryRESTControllerLib
