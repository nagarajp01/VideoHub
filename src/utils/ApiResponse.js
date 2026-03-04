class ApiResponse{
    constructor(
        statuscode,
        data,
        message="Success"

){
    this.statuscode=statuscode,
    this.data=data,
    this.message=message,
    this.success=statuscode<400
}

}

export {ApiResponse}










// class ApiResponse {
//     constructor(statusCode, data, message = "Success"){
//         this.statusCode = statusCode
//         this.data = data
//         this.message = message
//         this.success = statusCode < 400
//     }
// }

// export { ApiResponse }