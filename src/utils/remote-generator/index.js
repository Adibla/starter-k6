import http from 'k6/http';

const load_entities = (base_data, {params, payload, url}) => {
    let res = http.post(url, payload, params);
    //check status and block execution if failed (skip by param)
    if(res.status === 200){
        const parsed_body = JSON.parse(res.body)
        return Object.assign({params: {seed_data: parsed_body}}, base_data)
    }
    throw new Error("Seed generation failed, tests will be stopped")
}

export {
    load_entities
}
