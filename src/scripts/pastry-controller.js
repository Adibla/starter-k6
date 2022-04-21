import http from 'k6/http';
import { check, group } from 'k6';
import { Rate } from "k6/metrics";

import {
    generate_post_pastry_data,
    generate_patch_pastry_data
} from "../utils/faker-generator/index.js";

export let pastry_test = [
    create_pastry,
    update_pastry,
    get_pastry
];

export let errorRate = new Rate("errors");

function create_pastry (data) {
    group('Should Create Pastry with Success', () => {
        const url = `${data.settings.base_url}${data.settings.prefix_path}${data.settings.pastry_path}`;
        const payload = JSON.stringify(generate_post_pastry_data());

        const params = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        let res = http.post(url, payload, params);
        let success = check(res, {"is status 200": (r) => r.status === 200});
        !success ? errorRate.add(true) : null;
    });

    group('Should not Create Pastry with Conflict', () => {
        const url = `${data.settings.base_url}${data.settings.prefix_path}${data.settings.pastry_path}?response_type=409`; // Only for Microcks mock 409
        const payload = JSON.stringify(generate_post_pastry_data());

        const params = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        let res = http.post(url, payload, params);
        let success = check(res, {"is status 409": (r) => r.status === 409});
        if(!success){
            console.log(JSON.stringify(res))
        }
        !success ? errorRate.add(true) : null;
    });
}

function update_pastry (data) {
    group('Update Pastry with Success', () => {
        const url = `${data.settings.base_url}${data.settings.prefix_path}${data.settings.pastry_path}/${data.params.seed_data.id}`;
        const payload = JSON.stringify(generate_patch_pastry_data());

        const params = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        let res = http.patch(url, payload, params);
        let success = check(res, {"is status 200": (r) => r.status === 200});
        !success ? errorRate.add(true) : null;
    });
    group('Update Pastry with Not Found', () => {
        const url = `${data.settings.base_url}${data.settings.prefix_path}${data.settings.pastry_path}/Unknown`;
        const payload = JSON.stringify(generate_patch_pastry_data());

        const params = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        let res = http.patch(url, payload, params);
        let success = check(res, {"is status 404": (r) => r.status === 404});
        !success ? errorRate.add(true) : null;
    });
}

function get_pastry (data) {
    group('Get Pastry with Success', () => {
        const url = `${data.settings.base_url}${data.settings.prefix_path}${data.settings.pastry_path}/${data.params.seed_data.id}`;

        let res = http.get(url);
        let success = check(res, {"is status 200": (r) => r.status === 200});
        !success ? errorRate.add(true) : null;
    });

    group('Get Pastry with Not Found', () => {
        const url = `${data.settings.base_url}${data.settings.prefix_path}${data.settings.pastry_path}/Unknown`;

        let res = http.get(url);
        let success = check(res, {"is status 404": (r) => r.status === 404});
        !success ? errorRate.add(true) : null;
    });
}
