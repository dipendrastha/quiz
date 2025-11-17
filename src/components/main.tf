variable "test" {
    type = map(map(string))

    default = {
        dev = {
            s3_bucket = "test"
            abc = "abc"
        }
        qa = {
            s3_bucket = "qa"
        }
    }
}
var.test[var.env]

description = var.environment == "dev" ? "first" : "second"
