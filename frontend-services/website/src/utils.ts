import path from "path";
import fs from "fs";

import { Response } from "express";

export function template_resolution(base_path: string, sub_path: string, default_language: string) {
    return async (filename:string, language?: string)=>{
        if(!language) language=default_language;
        filename=await find_language_suffixed_files(path.join(base_path, sub_path, filename), language, default_language, '.html');
        return path.relative(base_path, filename);
    }
}

export async function find_language_suffixed_files(filename: string, language: string, default_language: string = 'en', overwrite_extension?: string) {
    let ext_name = path.extname(filename);
    let basename = ext_name.length>0?filename.slice(0, -ext_name.length):filename;
    if (basename.endsWith('.')) basename = basename.slice(0, -1);
    if (overwrite_extension) ext_name = overwrite_extension;
    if (!ext_name.startsWith('.')) ext_name = '.' + ext_name;

    const possible_filenames = [basename + '_' + language + ext_name, basename + '_' + default_language + ext_name, basename + ext_name];
    for (const filename of possible_filenames) {
        if (fs.existsSync(filename)) {
            return filename;
        }
    }
    
    throw new Error('Could not find file ' + filename);
}


export function renderPageInit(content_path: string, default_language: string){
    const page_resolution = template_resolution(content_path+'/templates', 'pages', default_language);
    return async function renderPage(page:string, language: string, res:Response) {
        try {
            const page_template = await page_resolution(page, language);
            res.render(page_template, { language });
        } catch (e) {
            const page_template = await page_resolution("404", language);
            res.render(page_template, { language });
        }
    }
}
