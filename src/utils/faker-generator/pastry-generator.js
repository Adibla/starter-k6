import {randomIntBetween, randomItem, randomString, uuidv4} from "../../../vendor/k6-utils/1.1.0/index.js";

const generate_post_pastry_data = () => {
    return {
        "name": randomString(5),
        "description": randomString(5),
        "size": randomString(5),
        "price": randomIntBetween(18, 70),
        "status": randomItem("available", "unavailable"),
    }
}

const generate_conflict_post_pastry_data = () => {
    return {
        "name": "Already Exist",
        "description": randomString(5),
        "size": randomString(5),
        "price": randomIntBetween(18, 70),
        "status": randomItem("available", "unavailable"),
    }
}

const generate_patch_pastry_data = () => {
    return {
        "name": randomString(5),
        "description": randomString(5),
        "size": randomString(5),
        "price": randomIntBetween(18, 70),
        "status": randomItem("available", "unavailable"),
    }
}

export {
    generate_post_pastry_data,
    generate_conflict_post_pastry_data,
    generate_patch_pastry_data
}
