import { sleep } from 'k6';

import { pastry_test } from './scripts/pastry-controller.js';
import { generate_post_pastry_data } from "./utils/faker-generator/index.js";
import { load_entities } from "./utils/index.js";

// Parse __ENV and read values
const environment = {
    execution: __ENV.EXECUTION ? __ENV.EXECUTION : "local",
    options_set: __ENV.OPTIONS_SET ? __ENV.OPTIONS_SET : "load",
    test_includes: __ENV.TEST_INCLUDES ? __ENV.TEST_INCLUDES : false,
    test_excludes: __ENV.TEST_EXCLUDES ? __ENV.TEST_EXCLUDES : false,
    seed_on_run: __ENV.SEED_ON_RUN ? __ENV.SEED_ON_RUN : "pastry",
    existing_data_id: __ENV.EXISTING_DATA_ID ? __ENV.EXISTING_DATA_ID : "default_id"
};

if(!environment.seed_on_run && !environment.existing_data_id){
    // Seed data or existing id are required in order to prevent update failures
    console.warn("If you don't include existing id (EXISTING_DATA_ID) or generate seed on run (SEED_ON_RUN), some tests could fail")
}

let scripts = [  ...pastry_test ];

// Load k6 Run Options
let options_file = `../env/${environment.execution}/config.${environment.options_set}.json`;
export let options = JSON.parse(open(options_file));

// Load test settings
let data = JSON.parse(open(`../env/${environment.execution}/settings.json`));

data.environment = environment;

// Filter the tests to run, pass which to includes separated by |
if (environment.test_includes || Array.isArray(data.test_includes) && data.test_includes.length ){
    //Redo check in order to establish  which array to use, env variables have priority
    const tokens = environment.test_includes ? environment.test_includes.split('|') : data.test_includes;
    scripts = scripts.filter(script => {
        return tokens.includes(script.name);
    })
}

// Filter the tests to run, pass which to excludes separated by |
if (environment.test_excludes || Array.isArray(data.test_excludes) && data.test_excludes.length){
    //Redo check in order to establish  which array to use, env variables have priority
    const tokens = environment.test_excludes ? environment.test_excludes.split('|') : data.test_excludes;
    scripts = scripts.filter(script => {
        return !tokens.includes(script.name);
    })
}

export function setup() {
    // setup code
    if(environment.seed_on_run){
        const entity_to_generate_map = {
            pastry: {
                url: `${data.settings.base_url}${data.settings.prefix_path}${data.settings.pastry_path}`,
                fn: generate_post_pastry_data
            },
            default: {
                url: `${data.settings.base_url}${data.settings.prefix_path}${data.settings.pastry_path}`,
                fn: generate_post_pastry_data
            } //Use default config if not matching any of passed
        }
        const value_matched = entity_to_generate_map[environment.seed_on_run] || entity_to_generate_map['default']

        const load_params = {
            url: value_matched.url,
            payload: value_matched.fn(),
            params: {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        }
        return load_entities(data, load_params)
    }
    return Object.assign({ params: { existing_id: environment.existing_data_id }},data)
}
export default function (data) {
    // VU code
    scripts.forEach(t => { t(data); sleep(1); });
    sleep(1);
}
export function teardown(data) {
    // teardown code
}
