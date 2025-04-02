import * as documentation from 'documentation';
import * as esbuild from 'esbuild';

const esbuildOptions = [
    {
        minify: false,
        entryPoints: ['./index-core.js'],
        outfile: './dist/kQuery-core.js',
        keepNames: true,
    },
    {
        minify: true,
        entryPoints: ['./index-core.js'],
        outfile: './dist/kQuery-core.min.js',
        keepNames: true,
    },
    {
        minify: false,
        entryPoints: ['./index-full.js'],
        outfile: './dist/kQuery-full.js',
        keepNames: true,
    },
    {
        minify: true,
        entryPoints: ['./index-full.js'],
        outfile: './dist/kQuery-full.min.js',
        keepNames: true,
    },
];
for (const esbuildOption of esbuildOptions) {
    console.log(`build ${esbuildOption.outfile}`);
    esbuild.build(Object.assign({
        bundle: true,
        target: 'es2022',
        platform: 'browser',
        sourcemap: 'linked',
        define: {
            "import.meta": 'null',
        },
    }, esbuildOption))
        //.then((result) => console.log(result))
        .catch((error) => console.error(error))
    ;
}

console.log('build ./docs/index.html');
documentation.build(['./index-full.js'], {
    sortOrder: ['memberof', 'source'],
})
    .then(result => documentation.formats.html(result, {
        projectName: 'kQuery',
        theme: './bin/theme/index.js',
        output: './docs',
    }))
    .catch((error) => console.error(error))
;
