

const rootDir = new URL("../../", import.meta.url);



function root(p = './') {
    return new URL(p, rootDir);
}


function core(p = './') {
    return new URL(`core/${p}`, rootDir);
}


function prompts(p = './') {
    return new URL(`core/prompts/${p}`, rootDir);
}


function data(p = './') {
    return new URL(`.data/${p}`, rootDir);
}




export const paths = {
    data,
    prompts,
    core,
    root
}
